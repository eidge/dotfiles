/**
 * Path Guard Extension
 *
 * Intercepts tool_call events and prompts for user approval when a file path
 * outside the current working directory is detected.
 *
 * Covers:
 *  - read, write, edit: checks event.input.path directly
 *  - bash: heuristic extraction of paths from the command string
 *
 * Maintains a session-scoped allowlist so the user isn't prompted repeatedly
 * for the same directory tree.
 */

import path from "node:path";
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import fs from "node:fs";
import { isToolCallEventType, getAgentDir } from "@mariozechner/pi-coding-agent";

/** Resolve the pi package installation directory from process.argv[1]. */
function resolvePackageDir(): string {
  const mainScript = process.argv[1];
  if (!mainScript) return "";
  // pi's entry is typically <package-dir>/dist/main.js — walk up to find package root
  let dir = path.resolve(path.dirname(mainScript));
  while (dir !== path.dirname(dir)) {
    const pkgPath = path.join(dir, "package.json");
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
        if (pkg.name === "@mariozechner/pi-coding-agent") return dir;
      } catch { /* ignore parse errors */ }
    }
    dir = path.dirname(dir);
  }
  return "";
}

/** Built-in tools we know how to inspect for path safety. */
const KNOWN_TOOLS = new Set(["read", "write", "edit", "bash"]);

