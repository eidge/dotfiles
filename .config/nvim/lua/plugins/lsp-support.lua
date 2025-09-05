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
    end,
}
