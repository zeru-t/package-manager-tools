import { workspace } from 'vscode';


function getConfiguration<T>(key: string) {
	return workspace.getConfiguration('PackageManagerTools').get<T>(key);
}

export function hideWarning() {
	return getConfiguration<boolean>('hideMissingAnnotationsWarning');
}

export function hideButton() {
	return getConfiguration<boolean>('hideGenerateAnnotationsButton');
}