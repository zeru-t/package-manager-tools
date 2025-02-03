import { ExtensionContext, StatusBarAlignment, commands, window } from 'vscode';

export function activate({ subscriptions }: ExtensionContext) {

	const terminalStatusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 1001);
	terminalStatusBarItem.text = '$(terminal-powershell) Open Terminal';
	terminalStatusBarItem.tooltip = 'Open Terminal';
	terminalStatusBarItem.command = 'PackageManagerTools.OpenTerminal';
	subscriptions.push(terminalStatusBarItem);
	terminalStatusBarItem.show();

	commands.registerCommand('PackageManagerTools.OpenTerminal', () => {
		if (window.activeTerminal)
			window.activeTerminal.show();
		else
			window.createTerminal();
		commands.executeCommand('workbench.action.terminal.focus');
	});
}

export function deactivate() {}
