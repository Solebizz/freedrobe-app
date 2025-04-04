import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface BuildSetting {
	bundle_id: string;
	bundle_id_android?: string;
	app_name: string;
	team_id?: string;
	icon_key: string;
}

const app_options: BuildSetting = {
	bundle_id: 'com.freedrobe.mobile',
	app_name: 'Freedrobe',
	icon_key: 'freedrobe',
};

try {
	const icon_key = app_options.icon_key;
	updateIcon(icon_key);
	updateName(app_options.app_name);
	updateBundle(app_options.bundle_id, app_options.bundle_id_android);
} catch (error) {
	console.error(error);
	process.exit(1); //exit with an error code
}

function updateIcon(icon_key: string) {
	console.log(`Updating icon to ${icon_key} ... `);
	fs.copyFileSync(`./app-packaging/icons/${icon_key}.png`, './ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png');
	//create resource folder if it doesn't exit
	if (!fs.existsSync('./resources')) fs.mkdirSync('./resources');
	fs.copyFileSync(`./app-packaging/icons/${icon_key}.png`, './resources/icon-only.png');
	fs.copyFileSync(`./app-packaging/icons/${icon_key}.png`, './resources/icon-foreground.png');
	fs.copyFileSync(`./app-packaging/icons/${icon_key}.png`, './resources/icon-background.png');
	fs.copyFileSync(`./app-packaging/icons/${icon_key}-splash.png`, './resources/splash.png');
	fs.copyFileSync(`./app-packaging/icons/${icon_key}-splash.png`, './resources/splash-dark.png');
	// copyFileSync(`./app-packaging/icons/${mode}.png`, './static/imgs/main_app_logo.png');
	// replaceInFile('.env', /PUBLIC_SPLASH_COLOR=.+/gm, `PUBLIC_SPLASH_COLOR="${color}"`);
	console.log('✅');
	console.log('Building all icons from default');
	child_process.execSync('npx capacitor-assets generate --ios --android', { stdio: 'inherit' });
	console.log('✅');
}

function updateName(name: string) {
	console.log('Updating names in apple bundle...');
	replaceInFile('./capacitor.config.ts', /"?appName:.+/, `appName: '${name}',`);
	replaceInFile('./ios/App/App/Info.plist', /<key>CFBundleDisplayName<\/key>\s*<string>.*<\/string>/, `<key>CFBundleDisplayName</key>\n\t<string>${name}</string>`);
	// replaceInFile('./ios/App/App/Info.plist', /<key>NSLocationAlwaysUsageDescription<\/key>\s*<string>.*<\/string>/, `<key>NSLocationAlwaysUsageDescription</key>\n\t<string>${name}</string>`);
	// replaceInFile('./ios/App/App/Info.plist', /<key>NSLocationWhenInUseUsageDescription<\/key>\s*<string>.*<\/string>/, `<key>NSLocationWhenInUseUsageDescription</key>\n\t<string>${name}</string>`);
	console.log('✅');
	console.log('Updating names in android bundle...');
	replaceInFile('./android/app/src/main/res/values/strings.xml', /<string name="app_name">.+<\/string>/, `<string name="app_name">${name}</string>`);
	replaceInFile('./android/app/src/main/res/values/strings.xml', /<string name="title_activity_main">.+<\/string>/, `<string name="title_activity_main">${name}</string>`);
	console.log('✅');
	// TODO: update the app name?
	// replaceInFile('.env', /^PUBLIC_APP_NAME=.+/, `PUBLIC_APP_NAME=${name}`);
}

function updateBundle(bundle_id: string, bundle_id_android?: string) {
	if (!bundle_id_android) bundle_id_android = bundle_id;
	console.log('Updating apple bundle id...');
	replaceInFile('./ios/App/App.xcodeproj/project.pbxproj', /PRODUCT_BUNDLE_IDENTIFIER\s*=.+;/g, `PRODUCT_BUNDLE_IDENTIFIER = ${bundle_id};`);
	replaceInFile('./android/app/src/main/res/values/strings.xml', /<string name="custom_url_scheme">.+<\/string>/, `<string name="custom_url_scheme">${bundle_id_android}</string>`);
	replaceInFile('./capacitor.config.ts', /"?appId:.+/, `appId: '${bundle_id_android}',`);
	console.log('✅');

	console.log('Updating android bundle id...');
	// Update MainActivity.java
	const rootMainActivityPath = path.resolve('./android/app/src/main/java/');
	const curMainActivityFilePath = searchFile(rootMainActivityPath, 'MainActivity.java')[0];
	const newMainActivityFolderPath = path.join(rootMainActivityPath, ...bundle_id_android.split('.'));
	const newMainActivityFilePath = path.join(newMainActivityFolderPath, 'MainActivity.java');
	if (curMainActivityFilePath != newMainActivityFilePath) {
		fs.mkdirSync(newMainActivityFolderPath, { recursive: true });
		fs.copyFileSync(curMainActivityFilePath, newMainActivityFilePath);
		fs.rmSync(curMainActivityFilePath, { recursive: true });
	}
	replaceInFile(newMainActivityFilePath, /package (.+);/, `package ${bundle_id_android};`);

	// Update Gradle build file
	const gradleFilePath = './android/app/build.gradle';
	replaceInFile(gradleFilePath, /namespace "(.+)"/, `namespace "${bundle_id_android}"`);
	replaceInFile(gradleFilePath, /applicationId "(.+)"/, `applicationId "${bundle_id_android}"`);
	console.log('✅');
}

function replaceInFile(file: string, regex: RegExp, replacement: string, add_if_not_found = false) {
	let contents = fs.readFileSync(file, 'utf8');
	contents = contents.replace(regex, replacement);
	if (add_if_not_found && !contents.includes(replacement)) contents += `\n${replacement}`;
	fs.writeFileSync(file, contents);
}

function searchFile(dir: string, fileName: string): string[] {
	// read the contents of the directory
	const files = fs.readdirSync(dir);
	const result: string[] = [];

	// search through the files
	for (const file of files) {
		// build the full path of the file
		const filePath = path.join(dir, file);

		// get the file stats
		const fileStat = fs.statSync(filePath);

		// if the file is a directory, recursively search the directory
		if (fileStat.isDirectory()) {
			result.push(...searchFile(filePath, fileName));
		} else if (file.endsWith(fileName)) {
			// if the file is a match, return it
			result.push(filePath);
		}
	}

	return result;
}
