<script lang="ts">
	import { goto } from '$app/navigation';
	import SplashScreen from '$lib/components/splash_screen.svelte';
	import { onMount } from 'svelte';

	export let data;

	let showSplash = true;

	onMount(() => {
		// Show splash for minimum time, then redirect
		const minTime = setTimeout(async () => {
			showSplash = false;

			// Small delay for smooth transition
			setTimeout(() => {
				if (data?.redirectTo) {
					goto(data.redirectTo, { replaceState: true });
				}
			}, 100);
		}, 2000);

		return () => clearTimeout(minTime);
	});
</script>

<SplashScreen show={showSplash} />
