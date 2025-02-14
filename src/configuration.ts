import { workspace, ConfigurationScope } from 'vscode';


export function getConfigurations() {

	const buttonLabels = ButtonLabels[getConfiguration<ButtonLabelsKeys>('buttonLabels') ?? 'both'];
	return {
		packageManager: getConfiguration('packageManager'),
		showIcons: buttonLabels !== ButtonLabels.text,
		showText: buttonLabels !== ButtonLabels.icons,
		hideAnnotationsWarning: getConfiguration('hideMissingAnnotationsWarning'),
		hideTerminalButton: getConfiguration('hideTerminalButton'),
		hidePackageManagerButton: getConfiguration('hidePackageManagerButton'),
		hideInstallAllButton: getConfiguration('hideInstallAllButton'),
		hideInstallButton: getConfiguration('hideInstallButton'),
		hideRemoveButton: getConfiguration('hideRemoveButton'),
		hideListButton: getConfiguration('hideListButton'),
		hideVersionButton: getConfiguration('hideVersionButton'),
		hideUpdateVersionButton: getConfiguration('hideUpdateVersionButton')
	} as Configuration;


	function getConfiguration<T = boolean>(key: string) {
		return workspace.getConfiguration('PackageManagerTools').get<T>(key);
	}
}

export async function updatePackageManagerConfiguration(value: string) {
	await updateConfiguration('packageManager', value);
}

async function updateConfiguration<T>(key: string, value: T, global: boolean = false) {
	await workspace.getConfiguration('PackageManagerTools').update(key, value, global);
}

interface Configuration {
	packageManager: string;
	showIcons: boolean;
	showText: boolean;
	hideAnnotationsWarning: boolean;
	hideTerminalButton: boolean;
	hidePackageManagerButton: boolean;
	hideInstallAllButton: boolean;
	hideInstallButton: boolean;
	hideRemoveButton: boolean;
	hideListButton: boolean;
	hideVersionButton: boolean;
	hideUpdateVersionButton: boolean;
}

type ButtonLabelsKeys = keyof typeof ButtonLabels;
enum ButtonLabels {
	icons,
	text,
	both
}
