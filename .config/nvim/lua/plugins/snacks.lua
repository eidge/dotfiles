return {
  "folke/snacks.nvim",
  priority = 1000,
  lazy = false,
  keys = {
    { "gd", function() Snacks.picker.lsp_definitions() end, desc = "Goto Definition" },
    { "gD", function() Snacks.picker.lsp_declarations() end, desc = "Goto Declaration" },
    { "gr", function() Snacks.picker.lsp_references() end, nowait = true, desc = "References" },
    { "gI", function() Snacks.picker.lsp_implementations() end, desc = "Goto Implementation" },
    { "gy", function() Snacks.picker.lsp_type_definitions() end, desc = "Goto T[y]pe Definition" },
    { "gs", function() Snacks.picker.lsp_symbols() end, desc = "LSP Symbols" },
    { "<leader>d", function() Snacks.picker.diagnostics() end, desc = "Open diagnostics" },
    { "<leader>/", function() Snacks.terminal.toggle("zsh") end, "Toggle terminal" },
    { "<leader>/", function() Snacks.terminal.toggle("zsh") end, "Toggle terminal", mode="t" },
    { "<leader>l", function() Snacks.terminal.toggle("~/.claude/local/claude") end, "Toggle claude" },
    { "<leader>l", function() Snacks.terminal.toggle("~/.claude/local/claude") end, "Toggle claude", mode="t" },
    { "jk", [[<C-\><C-n>]], "Normal mode in terminal", mode="t" },
  },
  opts = {
    dashboard = {
      enabled = true,
      example = "compact_files",
    },
  },
}
