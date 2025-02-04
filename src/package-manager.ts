import { workspace, window } from 'vscode';
import { toggleTerminal } from './terminal';


let packageManagers: PackageManager;
let packageManagersNames: string|string[];

export async function initializePackageManagers() {

	const allLockFiles = await workspace.findFiles('{**/package-lock.json,**/pnpm-lock.yaml,**/bun.lock*}', '**/node_modules/**');

	packageManagers = {
		npm: allLockFiles.some(file => file.path.includes('package')),
		pnpm: allLockFiles.some(file => file.path.includes('pnpm')),
		bun: allLockFiles.some(file => file.path.includes('bun')),
		multiple: allLockFiles.length > 1,
	};

	const pkgManagers = Object.entries(packageManagers)
			.filter(([_, exists]) => exists)
			.map(([name]) => name);
	packageManagersNames = pkgManagers.length === 1 ? pkgManagers[0] : pkgManagers;
}

export function installPackage(...[args]: any[]) {
	if (!packageManagers) return;
	const { npm, pnpm, bun, multiple } = packageManagers;
	toggleTerminal();
	if (multiple) {
		//TODO: move package managers logic to status bar
	}
	else {
		const global = args ? '-g ' : '';
		const runScript = args === null || args === undefined;
		window.activeTerminal?.sendText(`${packageManagersNames[0]} install ${global}`, runScript);
	}
}

export function removePackage() {
	if (!packageManagers) return;
	const { npm, pnpm, bun, multiple } = packageManagers;
	if (multiple) {

	}
	else {
		window.activeTerminal?.sendText('npm remove ');
	}
}

export function listPackages() {
	if (!packageManagers) return;
	const { npm, pnpm, bun, multiple } = packageManagers;
	if (multiple) {

	}
	else {
		window.activeTerminal?.sendText('npm list ');
	}
}


interface PackageManager {
	npm: boolean;
	pnpm: boolean;
	bun: boolean;
	multiple: boolean;
}