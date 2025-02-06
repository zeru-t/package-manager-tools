import { ExtensionContext } from 'vscode';

import { createStatusBarItems } from './status-bar';


export async function activate(context: ExtensionContext) {

	await createStatusBarItems(context.subscriptions);

}

export function deactivate() {}
