import { StatusBarAlignment, StatusBarItem, commands, window } from 'vscode';
import { installAllPackages } from './package-manager';


const openTerminalCommandId = 'PackageManagerTools.OpenTerminal';
const installAllCommandId = 'PackageManagerTools.InstallAll';

export function createStatusBarItems(subscriptions: { dispose(): any }[], npm: boolean, pnpm: boolean, bun: boolean, multiple: boolean) {

	const terminalStatusBarItem = createStatusBarItem(
		'$(terminal-powershell) Open Terminal',
		'Open Terminal',
		openTerminalCommandId
	);
	subscriptions.push(terminalStatusBarItem);
	terminalStatusBarItem.show();

	if (npm) {

	}
	const installAllStatusBarItem = createStatusBarItem(
		'$(feedback) Install All',
		'Install All',
		installAllCommandId
	);
	subscriptions.push(installAllStatusBarItem);
	installAllStatusBarItem.show();



	commands.registerCommand(openTerminalCommandId, openTerminal);
	commands.registerCommand(installAllCommandId, installAllPackages);
}

function openTerminal() {
	if (window.activeTerminal) window.activeTerminal.show();
	else window.createTerminal();
	commands.executeCommand('workbench.action.terminal.focus');
}

function createStatusBarItem(text: string, tooltip?: string, command?: string): StatusBarItem {
	const terminalStatusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 1001);
	terminalStatusBarItem.text = text;
	terminalStatusBarItem.tooltip = tooltip;
	terminalStatusBarItem.command = command;
	return terminalStatusBarItem;
}