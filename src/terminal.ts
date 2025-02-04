import { commands, window, } from 'vscode';


export function toggleTerminal() {
	if (window.activeTerminal) window.activeTerminal.show();
	else window.createTerminal();
	commands.executeCommand('workbench.action.terminal.focus');
}
