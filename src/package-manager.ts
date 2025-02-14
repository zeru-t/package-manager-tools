import { showTerminal } from './terminal';
import { updatePackageManagerConfiguration } from './configuration';


export function updatePackageManager(...[packageManager]: any[]) {
	updatePackageManagerConfiguration(packageManager);
}

export function installAllPackages(packageManager: string) {
	return runCommand(packageManager, 'install', true);
}

export function installPackage(packageManager: string) {
	return runCommand(packageManager, 'install', false);
}

export function removePackage(packageManager: string) {
	return runCommand(packageManager, 'remove', false);
}

export function listPackages(packageManager: string) {
	const listCommand = packageManager === 'bun' ? 'pm ls' : 'list';
	return runCommand(packageManager, listCommand, true);
}

export function packagesManagerVersion(packageManager: string) {
	return runCommand(packageManager, '-v', true);
}

export function updateAppVersion(...[type]: any[]) {
	return runCommand('npm', `version -m "v%s" ${type}`, true)();
}

function runCommand(packageManager: string, command: string, runScript: boolean) {
	return (...[args]: any[]) => {

		if (!packageManager) return;

		const terminal = showTerminal();
		if (terminal)
			terminal.sendText(`${packageManager} ${command} `, runScript);

	};
}
