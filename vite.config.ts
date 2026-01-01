import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	plugins: [
		sveltekit(),
		VitePWA({
			registerType: 'autoUpdate',
			injectRegister: 'auto',
			workbox: {
				mode: 'production', // Use production mode to avoid eval()
				globPatterns: ['**/*.{js,css,svg,png,jpg,jpeg,gif,webp,woff,woff2}'],
				globIgnores: ['**/index.html', '**/*.html'],
				navigateFallback: '/index.html',
				navigateFallbackDenylist: [/^\/(api|_app)\//],
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/backend\.freedrobe\.com\/.*/i,
						handler: 'NetworkFirst',
						options: {
							cacheName: 'api-cache',
							expiration: {
								maxEntries: 100,
								maxAgeSeconds: 60 * 60 * 24, // 24 hours
							},
							networkTimeoutSeconds: 10,
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
					{
						urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'image-cache',
							expiration: {
								maxEntries: 60,
								maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
							},
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
					{
						urlPattern: /\/imgs\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'static-images-cache',
							expiration: {
								maxEntries: 50,
								maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
							},
						},
					},
				],
				cleanupOutdatedCaches: true,
			},
			manifest: {
				name: 'Freedrobe',
				short_name: 'Freedrobe',
				description: 'Your wardrobe management app',
				theme_color: '#003366',
				background_color: '#ffffff',
				display: 'standalone',
				scope: '/',
				start_url: '/',
				icons: [
					{
						src: '/imgs/pwa-192x192.png',
						sizes: '192x192',
						type: 'image/png',
						purpose: 'any maskable',
					},
					{
						src: '/imgs/pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any maskable',
					},
				],
			},
			devOptions: {
				enabled: false, // Keep disabled - service worker causes issues in SvelteKit dev mode
				// Use "npm run build && npm run preview" to test service worker
			},
		}),
	],
	server: {
		port: 5176,
		strictPort: true,
		host: '0.0.0.0',
		allowedHosts: true,
	},
});
