import { MarkdownString, StatusBarAlignment, commands, window } from 'vscode';
import { installPackage, removePackage } from './package-manager';
import { toggleTerminal } from './terminal';


const toggleTerminalCommandId = 'PackageManagerTools.ToggleTerminal';
const installPackageCommandId = 'PackageManagerTools.InstallPackage';
const removePackageCommandId = 'PackageManagerTools.RemovePackage';
const listPackageCommandId = 'PackageManagerTools.ListPackage';

export function createStatusBarItems(subscriptions: { dispose(): any }[]) {

	addTerminal();
	addInstall();
	addRemove();
	addList();


	function addTerminal() {
		const terminalStatusBarItem = createStatusBarItem(
			'$(terminal) Terminal',
			'Toggle Terminal',
			toggleTerminalCommandId,
			1
		);
		subscriptions.push(terminalStatusBarItem);
		terminalStatusBarItem.show();
		commands.registerCommand(toggleTerminalCommandId, toggleTerminal);
	}

	function addInstall() {
		const markdownString = new MarkdownString();
		markdownString.supportHtml = true;
		markdownString.isTrusted = true;
		markdownString.appendMarkdown(`[Install Package](command:${installPackageCommandId}?[false])\n---`);
		markdownString.appendMarkdown('\n---\n');
		markdownString.appendMarkdown(`[Install Global Package](command:${installPackageCommandId}?[true])\n---`);

		const installPackageStatusBarItem = createStatusBarItem(
			'$(archive) Install',
			markdownString,
			installPackageCommandId, 2
		);
		subscriptions.push(installPackageStatusBarItem);
		installPackageStatusBarItem.show();

		commands.registerCommand(installPackageCommandId, installPackage);
	}

	function addRemove() {
		const removePackageStatusBarItem = createStatusBarItem(
			'$(trash) Remove',
			new MarkdownString('[Remove Package](command:PackageManagerTools.RemovePackage)'),
			removePackageCommandId, 3
		);
		subscriptions.push(removePackageStatusBarItem);
		removePackageStatusBarItem.show();

		commands.registerCommand(removePackageCommandId, removePackage);
	}

	function addList() {
		const listPackageStatusBarItem = createStatusBarItem(
			'$(list-tree) List',
			'List Packages',
			listPackageCommandId, 3
		);
		subscriptions.push(listPackageStatusBarItem);
		listPackageStatusBarItem.show();

		commands.registerCommand(listPackageCommandId, removePackage);
	}
}

function createStatusBarItem(text: string, tooltip: string|MarkdownString, command: string, priority: number) {
	const terminalStatusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 2001 - priority);
	terminalStatusBarItem.text = text;
	terminalStatusBarItem.tooltip = tooltip;
	terminalStatusBarItem.command = command;
	return terminalStatusBarItem;
}