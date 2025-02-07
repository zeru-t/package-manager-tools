import { MarkdownString, StatusBarAlignment, StatusBarItem, ThemeColor, commands, window, workspace } from 'vscode';

import { installAllPackages, installPackage, removePackage, listPackages, packagesManagerVersion, updateAppVersion } from './package-manager';
import { getAnnotations, createAnnotationFiles, missingAnnotationFiles, getMissingAnnotationFiles } from './annotation';
import { hideWarning } from './configuration';
import { toggleTerminal } from './terminal';


const toggleTerminalCommandId = 'PackageManagerTools.ToggleTerminal';
const installAllPackageCommandId = 'PackageManagerTools.InstallAllPackages';
const installPackageCommandId = 'PackageManagerTools.InstallPackage';
const removePackageCommandId = 'PackageManagerTools.RemovePackage';
const listPackageCommandId = 'PackageManagerTools.ListPackage';
const packageManagerVersionCommandId = 'PackageManagerTools.PackageManagerVersion';
const updateAppVersionCommandId = 'PackageManagerTools.UpdateAppVersion';
const generateAnnotationCommandId = 'PackageManagerTools.GenerateAnnotationFiles';

const iconDir = 'https://raw.githubusercontent.com/zeru-t/package-manager-tools/refs/heads/main/icons';

export async function createStatusBarItems(subscriptions: { dispose(): any }[]) {

	const packageManagers = await getPackageManagers();

	const warningStatusBarItem = addMissingAnnotationFiles();
	addTerminal();
	addStatusBarItem('Install All', 'archive', 'Install All Packages', installAllPackageCommandId, installAllPackages);
	addStatusBarItem('Install', 'package', 'Install Package', installPackageCommandId, installPackage);
	addOther();
	let versionStatusBarItem = await addVersion();

	const watcher = workspace.createFileSystemWatcher('**/package*.json');
	watcher.onDidCreate(updateStatusBarItems);
	watcher.onDidDelete(updateStatusBarItems);
	watcher.onDidChange(updateStatusBarItems);
	workspace.onDidChangeConfiguration(updateStatusBarItems);

	updateStatusBarItems();



	function addMissingAnnotationFiles() {

		const statusBarItem = createStatusBarItem('$(new-file) Generate Annotation files', 'Missing Annotation files!', generateAnnotationCommandId, 1);
		statusBarItem.backgroundColor = new ThemeColor('statusBarItem.warningBackground');
		subscriptions.push(statusBarItem);

		subscriptions.push(commands.registerCommand(generateAnnotationCommandId, async () => {
			await createAnnotationFiles();
			await updateStatusBarItems();
		}));

		return statusBarItem;
	}

	function addTerminal() {

		const terminalStatusBarItem = createStatusBarItem('$(terminal-cmd) Terminal', 'Toggle Terminal', toggleTerminalCommandId);
		subscriptions.push(terminalStatusBarItem);
		terminalStatusBarItem.show();

		commands.registerCommand(toggleTerminalCommandId, toggleTerminal);

	}

	function addStatusBarItem(statusBarText: string, statusBarIcon: string, tooltipText: string, commandId: string, commandFunction: Function) {

		const tooltip = new MarkdownString('', true);
		tooltip.supportHtml = true;
		tooltip.isTrusted = true;
		if (packageManagers.length > 1) packageManagers.forEach(addItem);
		else tooltip.appendMarkdown(`${tooltipText} (${packageManagers[0]})`);

		const statusBarItem = createStatusBarItem(`$(${statusBarIcon}) ${statusBarText}`, tooltip, `${commandId}.${packageManagers[0]}`);
		subscriptions.push(statusBarItem);
		statusBarItem.show();


		function addItem(packageManager: string, index: number) {

			const packageManagerCommandId = `${commandId}.${packageManager}`;
			const iconPath = `${iconDir}/${packageManager}.png`;
			const icon = `<img height="18" src="${iconPath}" alt="${packageManager}" title="${tooltipText} (${packageManager})" />`;

			if (index > 0) tooltip.appendMarkdown('\n---\n');
			tooltip.appendMarkdown(`[<h1>${icon}</h1>](command:${packageManagerCommandId})\n`);

			commands.registerCommand(`${packageManagerCommandId}`, commandFunction(packageManager));

		}
	}

	function addOther() {

		const tooltip = new MarkdownString('', true);
		tooltip.supportHtml = true;
		tooltip.isTrusted = true;
		if (packageManagers.length > 1) {
			addSubmenu('Remove Package', 'trash', removePackageCommandId, removePackage);
			tooltip.appendMarkdown(`| -----------: | :-----------: | :-----------: |\n`);
			addSubmenu('List Packages', 'list-tree', listPackageCommandId, listPackages);
			addSubmenu('Get Version', 'versions', packageManagerVersionCommandId, packagesManagerVersion);
		}
		else {
			tooltip.appendMarkdown(`[<h2>$(trash) Remove Package</h2>](command:${removePackageCommandId} "Remove Package (${packageManagers[0]})")\n`);
			tooltip.appendMarkdown('\n---\n');
			tooltip.appendMarkdown(`[<h2>$(list-tree) List Packages</h2>](command:${listPackageCommandId} "List Packages (${packageManagers[0]})")\n`);
			tooltip.appendMarkdown('\n---\n');
			tooltip.appendMarkdown(`[<h2>$(versions) Get Version</h2>](command:${packageManagerVersionCommandId} "Get Version (${packageManagers[0]})")\n`);

			commands.registerCommand(removePackageCommandId, removePackage(packageManagers[0]));
			commands.registerCommand(listPackageCommandId, listPackages(packageManagers[0]));
			commands.registerCommand(packageManagerVersionCommandId, packagesManagerVersion(packageManagers[0]));
		}

		const statusBarItem = createStatusBarItem(`$(tools) Other`, tooltip);
		subscriptions.push(statusBarItem);
		statusBarItem.show();


		function addSubmenu(title: string, logo: string, commandId: string, command: Function) {

			tooltip.appendMarkdown(`| <h3>$(${logo}) ${title}</h3> | `);
			packageManagers.forEach(packageManager => {

				const packageManagerCommandId = `${commandId}.${packageManager}`;
				const iconPath = `${iconDir}/${packageManager}.png`;
				const icon = `<img height="18" src="${iconPath}" alt="${packageManager}" title="${title} (${packageManager})" />`;

				tooltip.appendMarkdown(` [<h1>&nbsp;&nbsp;${icon}</h1>](command:${packageManagerCommandId}) | `);
				commands.registerCommand(packageManagerCommandId, command(packageManager));
			});
			tooltip.appendMarkdown(`\n`);

		}
	}

	async function addVersion() {

		const version = await getAppVersion();

		if (!version) return null;

		const tooltip = await getVersionTooltip(version);

		const statusBarItem = createStatusBarItem(`$(arrow-circle-up) ${version}`, tooltip);
		subscriptions.push(statusBarItem);
		statusBarItem.show();

		const allCommands = await commands.getCommands();
		if (!allCommands.includes(updateAppVersionCommandId))
			commands.registerCommand(updateAppVersionCommandId, updateAppVersion);

		return statusBarItem;
	}


	async function updateStatusBarItems() {

		updateMissingAnnotationFiles();
		updateVersion();


		async function updateMissingAnnotationFiles() {

			await getAnnotations();
			if (missingAnnotationFiles()) {
				const missingAnnotationFiles = getMissingAnnotationFiles();
				const tooltip = new MarkdownString('', true);
				tooltip.supportHtml = true;
				tooltip.isTrusted = true;
				tooltip.appendMarkdown(`<h3>The following <i>package.json</i> files are missing <i>package.annotations.json</i> files:</h3>\n`);
				tooltip.appendMarkdown(`<ul>\n`);
				missingAnnotationFiles.forEach(filePath => {
					let fileName = filePath;
					workspace?.workspaceFolders?.forEach(folder => fileName = fileName.replace(folder.uri.path, ''));
					tooltip.appendMarkdown(`<li>\n`);
					tooltip.appendMarkdown(`\n[<h4>${fileName}</h4>](${filePath})\n`);
					tooltip.appendMarkdown(`</li>\n`);
				});
				tooltip.appendMarkdown('</ul>\n');
				warningStatusBarItem.tooltip = tooltip;
				if (hideWarning()) warningStatusBarItem.hide();
				else warningStatusBarItem.show();
			}
			else {
				warningStatusBarItem.hide();
			}

		}

		async function updateVersion() {

			if (!versionStatusBarItem) versionStatusBarItem = await addVersion();
			if (!versionStatusBarItem) return;

			const version = await getAppVersion();

			if (!version) return;

			versionStatusBarItem.tooltip = await getVersionTooltip(version);
			versionStatusBarItem.text = `$(arrow-circle-up) ${version}`;

		}

	}
}

