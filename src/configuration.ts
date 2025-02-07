import { workspace } from 'vscode';


export function getConfigurations() {
	const buttonLabels = ButtonLabels[getConfiguration<ButtonLabelsKeys>('buttonLabels') ?? 'both'];
	return {
		showIcons: buttonLabels !== ButtonLabels.text,
		showText: buttonLabels !== ButtonLabels.icons,
		hideAnnotationsWarning: getConfiguration('hideMissingAnnotationsWarning'),
		hideTerminalButton: getConfiguration('hideTerminalButton'),
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

interface Configuration {
	showIcons: boolean;
	showText: boolean;
	hideAnnotationsWarning: boolean;
	hideTerminalButton: boolean;
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