<script lang="ts">
	import { goto } from '$app/navigation';
	import Card from '$lib/components/card.svelte';
	import Loader from '$lib/components/loader.svelte';
	import { APP } from '$lib/stores/appMain';
	import { getArticles } from '$lib/utils/apis';
	import { onMount } from 'svelte';

	export let width = 200;
	export let border = 2;

	let loading = true;

	function handlePickupClick() {
		goto('/orders/pickup');
	}

	onMount(async () => {
		try {
			const resp = await getArticles();
			if (!resp) loading = false;
			$APP.Articles = resp;
		} finally {
			loading = false;
		}
	});
</script>

<div class="heading-wrapper d-flex align-items-center gap-3 mb-2 justify-content-between">
	<h1 class="fw-bold">My Closet</h1>
	{#if $APP.User?.ActiveSubscription && $APP.Articles && Object.keys($APP.Articles).length}
		<button on:click={handlePickupClick} class="btn btn-secondary">Pickup</button>
	{/if}
</div>
{#if loading}
	<Loader />
{:else if !$APP.Articles || !Object.keys($APP.Articles).length}
	{#if $APP.User?.ActiveSubscription}
		<div class="d-flex align-items-center flex-column">
			<p class="fs-6 text-center">No items in the closet yet.</p>
			<button on:click={handlePickupClick} class="btn btn-secondary w-75">Place your first pickup</button>
		</div>
	{:else}
		<p class="text-center fs-6">No active subscription.</p>
	{/if}
{:else}
	<div class="card-deck mb-3">
		{#each Object.values($APP.Articles) as article}
			<Card {article} />
		{/each}
	</div>
{/if}

<style lang="scss">
	.heading-wrapper {
		button {
			font-size: 0.8rem;
		}
	}
	.card-deck {
		display: grid;
		gap: 1rem;
		grid-template-columns: repeat(2, 1fr);

		@media (min-width: 600px) {
			grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		}
	}

	.chip {
		font-size: 0.8rem;
	}
</style>
