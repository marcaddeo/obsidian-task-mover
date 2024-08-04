import { Editor, MarkdownView, Plugin, TFile } from 'obsidian';
import { TaskMoverPluginSettings } from './Settings/settings';
import { TaskMoverSettingsTab } from './Settings/TaskMoverSettingsTab'
import { DEFAULT_SETTINGS } from 'types';
import { taskMoverApiV1 } from './Api';
import { TaskMoverApiV1 } from './Api/TaskMoverApiV1';

export default class TaskMoverPlugin extends Plugin {
	settings: TaskMoverPluginSettings;

	get apiV1(): TaskMoverApiV1 {
		return taskMoverApiV1(this.app);
	}

	async onload() {
		await this.loadSettings();

		// Add a 'Move Task to ___' command for each destination note.
		this.settings.destinationNotes.forEach((destination: string, index: Number) => {
			this.addCommand({
				// @TODO this should have a slug for the destination note instead.
				id: `task-mover-move-task-to-${index}`,
				name: `Move task to ${destination.name}`,
				editorCallback: (editor: Editor, view: MarkdownView) => {
					const file: TFile = app.vault.getFileByPath(destination.path);
					this.apiV1.moveTaskToNote(view, file);
				}
			});
		})

		this.addSettingTab(new TaskMoverSettingsTab(this.app, this));
	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
