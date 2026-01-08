# fullscreen-spaces
A gnome-shell extension to create and manage workspaces for fullscreen apps

## Supported GNOME Shell Versions
- GNOME Shell 47
- GNOME Shell 48
- GNOME Shell 49

## Features
- Automatically moves fullscreen windows to a dedicated workspace
- Returns windows to their original workspace when exiting fullscreen
- Multi-monitor support: works on all monitors (not just primary)
- Handles monitor connect/disconnect events gracefully
- Cleans up empty workspaces after unfullscreen

## Installation

### From GNOME Extensions Website
Visit [extensions.gnome.org](https://extensions.gnome.org/) and search for "Fullscreen Spaces"

### Manual Installation
1. Clone this repository to `~/.local/share/gnome-shell/extensions/fullscreen-space@singher.co.il`
2. Restart GNOME Shell (log out and back in on Wayland, or press Alt+F2 and type `r` on X11)
3. Enable the extension using GNOME Extensions app or `gnome-extensions enable fullscreen-space@singher.co.il`

## Troubleshooting

### Extension doesn't appear in Extensions app
- Ensure the extension is installed in the correct directory
- Check that `metadata.json` contains your GNOME Shell version in `shell-version`
- Restart GNOME Shell after installation

### Windows not moving to new workspace
- The extension only moves windows when there are other windows on the current workspace
- Only normal windows (not dialogs or system windows) are affected

### Multi-monitor behavior
- The extension works on all monitors
- When a monitor is disconnected, the extension gracefully handles windows that were fullscreened on that monitor
