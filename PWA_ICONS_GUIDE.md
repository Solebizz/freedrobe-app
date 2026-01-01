# PWA Icons Guide

## Required Icon Sizes for PWA

To make the app fully installable as a PWA, you need to generate these icon sizes from your main_app_logo.png:

1. **192x192** - Standard Android home screen icon
2. **512x512** - High-resolution Android splash screen icon

## How to Generate Icons

### Option 1: Using Online Tools

1. Go to https://realfavicongenerator.net/ or https://www.pwabuilder.com/imageGenerator
2. Upload `/static/imgs/main_app_logo.png`
3. Download the generated icons
4. Place them in `/static/imgs/` with names:
   - `pwa-192x192.png`
   - `pwa-512x512.png`

### Option 2: Using ImageMagick (CLI)

```bash
# Install ImageMagick if not already installed
brew install imagemagick

# Generate 192x192 icon
magick static/imgs/main_app_logo.png -resize 192x192 static/imgs/pwa-192x192.png

# Generate 512x512 icon
magick static/imgs/main_app_logo.png -resize 512x512 static/imgs/pwa-512x512.png
```

### Option 3: Using Sharp (Node.js)

```bash
npm install sharp --save-dev
```

Then create `generate-icons.js`:

```javascript
const sharp = require('sharp');

sharp('static/imgs/main_app_logo.png').resize(192, 192).toFile('static/imgs/pwa-192x192.png');

sharp('static/imgs/main_app_logo.png').resize(512, 512).toFile('static/imgs/pwa-512x512.png');
```

Run: `node generate-icons.js`

## After Generating Icons

Once you have the icons, the vite.config.ts is already configured to use them. Just make sure the files exist at:

- `/static/imgs/pwa-192x192.png`
- `/static/imgs/pwa-512x512.png`

The manifest will automatically pick them up when you build the app.
