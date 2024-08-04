import { Editor, MarkdownView, Plugin, TFile } from 'obsidian';
import GithubSlugger from 'github-slugger'
import { TaskMoverPluginSettings } from './Settings/settings';
import { TaskMoverSettingsTab } from './Settings/TaskMoverSettingsTab'
import { DEFAULT_SETTINGS } from 'types';
import { taskMoverApiV1 } from './Api';
import { TaskMoverApiV1 } from './Api/TaskMoverApiV1';

export default class TaskMoverPlugin extends Plugin {
	settings: TaskMoverPluginSettings;
	slugger: GithubSlugger;

	get apiV1(): TaskMoverApiV1 {
		return taskMoverApiV1(this.app);
	}

	async onload() {
		await this.loadSettings();

		this.slugger = new GithubSlugger();

		// Add a 'Move Task to ___' command for each destination note.
		this.settings.destinationNotes.forEach((destination: string, index: Number) => {
			const slug = this.slugger.slug(destination.name);

			this.addCommand({
				id: `move-task-to-${slug}`,
				name: `Move task to ${destination.name} (MTT ${destination.name})`,
				editorCallback: (editor: Editor, view: MarkdownView) => {
					const file: TFile = app.vault.getFileByPath(destination.path);
					this.apiV1.moveTaskToNote(view, file);
				}
			});
		})

		this.registerEvent(this.app.workspace.on('editor-menu', (menu) => {
			const destinations = this.settings.destinationNotes
				.filter((destination) => destination.showInEditorContextMenu);
			if (!destinations.length) {
				return;
			}

			menu.addSeparator();
			for (const destination of destinations) {
				menu.addItem((item) => {
					item
						.setTitle(`Move task to ${destination.name}`)
						.onClick(async () => {
							const view: MarkdownView = this.app.workspace
								.getActiveViewOfType(MarkdownView);
							const file: TFile = this.app.vault
								.getFileByPath(destination.path);
							this.apiV1.moveTaskToNote(view, file);
						});
				});
			}
		}))

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
