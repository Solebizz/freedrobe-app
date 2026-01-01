import { registerSW } from 'virtual:pwa-register';

export function registerServiceWorker() {
	console.log('🔵 Attempting to register service worker...');
	console.log('🔵 Service Worker support:', 'serviceWorker' in navigator);

	if ('serviceWorker' in navigator) {
		try {
			const updateSW = registerSW({
				onNeedRefresh() {
					console.log('🔄 New content available, will update...');
				},
				onOfflineReady() {
					console.log('✅ App ready to work offline');
				},
				onRegistered(registration: ServiceWorkerRegistration | undefined) {
					console.log('✅ Service Worker registered successfully!', registration);
				},
				onRegisterError(error: Error) {
					console.error('❌ Service Worker registration failed:', error);
				},
			});

			return updateSW;
		} catch (error) {
			console.error('❌ Error in registerSW:', error);
		}
	} else {
		console.warn('⚠️ Service Workers are not supported in this browser');
	}
}

// Function to clear cache when user logs out
export async function clearAppCache() {
	if ('caches' in window) {
		try {
			const cacheNames = await caches.keys();
			await Promise.all(
				cacheNames.map((cacheName) => {
					// Clear API caches but keep static assets
					if (cacheName.includes('api-cache')) {
						return caches.delete(cacheName);
					}
				}),
			);
			console.log('API cache cleared');
		} catch (error) {
			console.error('Error clearing cache:', error);
		}
	}
}
