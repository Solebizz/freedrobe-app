<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import Loader from '$lib/components/loader.svelte';
	import MainHeader from '$lib/components/main_header.svelte';
	import Nav from '$lib/components/nav.svelte';
	import { APP } from '$lib/stores/appMain';
	import { onMount } from 'svelte';

	let loading = false;

	onMount(() => {
		if (!$APP.Auth?.AuthToken || !$APP.Auth?.RefreshToken) {
			// TODO revisit this again
			// addError('Something went wrong. Please login again.');
			goto('/login');
			return;
		}

		// Check if user needs to complete onboarding
		if (!$APP.User?.LocationId && page.url.pathname !== '/onboarding') {
			goto('/onboarding', { replaceState: true });
		}
	});

	// Watch for changes in the route and user data
	$: if ($APP.User && !$APP.User.LocationId && page.url.pathname !== '/onboarding') {
		goto('/onboarding', { replaceState: true });
	}
</script>

{#if loading}
	<div class="vh-100 d-flex align-items-center justify-content-center">
		<Loader />
	</div>
{:else}
	<div id="outermost_app_wrap">
		{#if page.url.pathname !== '/onboarding'}
			<MainHeader />
		{/if}
		<div id="main_container" class="bg-body-tertiary" class:px-3={page.url.pathname !== '/onboarding'} class:pt-3={page.url.pathname !== '/onboarding'}>
			<slot />
		</div>
		{#if page.url.pathname !== '/onboarding'}
			<Nav />
		{/if}
	</div>
{/if}

<style lang="scss">
	#outermost_app_wrap {
		display: flex;
		flex-direction: column;
		height: 100vh;
	}
	#main_container {
		flex-grow: 1;
		flex-shrink: 1;
		overflow: auto;
		display: flex;
		flex-direction: column;
	}
</style>
