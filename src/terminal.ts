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

export function newTerminal() {
	const newTerm = window.createTerminal();
	newTerm.show();
	commands.executeCommand('workbench.action.terminal.focus');
	return newTerm;
}

function getTerminal() { return window.activeTerminal || window.createTerminal(); }
