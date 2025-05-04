<script lang="ts">
	import { goto } from '$app/navigation';
	import CardDetail from '$lib/components/card_detail.svelte';
	import Loader from '$lib/components/loader.svelte';
	import OrderDetails from '$lib/components/order_details.svelte';
	import { bottomSheetStore } from '$lib/stores/bottom_sheet';
	import { getOrdersList } from '$lib/utils/apis';
	import { DateTime } from 'luxon';
	import { onMount } from 'svelte';

	const maxVisibleArticles = 1;

	let orders: Record<string, App.IOrdersInfo> = {};
	let loading = true;
	let showMoreText = false;
	let expandedOrders: Record<string, boolean> = {};

	function toggleExpanded(order: App.IOrdersInfo) {
		bottomSheetStore.setSheet({
			show: true,
			children: OrderDetails,
			props: {
				order,
			},
		});
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

<h1 class="fw-bold mb-3 d-flex gap-3">
	My Orders ({Object.keys(orders).length})
	{#if Object.keys(orders).length}
		<button on:click={handlePickupClick} class="btn btn-primary shadow">Schedule</button>{/if}
</h1>

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
					<p class="fw-bold fs-6">Articles:</p>
					<div class="d-flex gap-2 flex-wrap">
						{#each order.Articles.slice(0, expandedOrders[order.ID] ? order.Articles.length : maxVisibleArticles) as article}
							<div class="article">
								{#if article.Images && article.Images.length > 0}
									<img class="rounded border border-black" src={article.Images[0]} alt="Article Image" />
								{/if}
							</div>
						{/each}

						{#if !expandedOrders[order.ID] && order.Articles.length > maxVisibleArticles}
							<!-- The next article thumbnail with overlay -->
							<div class="article position-relative">
								{#if order.Articles[maxVisibleArticles]?.Images?.[0]}
									<img class="rounded faded border border-black" src={order.Articles[maxVisibleArticles].Images[0]} on:load={() => (showMoreText = true)} alt="Article Image" />
									{#if showMoreText}
										<div class="overlay">
											+{order.Articles.length - maxVisibleArticles} more
										</div>
									{/if}
								{/if}
							</div>
						{/if}
					</div>
				{/if}
				<button class="btn btn-link p-0 mt-2 text-capitalize" on:click={() => toggleExpanded(order)}>
					{#if expandedOrders[order.ID]}<i class="bi bi-caret-up-fill"></i> Show less{:else}<i class="bi bi-caret-down-fill"></i> Show details{/if}
				</button>
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

	.article {
		position: relative;

		img {
			max-width: 80px;
			height: auto;
			display: block;
		}

		&:last-child img {
			margin-bottom: 0;
		}
	}

	.article {
		.faded {
			opacity: 0.4;
			cursor: pointer;
		}
	}

	.overlay {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: rgb(103, 103, 103);
		color: #fff;
		padding: 4px 8px;
		border-radius: 6px;
		font-size: 0.8rem;
		pointer-events: none;
		white-space: nowrap;
	}

	button {
		font-size: 0.8rem;
	}

	.chip {
		font-size: 0.8rem;
	}
</style>
