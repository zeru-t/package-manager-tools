import { ExtensionContext, Disposable, languages } from 'vscode';

import { AnnotationProvider } from './annotation';
import { createStatusBarItems } from './status-bar';


let disposables: Disposable[] = [];

export async function activate(context: ExtensionContext) {

	await createStatusBarItems(context.subscriptions);

	const documentSelector = { language: 'json', pattern: '**/package.json' };
	languages.registerCodeLensProvider(documentSelector, new AnnotationProvider());

}

export function deactivate() {
	if (disposables)
		disposables.forEach(item => item.dispose());
	disposables = [];
}
