import type { App, TFile } from 'obsidian';
import { MarkdownView } from 'obsidian';

/**
 * Task Mover API v1 interface
 */
export interface TaskMoverApiV1 {
	/**
	 *
	 */
	moveTaskToNote: async (view: MarkdownView, destination: TFile): Promise<void>;
}
