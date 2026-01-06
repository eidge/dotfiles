return {
  "eidge/charta.nvim",
  dependencies = { "nvim-lua/plenary.nvim" },
  opts = {},
  keys = {
    { "<leader>a", function() require("charta").add_bookmark() end, mode = {"n", "v"}, desc = "Add bookmark to Charta" },
    { "<leader>h", function() require("charta").open_charta() end, mode = {"n", "v"}, desc = "Open charta" },
  }
}
