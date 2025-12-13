<script lang="ts">
	import { onMount } from 'svelte';

	// Preload the coming-soon image for all unauthenticated routes
	onMount(() => {
		const img = new Image();
		img.src = '/imgs/coming-soon.png';
	});
</script>

<svelte:head>
	<!-- Preload critical image -->
	<link rel="preload" as="image" href="/imgs/coming-soon.png" />
</svelte:head>

<div id="outermost_app_wrap">
	<div id="main_container">
		<slot />
	</div>
</div>

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
