import { workspace, window } from 'vscode';


let packageManagers: PackageManager;

export async function initializePackageManagers() {

	const allLockFiles = await workspace.findFiles('{**/package-lock.json,**/pnpm-lock.yaml,**/bun.lock*}', '**/node_modules/**');

	packageManagers = {
		npm: allLockFiles.some(file => file.path.includes('package')),
		pnpm: allLockFiles.some(file => file.path.includes('pnpm')),
		bun: allLockFiles.some(file => file.path.includes('bun')),
		multiple: allLockFiles.length > 1,
	};

	return packageManagers;
}

export function installAllPackages() {
	if (!packageManagers) return;
	const { npm, pnpm, bun } = packageManagers;
	window.activeTerminal?.sendText('npm install\u000D');
}


interface PackageManager {
	npm: boolean;
	pnpm: boolean;
	bun: boolean;
	multiple: boolean;
}