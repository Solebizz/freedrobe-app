<script lang="ts">
	import { onMount } from 'svelte';
	import Loader from './loader.svelte';

	export let loadMore: (page: number, limit: number) => Promise<{ items: any[]; total: number }>;
	export let limit: number = 10;
	export let initialLoad: boolean = true;

	let items: any[] = [];
	let totalCount = 0;
	let page = 0;
	let loading = true;
	let fetchingMore = false;

	let observer: IntersectionObserver;
	let sentinel: HTMLDivElement;

	async function loadData(initial = false) {
		if (fetchingMore || (totalCount && page * limit >= totalCount)) return;
		fetchingMore = true;

		try {
			loading = true;
			const resp = await loadMore(page, limit);
			if (resp) {
				const { items: newItems, total } = resp;
				totalCount = total;

				items = initial ? newItems : [...items, ...newItems];
				page += 1;
			}
		} finally {
			loading = false;
			fetchingMore = false;
		}
	}

	onMount(() => {
		if (initialLoad) loadData(true);

		observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					loadData();
				}
			},
			{ rootMargin: '100px' },
		);

		if (sentinel) observer.observe(sentinel);

		return () => observer?.disconnect();
	});
</script>

<!-- Slot out total, items, and loading state -->
<slot {items} {totalCount} {loading}></slot>

{#if loading}
	<Loader />
{/if}

<div bind:this={sentinel} class="mb-3"></div>

<style>
</style>
