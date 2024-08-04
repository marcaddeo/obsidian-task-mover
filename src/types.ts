export interface DestinationNote {
	path: string;
	name: string;
	showInEditorContextMenu: boolean;
}

export interface TaskMoverPluginSettings {
	destinationNotes: Array<DestinationNote>;
}

export const DEFAULT_SETTINGS: TaskMoverPluginSettings = {
	destinationNotes: [],
}