export default function (pi: ExtensionAPI) {
  // Session-scoped set of directory prefixes the user has approved.
  let allowedDirs: Set<string> = new Set();

  // Session-scoped set of tool names the user has approved.
  let allowedTools: Set<string> = new Set();

  // Reset the allowlists whenever a session starts (new or resumed).
  pi.on("session_start", async (_event, ctx) => {
    allowedDirs = new Set([
      path.normalize(getAgentDir()),
      path.normalize(path.resolve(ctx.cwd, ".pi")),
      path.normalize(resolvePackageDir()),
      "/tmp",
    ]);
    allowedTools = new Set();
  });

  // ── Helpers ──────────────────────────────────────────────────────────

  /** Strip a leading @ that some models prepend to path arguments. */
  function stripAt(p: string): string {
    return p.startsWith("@") ? p.slice(1) : p;
  }

  /** Resolve a potentially relative path against cwd and normalise it. */
  function resolvePath(filePath: string, cwd: string): string {
    const cleaned = stripAt(filePath);
    return path.normalize(path.resolve(cwd, cleaned));
  }

  /** Returns true when `resolved` sits outside `cwd`. */
  function isOutside(resolved: string, cwd: string): boolean {
    const normalCwd = path.normalize(cwd);
    // Equal to cwd itself is fine.
    if (resolved === normalCwd) return false;
    // Must be under cwd + separator.
    return !resolved.startsWith(normalCwd + path.sep);
  }

  /** Check whether a resolved path is covered by the allowlist. */
  function isAllowed(resolved: string): boolean {
    for (const dir of allowedDirs) {
      if (resolved === dir || resolved.startsWith(dir + path.sep)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Best-effort extraction of file-path-looking tokens from a bash command.
   *
   * Catches:
   *   - Absolute paths   /foo/bar
   *   - ../ escapes       ../../something
   *   - ~/…  paths        ~/Documents/secret
   *
   * Does NOT catch paths hidden behind variable expansion, subshells, etc.
   */
  function extractPathsFromCommand(command: string): string[] {
    const tokens: string[] = [];

    // Absolute paths (must start with / and have at least one more char).
    const absRegex = /(?:^|\s)(\/[^\s;|&><"']+)/g;
    let match: RegExpExecArray | null;
    while ((match = absRegex.exec(command)) !== null) {
      tokens.push(match[1]);
    }

    // Relative paths that escape upward: ../ or ../../ etc.
    const relRegex = /(?:^|\s)(\.\.\/[^\s;|&><"']*)/g;
    while ((match = relRegex.exec(command)) !== null) {
      tokens.push(match[1]);
    }

    // ~/… paths – expand to $HOME.
    const home = process.env.HOME ?? process.env.USERPROFILE ?? "";
    const tildeRegex = /(?:^|\s)(~\/[^\s;|&><"']*)/g;
    while ((match = tildeRegex.exec(command)) !== null) {
      tokens.push(match[1].replace("~", home));
    }

    return tokens;
  }

  // ── Prompt logic ────────────────────────────────────────────────────

  /**
   * Prompt the user about an outside path.
   * Returns true if the action should proceed, false to block.
   */
  async function promptForPath(
    resolved: string,
    toolName: string,
    ctx: Parameters<Parameters<typeof pi.on<"tool_call">>[1]>[1],
  ): Promise<boolean> {
    if (!ctx.hasUI) {
      return false; // Block in non-interactive mode.
    }

    const dir = path.dirname(resolved);
    const display = resolved.replace(process.env.HOME ?? "", "~");

    const choice = await ctx.ui.select(
      `⚠️  ${toolName} targets a path outside the working directory:\n\n` +
        `  ${display}\n\n` +
        `Allow this access?`,
      ["Allow once", `Allow directory "${path.basename(dir)}" for this session`, "Block"],
    );

  if (choice === "Allow once") {
    return true;
  }

  if (choice?.startsWith("Allow directory")) {
    allowedDirs.add(dir);
    return true;
  }

  return false; // Block (explicit choice or Escape).
  }

  // ── Event handler ───────────────────────────────────────────────────

  pi.on("tool_call", async (event, ctx) => {
    const cwd = ctx.cwd;

    // -- Unknown tools: prompt before allowing execution --------------

    if (!KNOWN_TOOLS.has(event.toolName) && !allowedTools.has(event.toolName)) {
      if (!ctx.hasUI) {
        return {
          block: true,
          reason: `Blocked: unknown tool "${event.toolName}" (no UI for confirmation).`,
        };
      }

      const inputPreview = JSON.stringify(event.input, null, 2);
      const shortPreview = inputPreview.length > 300 ? inputPreview.slice(0, 297) + "..." : inputPreview;

      const choice = await ctx.ui.select(
        `⚠️  Unknown tool "${event.toolName}" invoked:\n\n` +
          `  ${shortPreview}\n\n` +
          `Allow this tool to run?`,
        ["Allow once", `Allow "${event.toolName}" for this session`, "Block"],
      );

      if (choice === "Allow once") {
        // fall through to return undefined at the end
      } else if (choice?.startsWith("Allow")) {
        allowedTools.add(event.toolName);
      } else {
        return { block: true, reason: `Blocked by user: unknown tool "${event.toolName}".` };
      }

      return undefined;
    }

    // -- read / write / edit: direct path check -----------------------

    if (
      isToolCallEventType("read", event) ||
      isToolCallEventType("write", event) ||
    isToolCallEventType("edit", event)
    ) {
      const filePath: string | undefined = (event.input as Record<string, unknown>).path as string | undefined;
      if (!filePath) return undefined;

      const resolved = resolvePath(filePath, cwd);

      if (isOutside(resolved, cwd) && !isAllowed(resolved)) {
        if (!ctx.hasUI) {
          return {
            block: true,
            reason: `Blocked: ${event.toolName} targets "${resolved}" which is outside the working directory (no UI for confirmation).`,
          };
        }

        const allowed = await promptForPath(resolved, event.toolName, ctx);
        if (!allowed) {
          return { block: true, reason: `Blocked by user: path "${resolved}" is outside the working directory.` };
        }
      }

      return undefined;
    }

    // -- bash: heuristic path extraction ------------------------------

    if (isToolCallEventType("bash", event)) {
      const command = event.input.command;
      if (!command) return undefined;

      const paths = extractPathsFromCommand(command);
      const outsidePaths: string[] = [];

      for (const p of paths) {
        const resolved = resolvePath(p, cwd);
        if (isOutside(resolved, cwd) && !isAllowed(resolved)) {
          outsidePaths.push(resolved);
        }
      }

      if (outsidePaths.length === 0) return undefined;

      if (!ctx.hasUI) {
        return {
          block: true,
          reason: `Blocked: bash command references paths outside the working directory: ${outsidePaths.join(", ")} (no UI for confirmation).`,
        };
      }

      const display = outsidePaths.map((p) => p.replace(process.env.HOME ?? "", "~")).join("\n  ");
      const shortCmd = command.length > 120 ? command.slice(0, 117) + "..." : command;

      const choice = await ctx.ui.select(
        `⚠️  bash command references paths outside the working directory:\n\n` +
          `  $ ${shortCmd}\n\n` +
          `  Detected outside paths:\n  ${display}\n\n` +
          `Allow this command?`,
        ["Allow once", "Allow all detected directories for this session", "Block"],
      );

      if (choice === "Allow once") {
        return undefined;
      }

      if (choice === "Allow all detected directories for this session") {
        for (const p of outsidePaths) {
          allowedDirs.add(path.dirname(p));
        }
        return undefined;
      }

      return { block: true, reason: `Blocked by user: bash command references paths outside the working directory.` };
    }

    return undefined;
  });
}
