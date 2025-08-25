# My Dotfiles

## Requirements

- brew
	- aerospace
	- ghostty
	- stow

## Setup

```
> cd ~ && git clone https://github.com/eidge/dotfiles
> cd dotfiles
> scripts/setup
```

### Aerospace

- Disable per-screen spaces: `defaults write com.apple.spaces spans-displays -bool true && killall SystemUIServer`
- Fix small windows in mission control: `defaults write com.apple.dock expose-group-apps -bool true && killall Dock`

## To do

- git config
- ghostty
- nvim
- script to install dependencies
- push to github


