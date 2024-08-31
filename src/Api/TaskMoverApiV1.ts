import type { App, TFile } from 'obsidian';
import { MarkdownView } from 'obsidian';

/**
 * Task Mover API v1 interface
 */
export interface TaskMoverApiV1 {
	/**
	 * Move the task under the cursor to the destination note, leaving a block
	 * link to the destination task in it's place.
	 *
	 * @param view The current markdown MarkdownView
	 * @param destination The destination file to move the task to.
	 */
	moveTaskToNote: async (view: MarkdownView, destination: TFile);
}
