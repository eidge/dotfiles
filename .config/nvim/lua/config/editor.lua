-- Editor properties

vim.opt.tabstop = 2
vim.opt.softtabstop = 2
vim.opt.shiftwidth = 2
vim.opt.expandtab = true
vim.opt.autoindent = true
vim.opt.smartindent = true
vim.opt.smarttab = true
vim.opt.list = true
vim.opt.listchars = "tab:>-,trail:.,extends:>,precedes:<"

vim.opt.number = true
vim.opt.relativenumber = false
-- Show cursorline only on active buffer
vim.opt.cursorline = false
vim.cmd([[
  augroup CursorLine
      au!
      au VimEnter,WinEnter,BufWinEnter * setlocal cursorline
      au WinLeave * setlocal nocursorline
  augroup END
]])
vim.opt.signcolumn = "yes:1"
vim.opt.scrolloff = 8
vim.opt.showcmd = true

vim.opt.swapfile = false
vim.opt.backup = false
vim.opt.undodir = os.getenv("HOME") .. "/nvim/undodir"
vim.opt.undofile = true

vim.opt.hlsearch = true
vim.opt.incsearch = true
vim.opt.ignorecase = true
vim.opt.smartcase =true

vim.opt.termguicolors = true

vim.opt.showmode = false
vim.opt.hidden = false

-- Automatically reload files changed outside of vim
vim.opt.autoread = true
vim.cmd([[
  augroup AutoReload
    autocmd!
    autocmd FocusGained,BufEnter,CursorHold,CursorHoldI *
          \ if mode() !~ '\v(c|r.?|!|t)' && getcmdwintype() == '' | checktime | endif
    autocmd FileChangedShellPost *
          \ echohl WarningMsg | echo "File changed on disk. Buffer reloaded." | echohl None
  augroup END
]])
