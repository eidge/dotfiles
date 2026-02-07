return {
  "ibhagwan/fzf-lua",
  dependencies = { "nvim-tree/nvim-web-devicons" },
  keys = {
    {
      '<C-p>',
      function()
        require('fzf-lua').global()
      end,
      mode = {'n'},
      desc = 'Find files or symbols',
    },
    {
      '<C-f>',
      function()
        require('fzf-lua').live_grep()
      end,
      mode = {'n'},
      desc = 'Search text in files',
    },
  },
  opts = {
    grep = {
      rg_opts = "--column --line-number --no-heading --color=always --smart-case --max-columns=4096 --hidden -e",
    }
  }
}
