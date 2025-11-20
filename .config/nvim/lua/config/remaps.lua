-- Key remaps

vim.keymap.set("i", "jk", "<Esc>")

-- Window navigation with Ctrl+h/j/k/l
vim.keymap.set("n", "<C-h>", "<C-w>h", { desc = "Move to left window" })
vim.keymap.set("n", "<C-j>", "<C-w>j", { desc = "Move to window below" })
vim.keymap.set("n", "<C-k>", "<C-w>k", { desc = "Move to window above" })
vim.keymap.set("n", "<C-l>", "<C-w>l", { desc = "Move to right window" })

-- Tab navigation
vim.keymap.set("n", "<C-t>", ":tabnext<CR>", { desc = "Go to next tab" })

-- Custom keymap to copy to system clipboard
vim.keymap.set('n', '<leader>y', '"+y', { desc = 'Copy to system clipboard' })
vim.keymap.set('v', '<leader>y', '"+y', { desc = 'Copy to system clipboard' })
vim.keymap.set('n', '<C-y>', ":!echo % | pbcopy<CR><CR>:echo 'filepath copied!'<CR>", { desc = 'Copy filepath to system clipboard' })
vim.keymap.set('v', '<C-y>', ":!echo % | pbcopy<CR><CR>:echo 'filepath copied!'<CR>", { desc = 'Copy filepath to system clipboard' })

-- LSP code actions
vim.keymap.set('n', '<leader>ca', vim.lsp.buf.code_action, { desc = 'Code actions' })

-- Highlight yanked selections
vim.api.nvim_create_autocmd("TextYankPost", {
  desc = "Highlights text when yanking",
  group = vim.api.nvim_create_augroup("kickstart-highlight-yank", { clear = true }),
  callback = function()
    vim.highlight.on_yank()
  end,
})

