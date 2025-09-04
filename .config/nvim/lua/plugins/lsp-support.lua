return {
    "neovim/nvim-lspconfig",
    dependencies = {
        { "mason-org/mason.nvim", opts = {} },
        { "mason-org/mason-lspconfig.nvim", opts = {} },
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
      vim.diagnostic.config {
        severity_sort = true,
        float = { border = 'rounded' },
        underline = { severity = vim.diagnostic.severity.ERROR },
        signs = {
          text = {
            [vim.diagnostic.severity.ERROR] = '󰅚 ',
            [vim.diagnostic.severity.WARN] = '󰀪 ',
            [vim.diagnostic.severity.INFO] = '󰋽 ',
            [vim.diagnostic.severity.HINT] = '󰌶 ',
          },
        },
        virtual_text = false,
      }
    end,
}
