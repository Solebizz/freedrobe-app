# PWA Service Worker Testing Guide

## Setup Complete ✅

The following has been implemented:

1. **Vite PWA Plugin** - Installed and configured
2. **Service Worker Registration** - Auto-registers on web platform only
3. **Runtime Caching Strategies**:
   - API calls (`backend.freedrobe.com`): NetworkFirst (10s timeout, 24h cache)
   - External images: CacheFirst (30 days cache)
   - Static `/imgs/*` files: CacheFirst (30 days cache)
4. **Cache Clearing** - Clears API cache on user logout
5. **PWA Manifest** - Configured with Freedrobe branding

## Before Testing: Generate PWA Icons

Follow the instructions in `PWA_ICONS_GUIDE.md` to generate:

- `pwa-192x192.png`
- `pwa-512x512.png`

Place these files in `/static/imgs/`

## Testing Steps

### 1. Build for Production

```bash
npm run build
```

This will:

- Generate the service worker file
- Create the PWA manifest
- Build all static assets

### 2. Preview the Production Build

```bash
npm run preview
```

Or use a static server:

```bash
npx serve build
```

### 3. Test Service Worker Registration

1. Open the app in your browser (use the preview URL)
2. Open DevTools (F12 or Cmd+Option+I)
3. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
4. Check **Service Workers** section
   - Should see: `Status: Activated and running`
   - Should show the service worker file

### 4. Test API Caching

1. Open **Network** tab in DevTools
2. Make sure "Disable cache" is **NOT** checked
3. Navigate through the app (closet, orders, etc.)
4. Check the **Size** column for API requests:
   - First load: Shows actual size (e.g., "2.3 KB")
   - Second load: Should show "(from ServiceWorker)" or "(disk cache)"

Example test flow:

```
1. Go to /closet → Check Network tab for API calls
2. Navigate to /orders → Check Network tab
3. Go back to /closet → Should load from cache (instant)
4. Refresh page → Should still use cache with background update
```

### 5. Test Image Caching

1. Open **Network** tab
2. Navigate to pages with images (closet, orders empty state)
3. First load: Images download normally
4. Navigate away and come back: Images load instantly from cache
5. Check cache in **Application > Cache Storage**:
   - Should see `static-images-cache` with your `/imgs/*` files
   - Should see `image-cache` for external images

### 6. Test Offline Functionality

1. Open the app and navigate through it
2. In DevTools **Network** tab, check **Offline** checkbox
3. Try refreshing the page → Should still work!
4. Try navigating to pages you've already visited → Should work from cache
5. Try navigating to a new page → Will fail (expected)

### 7. Test Cache Clearing on Logout

1. Login to the app
2. Navigate through several pages (closet, orders, etc.)
3. Open **Application > Cache Storage**
4. Note the caches present (api-cache, static-images-cache, etc.)
5. Click Logout
6. Check **Cache Storage** again → `api-cache` should be cleared
7. Static images cache should remain (intentional for faster login screen)

### 8. Test PWA Installability (Desktop)

1. Open the app in Chrome
2. Look for the **Install** button in the address bar (⊕ icon)
3. Click to install
4. App should open in standalone window
5. Check that theme color (#003366) is applied to window

### 9. Test PWA Installability (Mobile)

**Android (Chrome):**

1. Open the app in Chrome on Android
2. Tap the menu (⋮) → "Install app" or "Add to Home Screen"
3. App should install with icon and name "Freedrobe"
4. Open from home screen → Should open in standalone mode

**iOS (Safari):**

1. Open the app in Safari on iOS
2. Tap Share button → "Add to Home Screen"
3. App icon and name should appear
4. Open from home screen

### 10. Performance Testing

Use Lighthouse to measure improvement:

1. Open DevTools → **Lighthouse** tab
2. Select "Performance" and "Progressive Web App"
3. Click "Analyze page load"
4. Check scores:
   - PWA score should be high (90+)
   - Performance should improve due to caching
   - Look for "Installable" checkmark

## Monitoring in Production

### Check Service Worker Status

```javascript
// In browser console
navigator.serviceWorker.getRegistrations().then((registrations) => {
	console.log('Active service workers:', registrations);
});
```

### Check Cache Contents

```javascript
// In browser console
caches.keys().then((cacheNames) => {
	console.log('Available caches:', cacheNames);
});

// Check specific cache
caches.open('api-cache').then((cache) => {
	cache.keys().then((requests) => {
		console.log(
			'Cached API requests:',
			requests.map((r) => r.url),
		);
	});
});
```

### Clear All Caches (For Testing)

```javascript
// In browser console
caches
	.keys()
	.then((cacheNames) => {
		return Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
	})
	.then(() => {
		console.log('All caches cleared');
		location.reload();
	});
```

## Expected Results

### ✅ Success Indicators

- Service worker shows as "Activated and running"
- Network tab shows "(from ServiceWorker)" for cached requests
- App works offline for previously visited pages
- Images load instantly on repeat visits
- API calls return immediately from cache (with background update)
- Cache is cleared after logout
- App is installable (shows install prompt)
- Lighthouse PWA score is 90+

### ⚠️ Common Issues

**Service Worker not registering:**

- Check browser console for errors
- Ensure you're on HTTPS or localhost
- Clear site data and try again

**Caching not working:**

- Check Network tab "Disable cache" is OFF
- Verify service worker is activated
- Check cache patterns match your actual URLs

**Icons not showing:**

- Generate proper 192x192 and 512x512 PNG icons
- Place them in `/static/imgs/`
- Rebuild the app

## Next Steps

After successful testing:

1. ✅ Verify all features work as expected
2. ✅ Check performance improvement with Lighthouse
3. ✅ Test on both mobile and desktop
4. ✅ Deploy to production
5. ✅ Monitor for any service worker errors in production
6. Consider adding:
   - Push notifications (if needed)
   - Background sync for offline orders
   - Periodic background sync for data updates

## Debugging Commands

```bash
# Clear npm cache if build issues
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Build with verbose output
npm run build -- --debug

# Check for PWA plugin in build output
# Should see: "PWA: Service worker registered"
```

## Configuration Reference

All PWA configuration is in `vite.config.ts`:

- **registerType**: 'autoUpdate' - Auto-updates SW on changes
- **NetworkFirst**: Tries network first, falls back to cache (good for APIs)
- **CacheFirst**: Uses cache first, updates in background (good for images)
- **Cache expiration**: APIs 24h, Images 30 days
- **Network timeout**: 10 seconds before falling back to cache

The service worker registration logic is in:

- `/src/lib/utils/pwa.ts` - Registration and cache clearing
- `/src/routes/+layout.svelte` - Initializes on app start (web only)
- `/src/lib/components/member_sidebar.svelte` - Clears cache on logout
