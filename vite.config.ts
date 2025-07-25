import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		port: 5176,
		strictPort: true,
		host: '0.0.0.0',
		allowedHosts: true,
	},
});
