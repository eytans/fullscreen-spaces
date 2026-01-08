import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import St from 'gi://St';
import Meta from 'gi://Meta';

const Extension = GObject.registerClass({
    GTypeName: 'FullscreenSpaces',
    Properties: {
        
    },
}, class Extension extends GObject.Object {
    constructor(constructProperties = {}) {
        super(constructProperties);
        this._handles = [];
        // Store both the previous workspace index and the monitor the window was on
        this._windowState = {};
    }

    maximize(act) {
        const win = act.meta_window;
        if (win.get_window_type() !== Meta.WindowType.NORMAL) {
            return;
        }

        // If the current workspace doesn't have any other windows make it maximized here
        if (global.workspace_manager.get_active_workspace().list_windows().length === 1) {
            return;
        }

        const windowId = win.get_id();
        
        // Store both the previous workspace and the monitor the window is on
        this._windowState[windowId] = {
            workspace: global.workspace_manager.get_active_workspace_index(),
            monitor: win.get_monitor(),
        };
        
        // Create new workspace if needed
        let lastworkspace = global.workspace_manager.n_workspaces - 1;
        if (lastworkspace < 0) {
            lastworkspace = 0;
        }

        // Move window to new workspace
        win.change_workspace_by_index(lastworkspace, true);
        
        // Activate the new workspace
        let workspace = global.workspace_manager.get_workspace_by_index(lastworkspace);
        if (workspace) {
            workspace.activate(global.get_current_time());
        }
    }

    unmaximize(act) {
        const win = act.meta_window;
        if (win.get_window_type() !== Meta.WindowType.NORMAL) {
            return;
        }

        const windowId = win.get_id();
        const state = this._windowState[windowId];
        
        if (state == null) {
            return;
        }

        delete this._windowState[windowId];

        // Move window back to original workspace
        win.change_workspace_by_index(state.workspace, true);
        
        // Activate the original workspace
        let previousWorkspace = global.workspace_manager.get_workspace_by_index(state.workspace);
        if (previousWorkspace) {
            previousWorkspace.activate(global.get_current_time());
        }

        // Remove the empty fullscreen workspace if it's the last one
        let fullScreenWorkspace = global.workspace_manager.get_active_workspace();
        if (fullScreenWorkspace && fullScreenWorkspace.list_windows().length === 0) {
            global.workspace_manager.remove_workspace(fullScreenWorkspace, global.get_current_time());
        }
    }

    enable() {
        this._handles.push(
            global.window_manager.connect('size-change', (_, act, change) => {
                if (!act.meta_window) return;

                if (change === Meta.SizeChange.FULLSCREEN) {
                    this.maximize(act);
                } else if (change === Meta.SizeChange.UNFULLSCREEN) {
                    this.unmaximize(act);
                }
            })
        );

        this._handles.push(
            global.window_manager.connect('destroy', (_, act) => {
                if (act.meta_window && this._windowState[act.meta_window.get_id()]) {
                    this.unmaximize(act);
                }
            })
        );

        // Handle monitor configuration changes (connect/disconnect)
        this._monitorChangedId = global.display.connect('monitors-changed', () => {
            this._onMonitorsChanged();
        });
    }

    _onMonitorsChanged() {
        // When monitors change, clean up state for windows that may have moved
        // to different monitors or whose original monitor no longer exists
        const numMonitors = global.display.get_n_monitors();
        
        for (const windowId in this._windowState) {
            const state = this._windowState[windowId];
            // If the stored monitor index is now out of bounds, 
            // update it to a valid monitor (primary)
            if (state.monitor >= numMonitors) {
                state.monitor = global.display.get_primary_monitor();
            }
        }
    }

    disable() {
        this._handles.forEach(handle => {
            if (handle) {
                global.window_manager.disconnect(handle);
            }
        });
        this._handles = [];
        
        if (this._monitorChangedId) {
            global.display.disconnect(this._monitorChangedId);
            this._monitorChangedId = null;
        }
        
        this._windowState = {};
    }
});

export default class FullscreenSpaces {
    constructor() {
        return new Extension();
    }
}