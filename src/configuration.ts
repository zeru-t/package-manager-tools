import { workspace } from 'vscode';


export function getConfigurations() {
	return {
		hideAnnotationsWarning: getConfiguration('hideMissingAnnotationsWarning'),
		hideTerminalButton: getConfiguration('hideTerminalButton'),
		hideInstallAllButton: getConfiguration('hideInstallAllButton'),
		hideInstallButton: getConfiguration('hideInstallButton'),
		hideRemoveButton: getConfiguration('hideRemoveButton'),
		hideListButton: getConfiguration('hideListButton'),
		hideVersionButton: getConfiguration('hideVersionButton'),
		hideUpdateVersionButton: getConfiguration('hideUpdateVersionButton')
	} as Configuration;


	function getConfiguration(key: string,) {
		return workspace.getConfiguration('PackageManagerTools').get<boolean>(key) ?? false;
	}
}

interface Configuration {
	hideAnnotationsWarning: boolean;
	hideTerminalButton: boolean;
	hideInstallAllButton: boolean;
	hideInstallButton: boolean;
	hideRemoveButton: boolean;
	hideListButton: boolean;
	hideVersionButton: boolean;
	hideUpdateVersionButton: boolean;
}