import { Editor, MarkdownView, Plugin, TFile } from 'obsidian';
import GithubSlugger from 'github-slugger'
import { TaskMoverPluginSettings } from './Settings/settings';
import { TaskMoverSettingsTab } from './Settings/TaskMoverSettingsTab'
import { DEFAULT_SETTINGS, type DestinationNote } from 'types';
import { taskMoverApiV1 } from './Api';
import { TaskMoverApiV1 } from './Api/TaskMoverApiV1';
import { getTaskUnderCursor } from './Api/moveTaskToNote';
import GenericSuggester from './ui/GenericSuggester';

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
		this.settings.destinationNotes.forEach((destination: DestinationNote, index: Number) => {
			const slug = this.slugger.slug(destination.name);

			this.addCommand({
				id: `move-task-to-${slug}`,
				name: `Move task to ${destination.name} (MTT ${destination.name})`,
				editorCheckCallback: (checking: boolean, editor: Editor, view: MarkdownView): boolean =>  {
					const task = getTaskUnderCursor(this.app, view);
					
					if (task) {
						if (!checking) {
							this.moveTaskToNoteDestination(destination, view);
						}

						return true;
					}

					return false;
				}
			});
		})

		this.addCommand({
			id: 'move-task-to-file',
			name: 'Move task to ... (MTTF)',
			editorCheckCallback: (checking: boolean, editor: Editor, view: MarkdownView): boolean => {
				if (getTaskUnderCursor(this.app, view)) {
					if (!checking) {
						this.moveTaskToNoteWithFuzzySuggester(view);
					}

					return true;
				}

				return false;
			}
		});

		this.registerEvent(this.app.workspace.on('editor-menu', (menu) => {
			const view: MarkdownView = this.app.workspace
				.getActiveViewOfType(MarkdownView);

			if (!getTaskUnderCursor(this.app, view)) return;

			const destinations = this.settings.destinationNotes
				.filter((destination) => destination.showInEditorContextMenu);
			if (!destinations.length) {
				return;
			}

			menu.addSeparator();

			menu.addItem((item) => {
				item
					.setTitle('Move task to ...')
					.onClick(() => {
						this.moveTaskToNoteWithFuzzySuggester(view);
					});
			});

			for (const destination of destinations) {
				menu.addItem((item) => {
					item
						.setTitle(`Move task to ${destination.name}`)
						.onClick(() => {
							this.moveTaskToNoteDestination(destination, view);
						});
				});
			}
		}))

		this.addSettingTab(new TaskMoverSettingsTab(this.app, this));
	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData(),
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	private moveTaskToNoteWithFuzzySuggester(view: MarkdownView) {
		const currentFile = this.app.workspace.getActiveFile();
		const files: TFile[] = this.app.vault.getMarkdownFiles();
		GenericSuggester.Suggest(
			this.app,
			files.map(file => {
				const link = this.app.fileManager.generateMarkdownLink(
					file,
					currentFile.path
				);
				return link.substring(2, link.length - 2);
			}),
			files,
		)
		.then(file => this.apiV1.moveTaskToNote(view, file))
		.catch(e => {});
	}

	private moveTaskToNoteDestination(destination: DestinationNote, view: MarkdownView) {
		const file: TFile = this.app.vault
			.getFileByPath(destination.path);
		this.apiV1.moveTaskToNote(view, file);
	}
}
