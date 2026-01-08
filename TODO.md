# TODO: GNOME Shell 49 Compatibility Upgrade

## Version Compatibility Issues
- [ ] Update `metadata.json` to include GNOME Shell 49 in `shell-version` array
- [ ] Research GNOME Shell API changes between version 47 and 49
  - Check official GNOME Shell extension documentation: https://gjs.guide/extensions/
  - Review migration guide: https://gjs.guide/extensions/upgrading/gnome-shell-49.html
  - Check GNOME GitLab for breaking changes: https://gitlab.gnome.org/GNOME/gnome-shell/-/blob/main/NEWS

## API Verification
- [ ] Verify `Meta.SizeChange.FULLSCREEN` / `UNFULLSCREEN` enum values are still valid in Shell 49
- [ ] Check `global.window_manager` event handling compatibility
- [ ] Confirm `global.workspace_manager` API remains unchanged
- [ ] Test `Meta.WindowType.NORMAL` enum value
- [ ] Verify `change_workspace_by_index()` method signature

## Multi-Monitor Support
- [ ] Remove or make configurable the primary monitor restriction (line 86 in `extension.js`)
- [ ] Add handling for monitor configuration changes
- [ ] Test behavior when external monitors are connected/disconnected
- [ ] Consider tracking which monitor a window was fullscreened on

## Testing Checklist
- [ ] Test extension installation on GNOME Shell 49
- [ ] Verify fullscreen → new workspace behavior
- [ ] Verify unfullscreen → return to original workspace behavior
- [ ] Test with multiple monitors (if multi-monitor support added)
- [ ] Test monitor disconnect/reconnect scenarios
- [ ] Verify workspace cleanup (empty workspace removal)
- [ ] Test extension disable/enable cycle

## Documentation
- [ ] Update README.md with supported GNOME Shell versions
- [ ] Document multi-monitor behavior (or limitations)
- [ ] Add installation troubleshooting section
