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
		multiple: allLockFiles.length > 1,
	};

	packageManagers = Object.entries(packageManagers_OLD)
			.filter(([_, exists]) => exists)
			.map(([name]) => name);
}
export function getPackageManagerNames() {
	return packageManagers;
}

export function installPackage(...[args]: any[]) {
	console.log('%c📝package-manager.ts:', 'color: cyan', {args});
	if (!packageManagers_OLD) return;
	const { npm, pnpm, bun, multiple } = packageManagers_OLD;
	toggleTerminal();
	if (multiple) {
		//TODO: move package managers logic to status bar
	}
	else {
		const global = args ? '-g ' : '';
		const runScript = args === null || args === undefined;
		window.activeTerminal?.sendText(`${packageManagers[0]} install ${global}`, runScript);
	}
}

export function removePackage() {
	if (!packageManagers_OLD) return;
	const { npm, pnpm, bun, multiple } = packageManagers_OLD;
	if (multiple) {

	}
	else {
		window.activeTerminal?.sendText('npm remove ');
	}
}

export function listPackages() {
	if (!packageManagers_OLD) return;
	const { npm, pnpm, bun, multiple } = packageManagers_OLD;
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