import type { App, TFile } from 'obsidian';
import { normalizePath, MarkdownView, Notice } from 'obsidian';
import { customAlphabet } from 'nanoid';

function* taskToFileLineStringWithChildren(task: object): Generator<string> {
	yield task.toFileLineString();

	for (const child: object of task.children) {
		yield* taskToFileLineStringWithChildren(child);
	}
}

/**
 * Move the task under the cursor to the end of the destination file.
 */
export const moveTaskToNote = async (app: App, view: MarkdownView, destination: TFile): Promise<void> => {
	const activeFilePath: string = view.getFile().path;
	const lineNumber: number = view.editor.getCursor().line;

	// Find the current task under the cursor.
	const tasks: Array<object> = app.plugins.plugins['obsidian-tasks-plugin'].getTasks();
	const task: object = tasks[tasks.findIndex(t => t.file.path === activeFilePath && t.lineNumber === lineNumber)];
	if (!task) {
		new Notice('Error finding task on current line');
		return;
	}
	
	const normalizedPath: string = await normalizePath(destination.path);
	const backlinkRef: string = customAlphabet('abcdefghijklmnopqrstuvwz0123456789', 6)();

	// Generate markdown to append to destination file.
	let taskStrings: Array<string> = [...taskToFileLineStringWithChildren(task)];
	// Remove the first level of indentation from every task.
	taskStrings = taskStrings.map(taskString => taskString.replace(task.indentation, ''));
	// Append the backlink reference onto the first task in the list.
	taskStrings[0] = `${taskStrings[0]} ^${backlinkRef}`;

	// Append task(s) to destination file.
	await app.vault.adapter.append(normalizedPath, ['', ...taskStrings].join('\n'));

	// Construct a backlink to the parent task in the destination file.
	const linktext: string = app.metadataCache.fileToLinktext(destination, normalizedPath);
	const backLink: string = `${task.indentation}${task.listMarker} [[${linktext}#^${backlinkRef}|${task.description}]]\n`;

	// Replace tasks(s) on current line with the backlink to the task(s) in the destination file.
	view.editor.replaceRange(
		backLink,
		{ line: lineNumber, ch: 0 },
		{ line: (task.children.length ? task.children.at(-1).lineNumber : lineNumber) + 1, ch: 0 }
	);
};
