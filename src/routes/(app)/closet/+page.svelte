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
	let fetchingMore = false;
	let limit = 10;
	let page = 0; // track page number
	let totalCount = 0;

	async function loadArticles(initial = false) {
		// if already fetching OR no more items, return
		if (fetchingMore || (totalCount && page * limit >= totalCount)) return;
		fetchingMore = true;

		try {
			const params = {
				limit,
				start: page * limit, // correct offset
			};
			const resp = await getArticles(params);
			if (resp) {
				const { articles, count } = resp; // assuming { articles, count }
				totalCount = count;

				if (initial) {
					$APP.Articles = articles;
				} else {
					$APP.Articles = { ...$APP.Articles, ...articles };
				}

				page += 1; // ✅ increment page instead of start
			}
		} finally {
			loading = false;
			fetchingMore = false;
		}
	}

	function handlePickupClick() {
		goto('/orders/pickup');
	}

	let observer: IntersectionObserver;
	let sentinel: HTMLDivElement;

	onMount(() => {
		if (!$APP.User?.LocationId) return;

		loadArticles(true).then(() => {
			observer = new IntersectionObserver(
				(entries) => {
					if (entries[0].isIntersecting) {
						loadArticles();
					}
				},
				{ rootMargin: '100px' },
			);

			if (sentinel) observer.observe(sentinel);
		});

		return () => observer?.disconnect();
	});
</script>

<div class="heading-wrapper d-flex align-items-center gap-3 mb-2 justify-content-between">
	<h1 class="fw-bold fs-5">
		My Closet ({totalCount})
	</h1>
	{#if $APP.User?.ActiveSubscription && (($APP.Articles && Object.keys($APP.Articles).length) || Object.values($APP?.Orders || {}).length)}
		<button on:click={handlePickupClick} class="btn btn-primary">Pickup</button>
	{/if}
</div>

{#if loading}
	<Loader />
{:else if !$APP.Articles || !Object.keys($APP.Articles).length}
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
		{#each Object.values($APP.Articles) as article}
			<Card {article} />
		{/each}
	</div>
	<div bind:this={sentinel} class="sentinel mb-1"></div>
	{#if fetchingMore}
		<div class="text-center my-3">
			<Loader />
		</div>
	{/if}
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

	.sentinel {
		height: 1px;
	}
</style>
