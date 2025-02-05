import { MarkdownString, StatusBarAlignment, commands, window } from 'vscode';
import { getPackageManagerNames, installPackage, removePackage } from './package-manager';
import { toggleTerminal } from './terminal';


const toggleTerminalCommandId = 'PackageManagerTools.ToggleTerminal';
const installPackageCommandId = 'PackageManagerTools.InstallPackage';
const removePackageCommandId = 'PackageManagerTools.RemovePackage';
const listPackageCommandId = 'PackageManagerTools.ListPackage';

export async function createStatusBarItems(subscriptions: { dispose(): any }[]) {

	const packageManagers = await getPackageManagerNames();

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
		const iconDir = 'https://raw.githubusercontent.com/zeru-t/package-manager-tools/refs/heads/main/icons/';
		const installLocal = `# [$(folder-opened)](command:${installPackageCommandId}?[false] "Install Local")&nbsp;&nbsp;`;
		const installGlobal = `<h2>[![Image](https://raw.githubusercontent.com/zeru-t/package-manager-tools/refs/heads/main/icons/npm.png)](command:${installPackageCommandId}?[true] "Install Global")&nbsp;&nbsp;</h2>`;

		const npm = '<h1>![Image](https://raw.githubusercontent.com/zeru-t/package-manager-tools/refs/heads/main/icons/npm.png "npm")&nbsp;&nbsp;</h1>';
		const pnpm = '<h1>![Image](https://raw.githubusercontent.com/zeru-t/package-manager-tools/refs/heads/main/icons/pnpm.png "pnpm")&nbsp;&nbsp;</h1>';
		const bun = '<h1>![Image](https://raw.githubusercontent.com/zeru-t/package-manager-tools/refs/heads/main/icons/bun.png "bun")&nbsp;&nbsp;</h1>';

		const tooltip = new MarkdownString(
			`[![Image](https://raw.githubusercontent.com/zeru-t/package-manager-tools/refs/heads/main/icons/npm.png)](command:${installPackageCommandId}?[true])`,
			true);
		tooltip.supportHtml = true;
		tooltip.isTrusted = true;
		//packageManagers.forEach(addItem);
		//tooltip.appendMarkdown(`| ${npm}  | ${installLocal} | ${installGlobal} |\n`);
		//tooltip.appendMarkdown('| ------- | --------------- | ---------------- |\n');
		//tooltip.appendMarkdown('\n---\n');
		//tooltip.appendMarkdown(`| ${pnpm} | ${installLocal} | ${installGlobal} |\n`);
		//tooltip.appendMarkdown('| ------- | --------------- | ---------------- |\n');
		//tooltip.appendMarkdown('\n---\n');
		//tooltip.appendMarkdown(`| ${bun}  | ${installLocal} | ${installGlobal} |\n`);
		//tooltip.appendMarkdown('| ------- | --------------- | ---------------- |\n');

		const installPackageStatusBarItem = createStatusBarItem(
			'$(archive) Install',
			tooltip,
			installPackageCommandId, 2
		);
		subscriptions.push(installPackageStatusBarItem);
		installPackageStatusBarItem.show();

		commands.registerCommand(installPackageCommandId, installPackage);

		function addItem(packageManager: string) {
			const icon = `<h1>![Image](${iconDir}${packageManager}.png "${packageManager}")&nbsp;&nbsp;</h1>`;
			tooltip.appendMarkdown(`| ${icon} | ${installLocal} | ${installGlobal} |\n`);
			tooltip.appendMarkdown('| ------- | --------------- | ---------------- |\n');
		}
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