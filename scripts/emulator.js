import { readFileSync, writeFileSync } from 'fs';
import { spawnSync, spawn } from 'child_process';

const args = process.argv.slice(2);

if (args.length < 2) {
	logError(`
	Invalid args please make sure the second argument is the platform and the third argument is the url you want to stream from
	
	The command should be in the form of: 

	'npm run emulator {platform} {stream-url}'
	`);
}

//* read flag for platform -- must be either 'ios' or 'android' (case insensitive)

const platform = args[0].toLowerCase();

if (!platform || (platform !== 'ios' && platform !== 'android')) {
	logError(`
	Invalid platform of '${platform}'

	Platform must either be 'ios' or 'android'
	`);
}

const streamUrl = args[1];

//* check for malformed url
try {
	new URL(streamUrl);
} catch (e) {
	logError(`Error with your URL! please double check your URL: ${e}`);
}

console.log(`

📝📝📝 attempting to replace your PUBLIC_STREAM_FROM environment variable 📝📝📝
`);

const envFile = readEnvFile();
writeUrlToEnvFile(envFile, streamUrl);

console.log(`
✅✅ Environment file updated! ✅✅
`);

console.log(`
🛠️🛠️🛠️ Building your svelte package now 🛠️🛠️🛠️
`);
const buildProcess = spawnSync('npm', ['run', 'build'], { stdio: 'inherit' });

if (buildProcess.error) {
	logError(`Error running 'npm run build' ${buildProcess.error}`);
}

console.log(`
✅✅ Finished building svelte package ✅✅
`);

console.log(`
🏃🏃🏃 Running your app now 🏃🏃🏃
`);

const commands = `cap run ${platform} --stream=${streamUrl}`.split(' ');
console.log(`$> npx ${commands.join(' ')}`);
spawn('npx', commands, { stdio: 'inherit' });

//* Helper functions

function readEnvFile() {
	try {
		return readFileSync('.env', { encoding: 'utf8' });
	} catch (e) {
		logError(`Error reading env file: ${e}`);
	}
}

function writeUrlToEnvFile(envFileContent, url) {
	try {
		const envRegex = new RegExp(/^PUBLIC_STREAM_FROM=.+$/g, 'm');

		if (envRegex.test(envFileContent)) {
			const newFileContents = envFileContent.replace(envRegex, `PUBLIC_STREAM_FROM=${url}`);
			writeFileSync('.env', newFileContents);
		} else {
			writeFileSync('.env', `\nPUBLIC_STREAM_FROM=${url}`, { flag: 'a' });
		}
	} catch (e) {
		logError(`Error writing to your .env file ${e}`);
	}
}

function logError(msg) {
	throw new Error(`
	❌❌❌

	${msg}
	
	❌❌❌`);
}
