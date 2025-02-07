import { MarkdownString, StatusBarAlignment, StatusBarItem, ThemeColor, commands, window, workspace } from 'vscode';

import { updatePackageManager, installAllPackages, installPackage, removePackage, listPackages, packagesManagerVersion, updateAppVersion } from './package-manager';
import { getAnnotations, createAnnotationFiles, missingAnnotationFiles, getMissingAnnotationFiles } from './annotation';
import { getConfigurations } from './configuration';
import { toggleTerminal } from './terminal';


const toggleTerminalCommandId = 'PackageManagerTools.ToggleTerminal';
const changePackageManagerCommandId = 'PackageManagerTools.ChangePackageManager';
const installAllPackageCommandId = 'PackageManagerTools.InstallAllPackages';
const installPackageCommandId = 'PackageManagerTools.InstallPackage';
const removePackageCommandId = 'PackageManagerTools.RemovePackage';
const listPackageCommandId = 'PackageManagerTools.ListPackage';
const packageManagerVersionCommandId = 'PackageManagerTools.PackageManagerVersion';
const updateAppVersionCommandId = 'PackageManagerTools.UpdateAppVersion';
const generateAnnotationCommandId = 'PackageManagerTools.GenerateAnnotationFiles';

const iconDir = 'https://raw.githubusercontent.com/zeru-t/package-manager-tools/refs/heads/main/icons';

