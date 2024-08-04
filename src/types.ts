export interface DestinationNote {
	path: string,
	name: string,
}

export interface TaskMoverPluginSettings {
	destinationNotes: Array<DestinationNote>
}

export const DEFAULT_SETTINGS: TaskMoverPluginSettings = {
	destinationNotes: [],
}
