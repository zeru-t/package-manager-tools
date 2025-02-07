import { MarkdownString, StatusBarAlignment, StatusBarItem, ThemeColor, commands, window, workspace } from 'vscode';

import { installAllPackages, installPackage, removePackage, listPackages, packagesManagerVersion, updateAppVersion } from './package-manager';
import { getAnnotations, createAnnotationFiles, missingAnnotationFiles, getMissingAnnotationFiles } from './annotation';
import { getConfigurations } from './configuration';
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

	const annotationsWarningStatusBarItem = await addMissingAnnotationFiles();
	const terminalStatusBarItem = await addTerminal();
	const installAllStatusBarItem = await addStatusBarItem('Install All Packages', installAllPackageCommandId, installAllPackages, 3);
	const installStatusBarItem = await addStatusBarItem('Install Package', installPackageCommandId, installPackage, 4);
	const otherStatusBarItem = await addOther();
	const versionStatusBarItem = await addVersion();

	const spacer = createStatusBarItem(7);
	spacer.text = ' ';
	spacer.show();
	subscriptions.push(spacer);

	const watcher = workspace.createFileSystemWatcher('**/package*.json');
	watcher.onDidCreate(updateStatusBarItems);
	watcher.onDidDelete(updateStatusBarItems);
	watcher.onDidChange(updateStatusBarItems);
	workspace.onDidChangeConfiguration(updateStatusBarItems);

	updateStatusBarItems();



	async function addMissingAnnotationFiles() {

		const statusBarItem = createStatusBarItem(1, generateAnnotationCommandId);
		statusBarItem.backgroundColor = new ThemeColor('statusBarItem.warningBackground');
		subscriptions.push(statusBarItem);

		await addCommand(generateAnnotationCommandId, async () => {
			await createAnnotationFiles();
			await updateStatusBarItems();
		});

		return statusBarItem;
	}

	async function addTerminal() {

		const statusBarItem = createStatusBarItem(2, toggleTerminalCommandId);
		subscriptions.push(statusBarItem);

		await addCommand(toggleTerminalCommandId, toggleTerminal);

		return statusBarItem;

	}

	async function addStatusBarItem(tooltipText: string, commandId: string, commandFunction: Function, priority: number) {

		const tooltip = new MarkdownString('', true);
		tooltip.supportHtml = true;
		tooltip.isTrusted = true;
		if (packageManagers.length > 1) await packageManagers.forEach(addItem);
		else tooltip.appendMarkdown(`${tooltipText} (${packageManagers[0]})`);

		const statusBarItem = createStatusBarItem(priority, `${commandId}.${packageManagers[0]}`);
		subscriptions.push(statusBarItem);
		return statusBarItem;


		async function addItem(packageManager: string, index: number) {

			const packageManagerCommandId = `${commandId}.${packageManager}`;
			const iconPath = `${iconDir}/${packageManager}.png`;
			const icon = `<img height="18" src="${iconPath}" alt="${packageManager}" title="${tooltipText} (${packageManager})" />`;

			if (index > 0) tooltip.appendMarkdown('\n---\n');
			tooltip.appendMarkdown(`[<h1>${icon}</h1>](command:${packageManagerCommandId})\n`);

			await addCommand(`${packageManagerCommandId}`, commandFunction(packageManager));

		}
	}

	async function addOther() {

		const statusBarItem = createStatusBarItem(5);
		subscriptions.push(statusBarItem);
		return statusBarItem;

	}

	async function addVersion() {

		const statusBarItem = createStatusBarItem(6);
		subscriptions.push(statusBarItem);

		await addCommand(updateAppVersionCommandId, updateAppVersion);

		return statusBarItem;
	}

	async function updateStatusBarItems() {

		const {
			showIcons,
			showText,
			hideAnnotationsWarning,
			hideTerminalButton,
			hideInstallAllButton,
			hideInstallButton,
			hideUpdateVersionButton,
			hideRemoveButton,
			hideListButton,
			hideVersionButton
		} = getConfigurations();

		updateMissingAnnotationFiles();
		updateStatusBarItem(hideTerminalButton, terminalStatusBarItem, 'terminal-cmd', 'Terminal', 'Toggle Terminal');
		updateStatusBarItem(hideInstallAllButton, installAllStatusBarItem, 'archive', 'Install All', 'Install All Packages');
		updateStatusBarItem(hideInstallButton, installStatusBarItem, 'package', 'Install', 'Install Package');
		updateOther();
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
				annotationsWarningStatusBarItem.text = getStatusBarText('new-file', 'Generate Annotation files');
				annotationsWarningStatusBarItem.tooltip = tooltip;
				if (hideAnnotationsWarning) annotationsWarningStatusBarItem.hide();
				else annotationsWarningStatusBarItem.show();
			}
			else {
				annotationsWarningStatusBarItem.hide();
			}

		}

		async function updateStatusBarItem(hide: boolean, statusBarItem: StatusBarItem, icon: string, text: string, tooltip: string|MarkdownString) {
			statusBarItem.text = getStatusBarText(icon, text);
			statusBarItem.tooltip = tooltip;
			if (hide) statusBarItem.hide();
			else statusBarItem.show();
		}

		async function updateOther() {

			const hideOtherButton = hideRemoveButton && hideListButton && hideVersionButton;
			otherStatusBarItem.tooltip = await getOtherTooltip();
			otherStatusBarItem.text = getStatusBarText('tools', 'Other');
			if (hideOtherButton) otherStatusBarItem.hide();
			else otherStatusBarItem.show();

			async function getOtherTooltip() {

				const packageManagers = await getPackageManagers();
				const {
					hideRemoveButton,
					hideListButton,
					hideVersionButton
				} = getConfigurations();

				const tooltip = new MarkdownString('', true);
				tooltip.supportHtml = true;
				tooltip.isTrusted = true;
				if (packageManagers.length > 1) {
					tooltip.appendMarkdown(`|   |   |   |\n`);
					tooltip.appendMarkdown(`| -----------: | :-----------: | :-----------: |\n`);
					if (!hideRemoveButton) await addSubmenu('Remove Package', 'trash', removePackageCommandId, removePackage);
					if (!hideListButton) await addSubmenu('List Packages', 'list-tree', listPackageCommandId, listPackages);
					if (!hideVersionButton) await addSubmenu('Get Version', 'versions', packageManagerVersionCommandId, packagesManagerVersion);
				}
				else {
					if (!hideRemoveButton)
						tooltip.appendMarkdown(`[<h2>$(trash) Remove Package</h2>](command:${removePackageCommandId} "Remove Package (${packageManagers[0]})")\n`);

					if (!hideListButton) {
						if (tooltip.value.length > 0) tooltip.appendMarkdown('\n---\n');
						tooltip.appendMarkdown(`[<h2>$(list-tree) List Packages</h2>](command:${listPackageCommandId} "List Packages (${packageManagers[0]})")\n`);
					}

					if (!hideVersionButton) {
						if (tooltip.value.length > 0) tooltip.appendMarkdown('\n---\n');
						tooltip.appendMarkdown(`[<h2>$(versions) Get Version</h2>](command:${packageManagerVersionCommandId} "Get Version (${packageManagers[0]})")\n`);
					}

					await addCommand(removePackageCommandId, removePackage(packageManagers[0]));
					await addCommand(listPackageCommandId, listPackages(packageManagers[0]));
					await addCommand(packageManagerVersionCommandId, packagesManagerVersion(packageManagers[0]));
				}

				return tooltip;


				async function addSubmenu(title: string, logo: string, commandId: string, command: Function) {

					tooltip.appendMarkdown(`| <h3>$(${logo}) ${title}</h3> | `);
					packageManagers.forEach(async (packageManager) => {

						const packageManagerCommandId = `${commandId}.${packageManager}`;
						const iconPath = `${iconDir}/${packageManager}.png`;
						const icon = `<img height="18" src="${iconPath}" alt="${packageManager}" title="${title} (${packageManager})" />`;

						tooltip.appendMarkdown(` [<h1>&nbsp;&nbsp;${icon}</h1>](command:${packageManagerCommandId}) | `);
						await addCommand(packageManagerCommandId, command(packageManager));
					});
					tooltip.appendMarkdown(`\n`);

				}
			}

		}

		async function updateVersion() {

			const version = await getAppVersion();

			if (!version || hideUpdateVersionButton)
				versionStatusBarItem.hide();
			else {
				versionStatusBarItem.tooltip = getTooltip(version);
				versionStatusBarItem.text = getStatusBarText('arrow-circle-up', `v${version}`);
				versionStatusBarItem.show();
			}


			function getTooltip(version: string) {

				const [major, minor, patch] = version.split('.').map(Number);
				const tooltip = new MarkdownString('', true);
				tooltip.supportHtml = true;
				tooltip.isTrusted = true;
				tooltip.appendMarkdown(`<h3 align="center">Update App Version</h3>\n\n`);
				tooltip.appendMarkdown(`| <h2>${major}</h2> | • | <h2>${minor}</h2> | • | <h2>${patch}</h2> |\n`);
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
				for (const { path } of packageFiles.sort((a, b) => a.path.length - b.path.length)) {
					const packageFile = await workspace.openTextDocument(path);
					const documentText = packageFile.getText();

					const version = documentText.match(/"version": "(\d.\d.\d)"/);

					if (version?.[1]) return version[1];
				}

				return null;
			}
		}

		function getStatusBarText(icon: string, text: string) {
			return `${showIcons ? `$(${icon})` : ''} ${showText ? text : ''}`.trim();
		}
	}

	async function addCommand(commandId: string, command: (...[type]: any[]) => void) {

		const allCommands = await commands.getCommands();
		if (!allCommands.includes(commandId))
			subscriptions.push(commands.registerCommand(commandId, command));

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

function createStatusBarItem(priority: number, command?: string) {

	const terminalStatusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 3000 - priority);
	terminalStatusBarItem.command = command;
	return terminalStatusBarItem;

}