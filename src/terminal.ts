import { commands, window, } from 'vscode';


export function toggleTerminal() {
	const toggle = window?.activeTerminal?.dispose ?? showTerminal;
	toggle();
}

export function showTerminal() {

	const terminal = getTerminal();
	terminal.show();
	commands.executeCommand('workbench.action.terminal.focus');

	return terminal;

}

function getTerminal() { return window.activeTerminal || window.createTerminal(); }
