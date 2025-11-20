return {
    "neovim/nvim-lspconfig",
    dependencies = {
        { "mason-org/mason.nvim", opts = {} },
        { 
          "mason-org/mason-lspconfig.nvim",
          opts = {
            ensure_installed = { "vtsls", "eslint", "sorbet" }
          }
        },
    },
    lazy = false,
    keys = {
      {
        "<leader>cd",
        function()
          vim.diagnostic.open_float()
        end,
        mode = {'n'},
        desc = "Line Diagnostics",
      },
    },
    config = function()
      lsp = require("lspconfig");

      vim.lsp.config('vtsls', {
        settings = {
          typescript = {
            tsserver = {
              maxTsServerMemory = 24576,
              nodePath = "/usr/local/bin/node"
            },
          },
        },
        filetypes = { 'typescript', 'javascript', 'javascriptreact', 'typescriptreact', 'vue' },
      })
    end,
}
