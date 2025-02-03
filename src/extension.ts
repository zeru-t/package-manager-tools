import { ExtensionContext } from 'vscode';
import { createStatusBarItems } from './status-bar';
import { initializePackageManagers } from './package-manager';


export async function activate(context: ExtensionContext) {

	const { npm, pnpm, bun, multiple } = await initializePackageManagers();
	createStatusBarItems(context.subscriptions, npm, pnpm, bun, multiple);

}

export function deactivate() {}
