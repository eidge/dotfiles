import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { isToolCallEventType, DynamicBorder } from "@mariozechner/pi-coding-agent";
import { Container, Text, Spacer, matchesKey } from "@mariozechner/pi-tui";

export default function (pi: ExtensionAPI) {
  const filesRead = new Set<string>();
  const filesWritten = new Set<string>();
  const bashCommands: string[] = [];

  function resetAndRestore(ctx: { sessionManager: { getBranch(): any[] } }) {
    filesRead.clear();
    filesWritten.clear();
    bashCommands.length = 0;

    for (const entry of ctx.sessionManager.getBranch()) {
      if (entry.type !== "message" || !entry.message) continue;
      const msg = entry.message as any;

      if (msg.role === "toolResult" && msg.details) {
        if (msg.toolName === "read" && msg.details.path) {
          filesRead.add(msg.details.path);
        }
        if ((msg.toolName === "write" || msg.toolName === "edit") && msg.details.path) {
          filesWritten.add(msg.details.path);
        }
        if (msg.toolName === "bash" && msg.details.command) {
          bashCommands.push(msg.details.command);
        }
      }
    }
  }

  // Restore state from session history on start/reload
  pi.on("session_start", async (_event, ctx) => resetAndRestore(ctx));

  // Reset (and re-populate) state on /new or /resume
  pi.on("session_switch", async (_event, ctx) => resetAndRestore(ctx));

  // Track tool calls in real-time
  pi.on("tool_call", async (event) => {
    if (isToolCallEventType("read", event)) {
      filesRead.add(event.input.path);
    }
    if (isToolCallEventType("write", event)) {
      filesWritten.add(event.input.path);
    }
    if (isToolCallEventType("edit", event)) {
      filesWritten.add(event.input.path);
    }
    if (isToolCallEventType("bash", event)) {
      bashCommands.push(event.input.command);
    }
  });

  // Register /summary command
  pi.registerCommand("summary", {
    description: "Show a summary of files written and bash commands run in this session",
    handler: async (_args, ctx) => {
      await ctx.ui.custom((_tui, theme, _kb, done) => {
        const container = new Container();
        const border = new DynamicBorder((s: string) => theme.fg("accent", s));

        container.addChild(border);
        container.addChild(new Text(theme.fg("accent", theme.bold("Session Summary")), 1, 0));
        container.addChild(new Spacer(1));

        // Files Read section
        container.addChild(new Text(theme.fg("warning", theme.bold("Files Read")), 1, 0));
        if (filesRead.size === 0) {
          container.addChild(new Text(theme.fg("dim", "  (none)"), 1, 0));
        } else {
          for (const file of filesRead) {
            container.addChild(new Text(theme.fg("accent", "  • ") + theme.fg("text", file), 1, 0));
          }
        }

        container.addChild(new Spacer(1));

        // Files Written section
        container.addChild(new Text(theme.fg("warning", theme.bold("Files Written")), 1, 0));
        if (filesWritten.size === 0) {
          container.addChild(new Text(theme.fg("dim", "  (none)"), 1, 0));
        } else {
          for (const file of filesWritten) {
            container.addChild(new Text(theme.fg("success", "  • ") + theme.fg("text", file), 1, 0));
          }
        }

        container.addChild(new Spacer(1));

        // Bash Commands section
        container.addChild(new Text(theme.fg("warning", theme.bold("Bash Commands")), 1, 0));
        if (bashCommands.length === 0) {
          container.addChild(new Text(theme.fg("dim", "  (none)"), 1, 0));
        } else {
          for (const cmd of bashCommands) {
            container.addChild(new Text(theme.fg("muted", "  $ ") + theme.fg("text", cmd), 1, 0));
          }
        }

        container.addChild(new Spacer(1));
        container.addChild(new Text(theme.fg("dim", "Press Enter or Esc to close"), 1, 0));
        container.addChild(border);

        return {
          render: (width: number) => container.render(width),
          invalidate: () => container.invalidate(),
          handleInput: (data: string) => {
            if (matchesKey(data, "enter") || matchesKey(data, "escape")) {
              done(undefined);
            }
          },
        };
      });
    },
  });
}
