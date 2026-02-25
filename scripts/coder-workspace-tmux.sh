#!/usr/bin/env bash
# Patches tmux status-left to prepend a coder workspace segment before the icon.
# Run after TPM/ukiyo theme loads.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
workspace=$("$SCRIPT_DIR/coder-workspace.sh")

if [ -z "$workspace" ]; then
  exit 0
fi

# Theme colors (kanagawa/wave)
RED='#e46876'      # wave_red (error)
BAR_BG='#223249'   # wave_blue_1 (bg-bar)
TEXT='#363646'      # sumi_ink_3 (bg_pane)
SEP=$'\ue0b0'      # powerline right-pointing arrow

# Get current status-left from ukiyo
current=$(tmux show-option -gv status-left)

# Prepend: [red segment] → [existing icon segment]
# The existing status-left starts with the icon colors (prefix-conditional fg/bg).
# We prepend: #[fg=TEXT,bg=RED] workspace #[fg=RED,bg=ICON_BG]<sep>
# But the icon bg is conditional on prefix state (alert vs accent).
# So we use tmux conditional format for the arrow fg→icon_bg transition:
#   #{?client_prefix,#[fg=RED,bg=ALERT],#[fg=RED,bg=ACCENT]}<sep>
ALERT='#ff9e3b'    # ronin_yellow
ACCENT='#938aa9'   # spring_violet_1

prefix="#[fg=${TEXT},bg=${RED}] coder: ${workspace} #{?client_prefix,#[fg=${RED}]#[bg=${ALERT}],#[fg=${RED}]#[bg=${ACCENT}]}${SEP}"

# Remove the existing icon opening colors since our prefix ends with the right bg set
# The current starts with: #{?client_prefix,#[fg=X],#[fg=X]}#{?client_prefix,#[bg=ALERT],#[bg=ACCENT]}
# We've already set the bg in our trailing arrow, so we just need the fg from the icon.
# Simplest: just prepend our segment and let the icon re-set its own colors.
tmux set-option -g status-left "${prefix}${current}"
