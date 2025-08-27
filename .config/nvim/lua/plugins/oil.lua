return {
  'stevearc/oil.nvim',
  dependencies = { { "echasnovski/mini.icons", opts = {} } },
  opts = {},
  keys = {
    {
      '<leader>n',
      function()
        require('oil').open_float()
      end,
      mode = {'n'},
      desc = 'Open Oil',
      remap = true,
    },
  },
  lazy = false,
}
