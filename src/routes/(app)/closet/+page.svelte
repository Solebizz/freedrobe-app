<script lang="ts">
	import { goto } from '$app/navigation';
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
		{#each Object.values($APP.Articles) as article, index}
			<div class="card bg-white" on:click={() => openCardDetails(index)}>
				<div id={`carousel-wrapper-${index}`} class="carousel slide" data-ride="carousel">
					<div class="carousel-inner">
						{#each article.Images as src, index}
							<div class:active={index === 0} class="carousel-item">
								<img class="d-block w-100" {src} alt={index + 1 + ` ${article.Name}`} />
							</div>
						{/each}
					</div>
					<a class="carousel-control-prev" href={`#carousel-wrapper-${index}`} role="button" data-slide="prev">
						<span class="sr-only bg-black b-1">👈</span>
					</a>
					<a class="carousel-control-next" href={`#carousel-wrapper-${index}`} role="button" data-slide="next">
						<span class="sr-only bg-black">👉</span>
					</a>
				</div>
				<div class="card-body">
					<h5 class="card-title fw-bold">{article.Name}</h5>
					<span class="chip bg-secondary text-primary p-1 rounded fw-bold">{article.Status}</span>
					<button class="basket-btn position-absolute shadow" style="top: 0.5rem; right: 0.5rem;" on:click|stopPropagation={() => toggleBasket(article.ID)}>
						{$APP.ArticlesInBag && $APP.ArticlesInBag.includes(article.ID) ? 'Added ✅' : 'Quick Add ✙'}
					</button>
				</div>
			</div>
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

	.card {
		position: relative;
		border-radius: 1rem;
	}

	.card-image {
		width: 100%;
		height: var(--imgwidth);
		border-radius: 1rem;
		background-position: center;
		background-size: cover;
	}

	.basket-btn {
		background-color: rgba(0, 0, 0, 0.8);
		color: white;
		border: none;
		border-radius: 0.5rem;
		padding: 0.4rem 0.8rem;
		font-size: 0.8rem;
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.basket-btn:hover {
		background-color: rgba(0, 0, 0, 0.9);
	}
	.chip {
		font-size: 0.8rem;
	}
</style>