export async function createStatusBarItems(subscriptions: { dispose(): any }[]) {

	const annotationsWarningStatusBarItem = await addMissingAnnotationFiles();
	const terminalStatusBarItem = await addTerminal();
	const packageManagerStatusBarItem = await addPackageManager();
	const installAllStatusBarItem = await addInstallAll();
	const installStatusBarItem = await addInstall();
	const otherStatusBarItem = await addOther();
	const versionStatusBarItem = await addVersion();

	const spacer = createStatusBarItem(10);
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

	async function addPackageManager() {

		const statusBarItem = createStatusBarItem(3);
		subscriptions.push(statusBarItem);

		await addCommand(changePackageManagerCommandId, updatePackageManager);

		return statusBarItem;

	}

	async function addInstallAll() {

		const { packageManager } = getConfigurations();
		const statusBarItem = createStatusBarItem(5, `${installAllPackageCommandId}.${packageManager}`);
		subscriptions.push(statusBarItem);

		await addCommand(`${installAllPackageCommandId}.npm`, installAllPackages('npm'));
		await addCommand(`${installAllPackageCommandId}.pnpm`, installAllPackages('pnpm'));
		await addCommand(`${installAllPackageCommandId}.bun`, installAllPackages('bun'));

		return statusBarItem;

	}

	async function addInstall() {

		const { packageManager } = getConfigurations();
		const statusBarItem = createStatusBarItem(5, `${installPackageCommandId}.${packageManager}`);
		subscriptions.push(statusBarItem);

		await addCommand(`${installPackageCommandId}.npm`, installPackage('npm'));
		await addCommand(`${installPackageCommandId}.pnpm`, installPackage('pnpm'));
		await addCommand(`${installPackageCommandId}.bun`, installPackage('bun'));

		return statusBarItem;

	}

	async function addOther() {

		const statusBarItem = createStatusBarItem(6);
		subscriptions.push(statusBarItem);
		return statusBarItem;

	}

	async function addVersion() {

		const statusBarItem = createStatusBarItem(7);
		subscriptions.push(statusBarItem);

		await addCommand(updateAppVersionCommandId, updateAppVersion);

		return statusBarItem;
	}

	async function updateStatusBarItems() {

		const {
			packageManager,
			showIcons,
			showText,
			hideAnnotationsWarning,
			hidePackageManagerButton,
			hideTerminalButton,
			hideInstallAllButton,
			hideInstallButton,
			hideUpdateVersionButton,
			hideRemoveButton,
			hideListButton,
			hideVersionButton
		} = getConfigurations();

		await updateMissingAnnotationFiles();
		await updatePackageManagerStatusBarItem();
		await updateStatusBarItem(hideTerminalButton, terminalStatusBarItem, 'terminal-cmd', 'Terminal', 'Toggle Terminal');
		await updateStatusBarItem(hideInstallAllButton, installAllStatusBarItem, 'archive', 'Install All', 'Install All Packages', `${installAllPackageCommandId}.${packageManager}`);
		await updateStatusBarItem(hideInstallButton, installStatusBarItem, 'package', 'Install', 'Install Package', `${installPackageCommandId}.${packageManager}`);
		await updateOther();
		await updateVersion();


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
				annotationsWarningStatusBarItem.text = getStatusBarText('new-file', 'Generate Annotations');
				annotationsWarningStatusBarItem.tooltip = tooltip;
				if (hideAnnotationsWarning) annotationsWarningStatusBarItem.hide();
				else annotationsWarningStatusBarItem.show();
			}
			else {
				annotationsWarningStatusBarItem.hide();
			}

		}

		async function updatePackageManagerStatusBarItem() {
			packageManagerStatusBarItem.text = getStatusBarText('symbol-color', packageManager);
			const tooltip = new MarkdownString('', true);
			tooltip.supportHtml = true;
			tooltip.isTrusted = true;
			tooltip.appendMarkdown(`<h4 align="center">Change Package Manager</h4>\n`);
			tooltip.appendMarkdown(`<table width="100%"><tr>`);
			tooltip.appendMarkdown(`<td align="center">${getIcon('npm')}</td>`);
			tooltip.appendMarkdown(`<td align="center">${getIcon('pnpm')}</td>`);
			tooltip.appendMarkdown(`<td align="center">${getIcon('bun')}</td>`);
			tooltip.appendMarkdown(`</tr></table>`);
			packageManagerStatusBarItem.tooltip = tooltip;

			if (hidePackageManagerButton) packageManagerStatusBarItem.hide();
			else packageManagerStatusBarItem.show();

			function getIcon(packageManager: string) {
				const image = `<h3><img height="18" src="${iconDir}/${packageManager}.png" alt="${packageManager}" title="${packageManager}" /></h3>`;
				return `\n\n[${image}](command:${changePackageManagerCommandId}?"${packageManager}")\n`;
			}
		}

		async function updateStatusBarItem(hide: boolean, statusBarItem: StatusBarItem, icon: string, text: string, tooltip: string|MarkdownString, commandId?: string) {
			statusBarItem.text = getStatusBarText(icon, text);
			statusBarItem.tooltip = tooltip;
			if (commandId) statusBarItem.command = commandId;
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

				const tooltip = new MarkdownString('', true);
				tooltip.supportHtml = true;
				tooltip.isTrusted = true;

				if (!hideRemoveButton)
					tooltip.appendMarkdown(`[<h3>${getStatusBarText('trash', 'Remove Package')}</h3>](command:${removePackageCommandId}.${packageManager} "Remove Package (${packageManager})")\n\n---\n`);

				if (!hideListButton)
					tooltip.appendMarkdown(`[<h3>${getStatusBarText('list-tree', 'List Packages')}</h3>](command:${listPackageCommandId}.${packageManager} "List Packages (${packageManager})")\n\n---\n`);

				if (!hideVersionButton)
					tooltip.appendMarkdown(`[<h3>${getStatusBarText('versions', 'Get Version')}</h3>](command:${packageManagerVersionCommandId}.${packageManager} "Get Version (${packageManager})")\n`);

				tooltip.value = tooltip.value.replace(/\n---\n$/gm, '');

				await addCommand(`${removePackageCommandId}.${packageManager}`, removePackage(packageManager));
				await addCommand(`${listPackageCommandId}.${packageManager}`, listPackages(packageManager));
				await addCommand(`${packageManagerVersionCommandId}.${packageManager}`, packagesManagerVersion(packageManager));

				return tooltip;
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

function createStatusBarItem(priority: number, command?: string) {

	const terminalStatusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 3000 - priority);
	terminalStatusBarItem.command = command;
	return terminalStatusBarItem;

}