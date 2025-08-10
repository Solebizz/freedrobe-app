<script>
	import { goto } from '$app/navigation';
	import Loader from '$lib/components/loader.svelte';
	import MainHeader from '$lib/components/main_header.svelte';
	import Nav from '$lib/components/nav.svelte';
	import { APP } from '$lib/stores/appMain';
	import { addError } from '$lib/stores/notices';
	import { onMount } from 'svelte';

	let loading = false;

	onMount(() => {
		if (!$APP.Auth?.AuthToken || !$APP.Auth?.RefreshToken) {
			// TODO revisit this again
			// addError('Something went wrong. Please login again.');
			goto('/login');
		}
	});
</script>

{#if loading}
	<div class="vh-100 d-flex align-items-center justify-content-center">
		<Loader />
	</div>
{:else}
	<div id="outermost_app_wrap">
		<MainHeader />
		<div id="main_container" class="bg-body-tertiary px-3 pt-3">
			<slot />
		</div>
		<Nav />
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
