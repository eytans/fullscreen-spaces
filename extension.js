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
        this._previousWorkspace = {};
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

        this._previousWorkspace[win.get_id()] = global.workspace_manager.get_active_workspace_index();
        
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
        let previous = this._previousWorkspace[windowId];
        
        if (previous == null || previous === undefined) {
            return;
        }

        delete this._previousWorkspace[windowId];

        // Move window back to original workspace
        win.change_workspace_by_index(previous, true);
        
        // Activate the original workspace
        let previousWorkspace = global.workspace_manager.get_workspace_by_index(previous);
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
                let display = global.display;
                if (!act.meta_window) return;
                
                // Check if window is on primary monitor
                let win = act.meta_window;
                if (display.get_primary_monitor() !== win.get_monitor()) return;

                if (change === Meta.SizeChange.FULLSCREEN) {
                    this.maximize(act);
                } else if (change === Meta.SizeChange.UNFULLSCREEN) {
                    this.unmaximize(act);
                }
            })
        );

        this._handles.push(
            global.window_manager.connect('destroy', (_, act) => {
                if (act.meta_window && this._previousWorkspace[act.meta_window.get_id()]) {
                    this.unmaximize(act);
                }
            })
        );
    }

    disable() {
        this._handles.forEach(handle => {
            if (handle) {
                global.window_manager.disconnect(handle);
            }
        });
        this._handles = [];
        this._previousWorkspace = {};
    }
});

export default class FullscreenSpaces {
    constructor() {
        return new Extension();
    }
}