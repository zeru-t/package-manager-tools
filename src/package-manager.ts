import { workspace, window } from 'vscode';
import { toggleTerminal } from './terminal';


let packageManagers_OLD: PackageManager;
let packageManagers: string[];

export async function initializePackageManagers() {

	const allLockFiles = await workspace.findFiles('{**/package-lock.json,**/pnpm-lock.yaml,**/bun.lock*}', '**/node_modules/**');

	packageManagers_OLD = {
		npm: allLockFiles.some(file => file.path.includes('package')),
		pnpm: allLockFiles.some(file => file.path.includes('pnpm')),
		bun: allLockFiles.some(file => file.path.includes('bun')),
	};

	packageManagers = Object.entries(packageManagers_OLD)
			.filter(([_, exists]) => exists)
			.map(([name]) => name);
}
export function getPackageManagerNames() {
	return packageManagers;
}

export function installPackage(packageManager: string) {
	return (...[args]: any[]) => {
		if (!packageManager) return;

		toggleTerminal();

		const global = args ? '-g ' : '';
		const runScript = args === null || args === undefined;
		window.activeTerminal?.sendText(`${packageManager} install ${global}`, runScript);
	};
}

export function removePackage(packageManager: string) {
	return (...[args]: any[]) => {
		if (!packageManager) return;

		toggleTerminal();

		const global = args ? '-g ' : '';
		window.activeTerminal?.sendText(`${packageManager} remove ${global}`, false);
	};
}

export function listPackages(packageManager: string) {
	return (...[args]: any[]) => {
		if (!packageManager) return;

		toggleTerminal();

		const global = args ? '-g ' : '';
		window.activeTerminal?.sendText(`${packageManager} list ${global}`, true);
	};
}


interface PackageManager {
	npm: boolean;
	pnpm: boolean;
	bun: boolean;
}