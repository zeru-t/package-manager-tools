import { MarkdownString, StatusBarAlignment, commands, window } from 'vscode';
import { getPackageManagerNames, installPackage, removePackage, listPackages } from './package-manager';
import { toggleTerminal } from './terminal';


const toggleTerminalCommandId = 'PackageManagerTools.ToggleTerminal';
const installPackageCommandId = 'PackageManagerTools.InstallPackage';
const removePackageCommandId = 'PackageManagerTools.RemovePackage';
const listPackageCommandId = 'PackageManagerTools.ListPackage';

const lineBreak = '\n---\n';
const tableBreak = '| ----- | ----- | ----- |\n';


const iconDir = 'https://raw.githubusercontent.com/zeru-t/package-manager-tools/refs/heads/main/icons';

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

		const tooltip = new MarkdownString('',	true);
		tooltip.supportHtml = true;
		tooltip.isTrusted = true;
		packageManagers.forEach(addItem);

		const installPackageStatusBarItem = createStatusBarItem('$(archive) Install', tooltip, installPackageCommandId, 2);
		subscriptions.push(installPackageStatusBarItem);
		installPackageStatusBarItem.show();

		commands.registerCommand(installPackageCommandId, installPackage(packageManagers[0]));


		function addItem(packageManager: string, index: number) {

			const commandId = `${installPackageCommandId}${packageManager}`;
			const icon = `[<h1><img height="18" src="${iconDir}/${packageManager}.png" alt="${packageManager}" title="Install" /></h1>](command:${commandId} "Install Local")`;
			const installLocal = `<h2>&nbsp;&nbsp;[$(folder-opened)](command:${commandId}?[false] "Install Local")&nbsp;&nbsp;</h2>`;
			const installGlobal = `<h2>[$(globe)](command:${commandId}?[true] "Install Global")</h2>`;
			const installButtons = `${installLocal} | ${installGlobal}`;

			if (index > 0) tooltip.appendMarkdown(lineBreak);
			tooltip.appendMarkdown(`| ${icon} | ${installButtons} |\n`);
			tooltip.appendMarkdown(tableBreak);

			commands.registerCommand(`${commandId}`, installPackage(packageManager));
		}
	}

	function addRemove() {

		const tooltip = new MarkdownString('',	true);
		tooltip.supportHtml = true;
		tooltip.isTrusted = true;
		packageManagers.forEach(addItem);

		const removePackageStatusBarItem = createStatusBarItem('$(trash) Remove', tooltip, removePackageCommandId, 3
		);
		subscriptions.push(removePackageStatusBarItem);
		removePackageStatusBarItem.show();

		commands.registerCommand(removePackageCommandId, removePackage(packageManagers[0]));


		function addItem(packageManager: string, index: number) {
			const commandId = `${removePackageCommandId}${packageManager}`;
			const icon = `[<h1><img height="18" src="${iconDir}/${packageManager}.png" alt="${packageManager}" title="Remove Local" /></h1>](command:${commandId} "Remove Local")`;
			const removeGlobal = `<h2>&nbsp;&nbsp;[$(globe)](command:${commandId}?[true] "Remove Global")</h2>`;

			if (index > 0) tooltip.appendMarkdown(lineBreak);
			tooltip.appendMarkdown(`| ${icon} | ${removeGlobal} |\n`);
			tooltip.appendMarkdown('| ----- | ----- |\n');

			commands.registerCommand(`${commandId}`, removePackage(packageManager));
		}
	}

	function addList() {

		const tooltip = new MarkdownString('',	true);
		tooltip.supportHtml = true;
		tooltip.isTrusted = true;
		packageManagers.forEach(addItem);

		const listPackageStatusBarItem = createStatusBarItem('$(list-tree) List', tooltip, listPackageCommandId, 3
		);
		subscriptions.push(listPackageStatusBarItem);
		listPackageStatusBarItem.show();

		commands.registerCommand(listPackageCommandId, listPackages(packageManagers[0]));


		function addItem(packageManager: string, index: number) {
			const commandId = `${listPackageCommandId}${packageManager}`;
			const icon = `[<h1><img height="18" src="${iconDir}/${packageManager}.png" alt="${packageManager}" title="List Local" /></h1>](command:${commandId} "List Local")`;
			const listGlobal = `<h2>&nbsp;&nbsp;[$(globe)](command:${commandId}?[true] "List Global")</h2>`;

			if (index > 0) tooltip.appendMarkdown(lineBreak);
			tooltip.appendMarkdown(`| ${icon} | ${listGlobal} |\n`);
			tooltip.appendMarkdown('| ----- | ----- |\n');

			commands.registerCommand(`${commandId}`, listPackages(packageManager));
		}
	}
}

function createStatusBarItem(text: string, tooltip: string|MarkdownString, command: string, priority: number) {
	const terminalStatusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 2001 - priority);
	terminalStatusBarItem.text = text;
	terminalStatusBarItem.tooltip = tooltip;
	terminalStatusBarItem.command = command;
	return terminalStatusBarItem;
}