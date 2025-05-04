<script lang="ts">
	import { goto } from '$app/navigation';
	import CardDetail from '$lib/components/card_detail.svelte';
	import Loader from '$lib/components/loader.svelte';
	import { bottomSheetStore } from '$lib/stores/bottom_sheet';
	import { getOrdersList } from '$lib/utils/apis';
	import { DateTime } from 'luxon';
	import { onMount } from 'svelte';

	const maxArticles = 1;
	let orders: Record<string, App.IOrdersInfo> = {};
	let loading = true;

	let expandedOrders: Record<string, boolean> = {};

	function toggleExpanded(orderId: string) {
		expandedOrders[orderId] = !expandedOrders[orderId];
	}

	onMount(async () => {
		try {
			const resp = await getOrdersList();
			if (!resp) return (loading = false);
			orders = resp;
		} finally {
			loading = false;
		}
	});

	function handlePickupClick() {
		goto('/orders/pickup');
	}
</script>

<h1 class="fw-bold mb-3">My Orders ({Object.keys(orders).length})</h1>
{#if loading}
	<Loader />
{:else if !Object.keys(orders).length}
	<div class="d-flex align-items-center flex-column">
		<p class="fs-6 text-center">No items in the orders yet.</p>
		<button on:click={handlePickupClick} class="btn btn-secondary w-75">Place your first pickup 🤩</button>
	</div>
{:else}
	<div class="d-flex flex-column gap-2 mb-3">
		{#each Object.values(orders) as order}
			<div class="order-card">
				<p class="m-0 fs-5 fw-bold">{order.Type} Order - <span class="chip bg-secondary text-primary p-1 rounded">{order.Status}</span></p>
				<p class="mt-3 m-0"><strong>Order ID:</strong> {order.ID}</p>
				<p class="m-0"><strong>Created:</strong> {DateTime.fromISO(order.CreatedAt).toFormat('dd LLL yyyy, hh:mma')}</p>
				<p><strong>No. of Articles:</strong> {order.NoOfArticles}</p>
				<p class="m-0"><strong>Order Total:</strong> ₹{order.Price.BasePrice}</p>
				<p class="m-0"><strong>Discount:</strong> ₹{order.Price.Discount}</p>
				<p class="m-0"><strong>Sub Total:</strong> ₹{order.Price.Total}</p>

				{#if order.Articles.length > 0}
					<hr />
					<div>
						<p class="fw-bold fs-6">Articles:</p>
						{#each order.Articles.slice(0, expandedOrders[order.ID] ? order.Articles.length : maxArticles) as article}
							<div class="article">
								<p class="m-0 mb-2"><strong>{article.Name}</strong> ({article.Category}) - ₹{article.Price ?? 'N/A'}</p>
								{#if article.Images && article.Images.length > 0}
									<img src={article.Images[0]} alt="Article Image" />
								{/if}
							</div>
						{/each}

						{#if order.Articles.length > maxArticles}
							<button class="btn btn-link p-0 mt-1 text-capitalize" on:click={() => toggleExpanded(order.ID)}>
								{#if expandedOrders[order.ID]}<i class="bi bi-caret-up-fill"></i> Show less{:else}<i class="bi bi-caret-down-fill"></i> Show more{/if}
							</button>
						{/if}
					</div>
				{/if}
			</div>
		{/each}
	</div>
{/if}

<style lang="scss">
	.order-card {
		border: 1px solid #ccc;
		border-radius: 12px;
		padding: 1rem;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
	}
	.article:not(:last-child) {
		margin-bottom: 0.5rem;
		border-bottom: 1px dashed #ddd;
	}
	.article {
		img {
			max-width: 80px;
			margin-bottom: 1rem;
		}

		&:last-child img {
			margin-bottom: 0;
		}
	}

	button {
		font-size: 0.8rem;
	}
	.chip {
		font-size: 0.8rem;
	}
</style>
