import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceIcon = path.join(__dirname, 'static', 'imgs', 'main_app_logo.png');
const outputDir = path.join(__dirname, 'static', 'imgs');

// Check if source icon exists
if (!fs.existsSync(sourceIcon)) {
	console.error('❌ Source icon not found:', sourceIcon);
	process.exit(1);
}

console.log('📱 Generating PWA icons...\n');

// Icon sizes to generate
const sizes = [
	{ size: 192, name: 'pwa-192x192.png' },
	{ size: 512, name: 'pwa-512x512.png' },
];

// Generate icons
Promise.all(
	sizes.map(({ size, name }) => {
		const outputPath = path.join(outputDir, name);
		return sharp(sourceIcon)
			.resize(size, size, {
				fit: 'contain',
				background: { r: 255, g: 255, b: 255, alpha: 1 },
			})
			.png()
			.toFile(outputPath)
			.then(() => {
				console.log(`✅ Generated ${name} (${size}x${size})`);
			});
	}),
)
	.then(() => {
		console.log('\n🎉 All PWA icons generated successfully!');
		console.log('\nGenerated files:');
		sizes.forEach(({ name }) => {
			console.log(`  - /static/imgs/${name}`);
		});
		console.log('\nYou can now build your app with: npm run build');
	})
	.catch((error) => {
		console.error('❌ Error generating icons:', error);
		process.exit(1);
	});
