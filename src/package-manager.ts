import { ShellExecution, Task, TaskScope, tasks } from 'vscode';
import { newTerminal } from './terminal';
import { updatePackageManagerConfiguration } from './configuration';


export function updatePackageManager(...[packageManager]: any[]) {
	updatePackageManagerConfiguration(packageManager);
}

export function installAllPackages(packageManager: string) {
	return runTask(packageManager, 'install');
}

export function installPackage(packageManager: string) {
	return runCommand(packageManager, 'install');
}

export function removePackage(packageManager: string) {
	return runCommand(packageManager, 'remove');
}

export function listPackages(packageManager: string) {
	const listCommand = packageManager === 'bun' ? 'pm ls' : 'list';
	return runTask(packageManager, listCommand);
}

export function packagesManagerVersion(packageManager: string) {
	return runTask(packageManager, '-v');
}

export function updateAppVersion(...[type]: any[]) {
	return runTask('npm', `version -m "v%s" ${type}`)();
}

function runCommand(packageManager: string, command: string) {
	return (...[args]: any[]) => {

		if (!packageManager) return;

		const terminal = newTerminal();
		if (terminal)
			terminal.sendText(`${packageManager} ${command} `, false);

	};
}

function runTask(packageManager: string, command: string) {
	return (...[args]: any[]) => {

		if (!packageManager) return;

		tasks.executeTask(
			new Task(
				{ type: 'package-manager-tools' },
				TaskScope.Workspace,
				command,
				'package-manager-tools',
				new ShellExecution(`${packageManager} ${command}`)
			)
		);

	};
}
