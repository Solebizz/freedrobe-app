<script lang="ts">
	import { goto } from '$app/navigation';
	import Card from '$lib/components/card.svelte';
	import InfinteLoader from '$lib/components/infinte_loader.svelte';
	import { APP } from '$lib/stores/appMain';
	import { getArticles } from '$lib/utils/apis';

	function handlePickupClick() {
		goto('/orders/pickup');
	}

	async function fetchArticles(params: Api.IPaginatedParams) {
		const resp = await getArticles(params);
		if (resp) {
			const { articles, count } = resp;
			// Also update store if you want global availability
			$APP.Articles = { ...$APP.Articles, ...articles };
			return { items: Object.values(articles), total: count };
		}
		return { items: [], total: 0 };
	}
</script>

<InfinteLoader loadMore={fetchArticles} let:items let:totalCount>
	<div class="heading-wrapper d-flex align-items-center gap-3 mb-2 justify-content-between">
		<h1 class="fw-bold fs-5">My Closet ({totalCount})</h1>
		{#if $APP.User?.ActiveSubscription && (($APP.Articles && Object.keys($APP.Articles).length) || Object.values($APP?.Orders || {}).length)}
			<button on:click={handlePickupClick} class="btn btn-primary">Pickup</button>
		{/if}
	</div>
	{#if !items.length}
		{#if $APP.User?.ActiveSubscription}
			<div class="d-flex align-items-center flex-column">
				<p class="fs-6 text-center">No items in the closet yet.</p>
				<button on:click={handlePickupClick} class:d-none={Object.values($APP?.Orders || {}).length} class="btn btn-primary w-75">Book your first pickup</button>
			</div>
		{:else}
			<p class="text-center fs-6">No active subscription.</p>
		{/if}
	{:else}
		<div class="card-deck mb-3">
			{#each items as article}
				<Card {article} />
			{/each}
		</div>
	{/if}
</InfinteLoader>

<style lang="scss">
	.card-deck {
		display: grid;
		gap: 1rem;
		grid-template-columns: repeat(2, 1fr);

		@media (min-width: 600px) {
			grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		}
	}
</style>
