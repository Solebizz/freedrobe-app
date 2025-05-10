<script lang="ts">
	import { goto } from '$app/navigation';
	import Card from '$lib/components/card.svelte';
	import CardDetail from '$lib/components/card_detail.svelte';
	import Loader from '$lib/components/loader.svelte';
	import { APP } from '$lib/stores/appMain';
	import { bottomSheetStore } from '$lib/stores/bottom_sheet';
	import { getArticles } from '$lib/utils/apis';
	import { onMount, type SvelteComponent } from 'svelte';

	export let width = 200;
	export let border = 2;

	let loading = true;

	function toggleBasket(id: string) {
		let articleIdsInBag = $APP.ArticlesInBag;
		let index = articleIdsInBag.findIndex((val) => val === id);

		if (index === -1) articleIdsInBag.push(id);
		else articleIdsInBag.splice(index, 1);

		$APP.ArticlesInBag = articleIdsInBag;
	}

	function openCardDetails(index: number) {
		// bottomSheetStore.setSheet({
		// 	show: true,
		// 	children: CardDetail as typeof SvelteComponent,
		// });
	}

	function handlePickupClick() {
		goto('/orders/pickup');
	}

	onMount(async () => {
		try {
			const resp = await getArticles();
			if (!resp) return (loading = false);
			$APP.Articles = resp;
		} finally {
			loading = false;
		}
	});
</script>

<h1 class="fw-bold mb-3">My Closet</h1>
{#if loading}
	<Loader />
{:else if !$APP.Articles || !Object.keys($APP.Articles).length}
	<div class="d-flex align-items-center flex-column">
		<p class="fs-6 text-center">No items in the closet yet.</p>
		<button on:click={handlePickupClick} class="btn btn-secondary w-75">Place your first pickup 🤩</button>
	</div>
{:else}
	<div class="card-deck mb-3">
		{#each Object.values($APP.Articles) as article}
			<Card {article} />
		{/each}
	</div>
{/if}

<style lang="scss">
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
