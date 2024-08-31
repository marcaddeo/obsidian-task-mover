import { type App, type TFile, normalizePath, MarkdownView, Notice } from 'obsidian';
import { customAlphabet } from 'nanoid';
import type { Task } from '../types';

declare module 'obsidian' {
	interface App {
		plugins: {
			plugins: Record<string, {
				getTasks: () => Task[];
			}>
		};
	}
}

/**
 * Convert a task to file line string, including its child tasks.
 *
 * @param task The task to convert to file line strings
 */
function* taskToFileLineStringWithChildren(task: Task): Generator<string> {
	yield task.toFileLineString();

	for (const child of task.children) {
		yield* taskToFileLineStringWithChildren(child);
	}
}

/**
 * Get the task currently under the cursor.
 *
 * @param app The Obsidian app
 * @param view The current markdown view
 *
 * @return The task under the cursor, or null if there is not one.
 */
export const getTaskUnderCursor = function (app: App, view: MarkdownView): Task | null {
	const activeFilePath = view.file?.path;
	if (!activeFilePath) return null;

	const lineNumber: number = view.editor.getCursor().line;

	// Find the current task under the cursor.
	const tasks: Array<Task> = app.plugins.plugins['obsidian-tasks-plugin'].getTasks();
	return tasks[tasks.findIndex(t => t.file.path === activeFilePath && t.lineNumber === lineNumber)] ?? null;
}

/**
 * Move the task under the cursor to the destination note, leaving a block
 * link to the destination task in it's place.
 *
 * @param view The current markdown MarkdownView
 * @param destination The destination file to move the task to.
 */
export const moveTaskToNote = async (app: App, view: MarkdownView, destination: TFile) => {
	const task = getTaskUnderCursor(app, view);
	if (!task) {
		new Notice('Error finding task on current line');
		return;
	}
	
	const normalizedPath = await normalizePath(destination.path);
	const destinationFile = app.vault.getFileByPath(normalizedPath);
	if (!destinationFile) {
		new Notice('There was an error getting the destination note path')
		return;
	}

	const blockLinkRef = customAlphabet('abcdefghijklmnopqrstuvwz0123456789', 6)();
	// Append the block link reference onto the original task.
	task.blockLink = ` ^${blockLinkRef}`;

	// Generate markdown to append to destination file.
	let taskStrings: Array<string> = [...taskToFileLineStringWithChildren(task)];
	// Remove the first level of indentation from every task.
	taskStrings = taskStrings.map(taskString => taskString.replace(task.indentation, ''));

	// Append task(s) to destination file.
	await app.vault.append(destinationFile, ['', ...taskStrings].join('\n'));

	// Construct a block link to the parent task in the destination file.
	const linktext: string = app.metadataCache.fileToLinktext(destination, normalizedPath);
	const blockLink = `${task.indentation}${task.listMarker} [[${linktext}#^${blockLinkRef}|${task.description}]]\n`;

	// Replace tasks(s) on current line with the block link to the task(s) in the destination file.
	const lineNumber: number = view.editor.getCursor().line;
	view.editor.replaceRange(
		blockLink,
		{ line: lineNumber, ch: 0 },
		{ line: (task.children.length ? (task.children.at(-1) as Task).lineNumber : lineNumber) + 1, ch: 0 }
	);
};
