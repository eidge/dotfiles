return {
  "hrsh7th/nvim-cmp",
  opts = {},
  dependencies = {
    "hrsh7th/cmp-nvim-lsp",
  },
  config = function()
    local cmp = require('cmp')


    cmp.setup({
      mapping = cmp.mapping.preset.insert({
        ['<CR>'] = cmp.mapping(function(fallback)
          if cmp.visible() then
            cmp.confirm({
              select = true,
            })
          else
            fallback()
          end
        end),

        ["<Tab>"] = cmp.mapping(function(fallback)
          if cmp.visible() then
            cmp.select_next_item()
          else
            fallback()
          end
        end, { "i", "s" }),

        ["<S-Tab>"] = cmp.mapping(function(fallback)
          if cmp.visible() then
            cmp.select_prev_item()
          else
            fallback()
          end
        end, { "i", "s" }),

      }),
      sources = cmp.config.sources({
        { name = "nvim_lsp" },
        { name = "buffer" }
      }),
    })
  end;
}
