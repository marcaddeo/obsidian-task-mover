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

		new Setting(containerEl)
			.setName('Destination Notes')
			.setDesc('Configure which notes will be available as quick move targets.')
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
				.addSearch((callback) => {
					new FileSuggest(this.app, callback.inputEl);
					callback.setPlaceholder('Note')
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
				.addExtraButton((callback) => {
					callback.setIcon('cross')
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
