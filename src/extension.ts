import { ExtensionContext, Disposable, languages } from 'vscode';

import { AnnotationProvider } from './annotation-provider';
import { createStatusBarItems } from './status-bar';


let disposables: Disposable[] = [];

export async function activate({ subscriptions }: ExtensionContext) {

	await createStatusBarItems(subscriptions);

	const documentSelector = { language: 'json', pattern: '**/package.json' };
	subscriptions.push(languages.registerCodeLensProvider(documentSelector, new AnnotationProvider()));

}

export function deactivate() {

	if (disposables)
		disposables.forEach(item => item.dispose());
	disposables = [];

}
