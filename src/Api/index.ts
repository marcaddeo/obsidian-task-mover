import { type App, type TFile, MarkdownView } from 'obsidian';
import type { TaskMoverApiV1 } from './TaskMoverApiV1';
import { moveTaskToNote } from './moveTaskToNote'

/**
 * Factory method for API v1
 *
 * @param app The obsidian app
 */
export const taskMoverApiV1 = (app: App): TaskMoverApiV1 => {
  return {
    moveTaskToNote: async (view: MarkdownView, destination: TFile): Promise<void> => {
      return moveTaskToNote(app, view, destination);
    }
  };
}
