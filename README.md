# Obsidian Task Mover

This is a small plugin to allow tasks to easily be moved from one note to
another.

This plugin will function on the task that is currently under your cursor. When
a task is moved, the task in the original note is converted into a block link
to the task in the destination.

## Commands

Two types of commands are provided:

### Move Task To ... (MTTF)

This will open a fuzzy file suggester to pick a destination to move the task
under the cursor to.

### Move Task to ___ (MTT ___)

These commands are configured in the settings page to allow to have some
default quick destinations to be able to move the task under the cursor to.

In settings, you'll choose a Destination Note and have the option to
enable/disable also showing these commands in the editor context menu for
tasks. Each Destination Note can have it's name customized, and that name is
what will show in place of `___` in the command name.
