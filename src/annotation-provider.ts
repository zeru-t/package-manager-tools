import { CancellationToken, CodeLens, CodeLensProvider, TextDocument } from 'vscode';

import { getAnnotation } from './annotation';


export type Annotation = Record<string, string>;

export class AnnotationProvider implements CodeLensProvider {

	constructor() {}

	public async provideCodeLenses(document: TextDocument, _token: CancellationToken) {

		const annotations = getAnnotation(document.uri.path);
		if (!annotations)
			return [];

		const documentText = document.getText();
		const scriptsTextMatch = /(.+"scripts":\s*{[\r\n]+\s*)(.+?)(\s*})/gs.exec(documentText);
		if (scriptsTextMatch?.length !== 4)
			return [];

		const [ _, scriptsStartText, scripts ] = scriptsTextMatch;
		const scriptsStart = scriptsStartText.split('\n').length - 1;
		return scripts
			.split('\n')
			.map((script, index) => {
				const scriptNameMatch = /"(.+)(": ".+")/g.exec(script.trim());
				if (scriptNameMatch?.length !== 3)
					return null;

				const [ _, scriptName ] = scriptNameMatch;
				const annotation = annotations[scriptName];
				if (!annotation)
					return null;

				const range = document.lineAt(scriptsStart + index).range;
				const options = { title: annotation, command: '' };
				return new CodeLens(range, options);
			})
			.filter(script => script !== null);

	}

	public resolveCodeLens(codeLens: CodeLens, _token: CancellationToken) {
		return codeLens;
	}
}
