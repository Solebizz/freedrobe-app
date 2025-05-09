<script lang="ts" context="module">
	import { env } from '$env/dynamic/public';

	let navigating = false;
	/**
	 * Goes to the local filesystem or remote filesystem depending on the environment. It also only works once to prevent multiple navigation attempts
	 */
	function localOrRemoteGo(path: string) {
		if (navigating) return;
		navigating = true;
		//go to remote resource
		if (env.PUBLIC_STREAM_FROM) {
			let url = new URL(env.PUBLIC_STREAM_FROM + path);
			window.location.href = url.toString();
		}
		//go to local file system
		else {
			goto(path).then(() => (navigating = false));
		}
	}
</script>

<script lang="ts">
	import { goto } from '$app/navigation';
	// import { PUBLIC_ADMIN_URL } from '$env/static/public';
	import { logoSrc } from '$lib/utils/globals';
	import { onMount } from 'svelte';
	import { APP } from '$lib/stores/appMain';

	let backgroundColor = '$fff';

	onMount(async () => {
		// const adminUrl = env.PUBLIC_ADMIN_URL;
		const splashDelayPromise = new Promise((resolve) => {
			setTimeout(resolve, 1500);
		});
		// TODO handle offline
		// try {
		// 	const statusFetchResp = fetch(`${adminUrl}/api/status`);
		// 	// show the splash for at least for 1.5 sec
		await Promise.all([splashDelayPromise]);
		// 	const statusResp = resp[0];
		// 	if (!statusResp.ok) {
		// 		return goto('/offline');
		// 	}

		// 	return goto('/home');
		// } catch (e) {
		// 	return goto('/offline');
		// }
		if ($APP.Auth?.AuthToken) {
			return localOrRemoteGo('/profile');
		}
		return localOrRemoteGo('/login');
	});
</script>

<!-- loading or splash logo -->
<main class="d-flex justify-content-center align-items-center" style="--splash-background: {backgroundColor}">
	<img src={logoSrc} class="splash-logo" alt="FREEDROBE" />
</main>

<style>
	main {
		background-color: var(--splash-background);
		height: 100vh;
	}
	.splash-logo {
		height: auto;
		width: 11rem;
	}
</style>
