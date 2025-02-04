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
		const markdownString = new MarkdownString('', true);
		markdownString.supportHtml = true;
		markdownString.isTrusted = true;
		markdownString.appendMarkdown(`# ![Image](https://raw.githubusercontent.com/npm/logos/refs/heads/master/npm%20square/npm-16.png)`);
		markdownString.appendMarkdown('\n\n');
		markdownString.appendMarkdown(`## [$(globe)](command:${installPackageCommandId}?[true] "Install Global")`);
		markdownString.appendMarkdown('\n\n');
		markdownString.appendMarkdown(`## [$(folder-opened)](command:${installPackageCommandId}?[false] "Install Local")`);
		markdownString.appendMarkdown('\n---\n');

		markdownString.appendMarkdown(`# ![Image](https://raw.githubusercontent.com/npm/logos/refs/heads/master/npm%20square/npm-16.png)`);
		markdownString.appendMarkdown('\n\n');
		markdownString.appendMarkdown(`## [$(globe)](command:${installPackageCommandId}?[true] "Install Global")`);
		markdownString.appendMarkdown('\n\n');
		markdownString.appendMarkdown(`## [$(folder-opened)](command:${installPackageCommandId}?[false] "Install Local")`);

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
		const tooltip = new MarkdownString('', true);
		tooltip.supportHtml = true;
		tooltip.isTrusted = true;
		const logo = '![Image](https://raw.githubusercontent.com/npm/logos/refs/heads/master/npm%20square/npm-16.png)';
		const bun = '![Image](icons/bun.png)';
		const installLocal = '[$(folder-opened)](command:${installPackageCommandId}?[false] "Install Local")';
		const installGlobal = '[$(globe)](command:${installPackageCommandId}?[true] "Install Global")';
		tooltip.appendMarkdown(`| <h1>${logo}</h1> | <h1>&nbsp;&nbsp;</h1> | <h1>${bun}</h1> |\n`);
		tooltip.appendMarkdown(`| ------- | ------- | ------- |\n`);
		tooltip.appendMarkdown(`| <h1>${installLocal}</h1> | <h1>&nbsp;&nbsp;</h1> | <h1>${installLocal}</h1> |\n`);
		tooltip.appendMarkdown(`| <h1>${installGlobal}</h1> | <h1>&nbsp;&nbsp;</h1> | <h1>${installGlobal}</h1> |\n`);
		const listPackageStatusBarItem = createStatusBarItem(
			'$(list-tree) List',
			tooltip,
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