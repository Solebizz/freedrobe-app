import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
	appId: 'com.freedrobe.mobile',
	appName: 'Freedrobe',
	webDir: 'build',
	server: {
		androidScheme: 'https',
	},
	plugins: {
		PushNotifications: {
			presentationOptions: ['badge', 'sound', 'alert'],
		},
		SplashScreen: {
			launchAutoHide: false,
			backgroundColor: '#fff',
		},
	},
	ios: {
		scheme: 'App',
	},
};

const streamFrom = getCMDArgument('stream'); //supports setting as ENV variable or command line argument --stream=X
const streamLoader = getCMDArgument('stream-loader');

if (!config.server) config.server = {}; // appeasing cranky TS

if (streamFrom) {
	console.log('\x1b[33m ⚠️ Using stream from: \x1b[0m' + streamFrom);

	const url = new URL(streamFrom);

	if (url.protocol === 'http:') config.server.cleartext = true;

	config.server.allowNavigation = [
		url.hostname, // capacitor does not like having a protocol here, so need to parse via url
	];
}

if (streamLoader) {
	console.log('\x1b[33m ⚠️ Using stream-loader from: \x1b[0m' + streamLoader);
	config.server.url = streamLoader;

	const url = new URL(streamLoader);

	if (url.protocol === 'http:') config.server.cleartext = true;
}

export default config;

/**
 * Gets the value of a command line argument in the form of key=value OR -key=value OR --key=value
 * @param {string} str the flag to look for
 * @returns string | null the value of the flag or null if not found
 */
function getCMDArgument(str: string): string | null {
	const arg = process.argv.find((a) => a.startsWith(`${str}=`) || a.startsWith(`-${str}=`) || a.startsWith(`--${str}=`));
	if (!arg) return null;
	return arg ? arg.split('=')[1] : '';
}
