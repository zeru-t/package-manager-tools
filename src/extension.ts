import { ExtensionContext } from 'vscode';
import { createStatusBarItems } from './status-bar';
import { initializePackageManagers } from './package-manager';


export async function activate(context: ExtensionContext) {

	await initializePackageManagers();
	createStatusBarItems(context.subscriptions);

}

export function deactivate() {}
