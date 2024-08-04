import type { App, TFile } from 'obsidian';
import { MarkdownView } from 'obsidian';
import type { TaskMoverApiV1 } from './TaskMoverApiV1';
import { moveTaskToNote } from './moveTaskToNote'

export const taskMoverApiV1 = (app: App): TaskMoverApiV1 => {
	return {
		moveTaskToNote: async (view: MarkdownView, destination: TFile): Promise<void> => {
			return moveTaskToNote(app, view, destination);
		}
	};
}