async function getVersionTooltip(version: string) {

	const [major, minor, patch] = version.split('.').map(Number);
	const tooltip = new MarkdownString('', true);
	tooltip.supportHtml = true;
	tooltip.isTrusted = true;
	tooltip.appendMarkdown(`<h3 align="center">Update App Version</h3>\n\n`);
	tooltip.appendMarkdown(`| <h2>${major}</h2> | · | <h2>${minor}</h2> | · | <h2>${patch}</h2> |\n`);
	tooltip.appendMarkdown(`| :---------: | :---------: | :---------: | :---------: | :--------: |\n`);
	addItem('major');
	tooltip.appendMarkdown(` <h3>&nbsp;&nbsp;&nbsp;&nbsp;</h3> `);
	addItem('minor');
	tooltip.appendMarkdown(` <h3>&nbsp;&nbsp;&nbsp;&nbsp;</h3> `);
	addItem('patch');
	tooltip.appendMarkdown(`\n`);

	return tooltip;

	function addItem(type: string) {
		if (!version) return;
		const index = type === 'major' ? 0 : type === 'minor' ? 1 : 2;
		const newVersion = version.split('.').map(Number);
		newVersion[index] += 1;
		tooltip.appendMarkdown(`| [<h3>$(arrow-up) ${type.toUpperCase()} $(arrow-up)</h3>](command:${updateAppVersionCommandId}?"${type}" "Update ${type.toUpperCase()} version to ${newVersion.join('.')}") |`);
	}
}

async function getAppVersion() {

	const packageFiles = await workspace.findFiles('**/package.json', '**/node_modules/**');
	for (const { path } of packageFiles) {
		const packageFile = await workspace.openTextDocument(path);
		const documentText = packageFile.getText();

		const version = documentText.match(/"version": "(\d.\d.\d)"/);

		if (version?.[1]) return version[1];
	}

	return null;
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

function createStatusBarItem(text: string, tooltip: string|MarkdownString, command?: string, priority: number = 0) {

	const terminalStatusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 2000 + priority);
	terminalStatusBarItem.text = text;
	terminalStatusBarItem.tooltip = tooltip;
	terminalStatusBarItem.command = command;
	return terminalStatusBarItem;

}