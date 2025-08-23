<script lang="ts">
	import { APP } from '$lib/stores/appMain';
	import { bottomSheetStore } from '$lib/stores/bottom_sheet';
	import type { SvelteComponent } from 'svelte';
	import CardDetail from './card_detail.svelte';

	export let article: App.IArticleInfo;

	function toggleBasket(id: string) {
		let articleIdsInBag = $APP.ArticlesInBag || [];
		let index = articleIdsInBag.findIndex((val) => val === id);

		if (index === -1) articleIdsInBag.push(id);
		else articleIdsInBag.splice(index, 1);

		$APP.ArticlesInBag = articleIdsInBag;
	}
	function handleCardClick() {
		bottomSheetStore.setSheet({
			show: true,
			children: CardDetail as typeof SvelteComponent,
			props: {
				article,
			},
		});
	}
</script>

<div class="card bg-white" on:click={handleCardClick}>
	<img class="d-block w-100 rounded-top-4" src={article.Images[0]} alt={article.Name} />
	<div class="card-body">
		<h5 class="card-title fw-bold">{article.Name}</h5>
		<button
			disabled={article.Status !== 'In Store'}
			class:opacity-50={article.Status !== 'In Store'}
			class="border-0 bg-secondary text-primary rounded shadow p-2"
			on:click|stopPropagation={() => toggleBasket(article.ID)}>
			{$APP.ArticlesInBag && $APP.ArticlesInBag.includes(article.ID) ? 'Remove' : 'Add to bag'}
		</button>
		<span class="status position-absolute" class:opacity-90={article.Status === 'In Store'} class:bg-success={article.Status === 'In Store'} style="top: 0.5rem; right: 0.5rem;">
			{article.Status}
		</span>
	</div>
</div>

<style lang="scss">
	.card {
		position: relative;
		border-radius: 1rem;
		img {
			min-height: 15rem;
		}
	}

	.opacity-90 {
		opacity: 0.9;
	}

	.card-image {
		width: 100%;
		height: var(--imgwidth);
		border-radius: 1rem;
		background-position: center;
		background-size: cover;
	}

	.status {
		background-color: rgba(0, 0, 0, 0.8);
		color: white;
		border: none;
		border-radius: 0.5rem;
		padding: 0.4rem 0.8rem;
		font-size: 0.8rem;
		transition: background-color 0.2s ease;
	}

	.basket-btn:hover {
		background-color: rgba(0, 0, 0, 0.9);
	}
</style>
