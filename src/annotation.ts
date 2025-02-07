import { Uri, window, workspace } from 'vscode';
import { Annotation } from './annotation-provider';


const defaultAnnotations = {
	'SCRIPT_1': 'SCRIPT_1 DESCRIPTION',
	'SCRIPT_2': 'SCRIPT_2 DESCRIPTION',
	'SCRIPT_3': 'SCRIPT_3 DESCRIPTION'
};

let allAnnotations: Record<string, Annotation|null>;

export async function getAnnotations() {

	if (!allAnnotations)
		allAnnotations = {};

	const packageFiles = await workspace.findFiles('**/package.json', '**/node_modules/**');
	for await (const { path: packagePath } of packageFiles) {
		const annotationsPath = getAnnotationsPath(packagePath);

		try {
			const annotationsFile = await workspace.openTextDocument(annotationsPath);
			allAnnotations[annotationsPath] = JSON.parse(annotationsFile.getText());
		}
		catch (e) {
			allAnnotations[annotationsPath] = null;
		}
	}

}

export async function createAnnotationFiles() {

	const packageFiles = await workspace.findFiles('**/package.json', '**/node_modules/**');
	packageFiles
		.filter(({ path }) => {
			const annotationsPath = getAnnotationsPath(path);
			const annotations = allAnnotations[annotationsPath];
			return annotations === null;
		})
		.forEach(async ({ path: packageFilePath }) => {
			const annotationsPath = Uri.file(getAnnotationsPath(packageFilePath));
			await workspace.fs.writeFile(annotationsPath, Buffer.from(JSON.stringify(defaultAnnotations, null, 4)));
			await window.showTextDocument(annotationsPath);
		});

}

export function getAnnotation(path: string) {
	return allAnnotations[getAnnotationsPath(path)];
}

export function missingAnnotationFiles() {
	return Object.values(allAnnotations).some(exists => !exists);
}

export function getMissingAnnotationFiles() {
	return Object.entries(allAnnotations)
		.filter(([_, exists]) => !exists)
		.map(([fileName]) => fileName.replace('package.annotations', 'package'));
};


function getAnnotationsPath(path: string) {
	return path.replace('package.json', 'package.annotations.json');
}
