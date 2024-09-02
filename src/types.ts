import type { TFile } from "obsidian";

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

// An incomplete representation of a Task from the Tasks plugin.
export interface Task {
  toFileLineString: () => string;
  children: Task[];
  file: TFile;
  lineNumber: number;
  blockLink: string;
  indentation: string;
  listMarker: string;
  description: string;
}
