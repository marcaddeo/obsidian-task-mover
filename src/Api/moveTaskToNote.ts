import type { App, TFile } from 'obsidian';
import { normalizePath, MarkdownView, Notice } from 'obsidian';
import { customAlphabet } from 'nanoid';

function* taskToFileLineStringWithChildren(task: object): Generator<string> {
	yield task.toFileLineString();

	for (const child: object of task.children) {
		yield* taskToFileLineStringWithChildren(child);
	}
}

export const getTaskUnderCursor = function (app: App, view: MarkdownView): object | null {
	const activeFilePath: string = view.getFile().path;
	const lineNumber: number = view.editor.getCursor().line;

	// Find the current task under the cursor.
	const tasks: Array<object> = app.plugins.plugins['obsidian-tasks-plugin'].getTasks();
	return tasks[tasks.findIndex(t => t.file.path === activeFilePath && t.lineNumber === lineNumber)] ?? null;
}

/**
 * Move the task under the cursor to the end of the destination file.
 */
export const moveTaskToNote = async (app: App, view: MarkdownView, destination: TFile): Promise<void> => {
	const task = getTaskUnderCursor(app, view);
	if (!task) {
		new Notice('Error finding task on current line');
		return;
	}
	
	const normalizedPath: string = await normalizePath(destination.path);
	const blockLinkRef: string = customAlphabet('abcdefghijklmnopqrstuvwz0123456789', 6)();
	// Append the block link reference onto the original task.
	task.blockLink = ` ^${blockLinkRef}`;

	// Generate markdown to append to destination file.
	let taskStrings: Array<string> = [...taskToFileLineStringWithChildren(task)];
	// Remove the first level of indentation from every task.
	taskStrings = taskStrings.map(taskString => taskString.replace(task.indentation, ''));

	// Append task(s) to destination file.
	await app.vault.append(
		app.vault.getFileByPath(normalizedPath),
		['', ...taskStrings].join('\n')
	);

	// Construct a block link to the parent task in the destination file.
	const linktext: string = app.metadataCache.fileToLinktext(destination, normalizedPath);
	const blockLink: string = `${task.indentation}${task.listMarker} [[${linktext}#^${blockLinkRef}|${task.description}]]\n`;

	// Replace tasks(s) on current line with the block link to the task(s) in the destination file.
	const lineNumber: number = view.editor.getCursor().line;
	view.editor.replaceRange(
		blockLink,
		{ line: lineNumber, ch: 0 },
		{ line: (task.children.length ? task.children.at(-1).lineNumber : lineNumber) + 1, ch: 0 }
	);
};
