import { MarkdownString, StatusBarAlignment, commands, window, workspace } from 'vscode';

import { installAllPackages, installPackage, removePackage, listPackages } from './package-manager';
import { toggleTerminal } from './terminal';


const toggleTerminalCommandId = 'PackageManagerTools.ToggleTerminal';
const installAllPackageCommandId = 'PackageManagerTools.InstallAllPackages';
const installPackageCommandId = 'PackageManagerTools.InstallPackage';
const removePackageCommandId = 'PackageManagerTools.RemovePackage';
const listPackageCommandId = 'PackageManagerTools.ListPackage';

const iconDir = 'https://raw.githubusercontent.com/zeru-t/package-manager-tools/refs/heads/main/icons';

export async function createStatusBarItems(subscriptions: { dispose(): any }[]) {

	const packageManagers = await getPackageManagers();

	addTerminal();
	addItem('Install All', 'archive', 'Install All Packages', installAllPackageCommandId, installAllPackages);
	addItem('Install', 'package', 'Install Package', installPackageCommandId, installPackage);
	addItem('Remove', 'trash', 'Remove Package', removePackageCommandId, removePackage);
	addItem('List', 'list-tree', 'List Packages', listPackageCommandId, listPackages);


	function addTerminal() {
		const terminalStatusBarItem = createStatusBarItem('$(terminal-cmd) Terminal', 'Toggle Terminal', toggleTerminalCommandId, 1);
		subscriptions.push(terminalStatusBarItem);
		terminalStatusBarItem.show();
		commands.registerCommand(toggleTerminalCommandId, toggleTerminal);
	}

	function addItem(statusBarText: string, statusBarIcon: string, tooltipText: string, commandId: string, commandFunction: Function) {

		const tooltip = new MarkdownString('', true);
		tooltip.supportHtml = true;
		tooltip.isTrusted = true;
		if (packageManagers.length > 1) packageManagers.forEach(addItem);
		else tooltip.appendMarkdown(`${tooltipText} (${packageManagers[0]})`);

		const statusBarItem = createStatusBarItem(`$(${statusBarIcon}) ${statusBarText}`, tooltip, commandId, 2);
		subscriptions.push(statusBarItem);
		statusBarItem.show();

		commands.registerCommand(commandId, commandFunction(packageManagers[0]));


		function addItem(packageManager: string, index: number) {
			const packageManagerCommandId = `${commandId}${packageManager}`;
			const iconPath = `${iconDir}/${packageManager}.png`;
			const icon = `<img height="18" src="${iconPath}" alt="${packageManager}" title="${tooltipText} (${packageManager})" />`;

			if (index > 0) tooltip.appendMarkdown('\n---\n');
			tooltip.appendMarkdown(`[<h1>${icon}</h1>](command:${packageManagerCommandId})\n`);

			commands.registerCommand(`${packageManagerCommandId}`, commandFunction(packageManager));
		}
	}
}

async function getPackageManagers() {
	const allLockFiles = await workspace.findFiles('{**/bun.lock*,**/pnpm-lock.yaml,**/package-lock.json}', '**/node_modules/**');
	return allLockFiles.map(({ path }) => {
		const fileName = path.split('/').pop();
		switch (fileName) {
			case 'bun.lock':
				return "bun";
			case 'pnpm-lock.yaml':
				return "pnpm";
			case 'package-lock.json':
			default:
				return "npm";
		}
	});
}

function createStatusBarItem(text: string, tooltip: string|MarkdownString, command: string, priority: number) {
	const terminalStatusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 2001 - priority);
	terminalStatusBarItem.text = text;
	terminalStatusBarItem.tooltip = tooltip;
	terminalStatusBarItem.command = command;
	return terminalStatusBarItem;
}