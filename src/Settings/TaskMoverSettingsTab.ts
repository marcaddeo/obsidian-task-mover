import { debounce, App, PluginSettingTab, Setting } from 'obsidian';
import { TaskMoverPlugin } from '../main';
import { FileSuggest } from '../ui/FileSuggest';

export class TaskMoverSettingsTab extends PluginSettingTab {
	plugin: TaskMoverPlugin;

	constructor(app: App, plugin: TaskMoverPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
		this.containerEl.addClass('task-mover-settings');

		containerEl.createEl('h1', { text: 'Task Mover Settings' });

		containerEl.createEl('p', {
			text: 'Task Mover will add commands to the command palette, and optionally the editor context menu, to move tasks to each destination note entered below.' ,
		});
		containerEl.createEl('p', {
			text: 'When a Task Mover command is executed, the task currently under the cursor and any child tasks will be moved to the bottom of the selected Destination Note.',
		});
		containerEl.createEl('p', {
			text: 'When a task is moved, a backlink to the moved task is left in its place.',
		});

		new Setting(containerEl)
			.setName('Destination Notes')
			.setDesc('Configure which notes will be available as move destinations. The Destination Name field can be overridden to customize the move command in the palette. Each Desination Note can optionally be displayed in the editor context menu as well.')
			.addButton((button: ButtonComponent) => {
				button
					.setTooltip('Add destination note')
					.setButtonText('+')
					.setCta()
					.onClick(async () => {
						this.plugin.settings.destinationNotes.push({} as DestinationNote);
						await this.plugin.saveSettings();
						return this.display();
					})
			});

		this.plugin.settings.destinationNotes.forEach((destination, index) => {
			new Setting(containerEl)
				.setClass('task-mover-destination-note-container')
				.addSearch((search) => {
					new FileSuggest(this.app, search.inputEl);
					search.setPlaceholder('Note')
						.setValue(destination.path)
						.onChange(async (path: string) => {
							const original: DestinationNote = this.plugin.settings.destinationNotes[index];
							const name: string = original.name?.length ? original.name : app.vault.getFileByPath(path).basename;

							this.plugin.settings.destinationNotes[index] =
								{ ...original, ...{ path: path, name: name } };

							await this.plugin.saveSettings();
							return this.display();
						})
				})
				.addText((text) => {
					text
						.setPlaceholder('Destination Name')
						.setValue(this.plugin.settings.destinationNotes[index].name)
						.onChange(debounce(async (name: string) => {
							const original: DestinationNote = this.plugin.settings.destinationNotes[index];

							this.plugin.settings.destinationNotes[index] =
							{ ...original, ...{ name: name } };

							await this.plugin.saveSettings();
						}), 250, true)
				})
				.addToggle((toggle) => {
					toggle
						.setTooltip('Show in editor context menu')
						.setValue(this.plugin.settings.destinationNotes[index].showInEditorContextMenu)
						.onChange(async (showInEditorContextMenu) => {
							this.plugin.settings.destinationNotes[index].showInEditorContextMenu = showInEditorContextMenu;
							await this.plugin.saveSettings();
						})
					;
				})
				.addExtraButton((button) => {
					button
						.setIcon('cross')
						.setTooltip('Delete')
						.onClick(async () => {
							this.plugin.settings.destinationNotes.splice(index, 1);
							await this.plugin.saveSettings();
							this.display();
						});
				});
		});
	}
}
