<script lang="ts">
	import { goto } from '$app/navigation';
	import Loader from '$lib/components/loader.svelte';
	import OrderDetails from '$lib/components/order_details.svelte';
	import { APP } from '$lib/stores/appMain';
	import { bottomSheetStore } from '$lib/stores/bottom_sheet';
	import { getOrdersList } from '$lib/utils/apis';
	import { DateTime } from 'luxon';
	import { onMount } from 'svelte';

	const maxVisibleArticles = 1;

	let loading = true;
	let expandedOrders: Record<string, boolean> = {};

	$: isLogistics = $APP.User?.UserRole === 'logistics';
	$: isAdmin = $APP.User?.UserRole === 'admin';
	$: isEndUser = $APP.User?.UserRole === 'endUser';

	function toggleExpanded(order: App.IOrdersInfo) {
		bottomSheetStore.setSheet({
			show: true,
			children: OrderDetails,
			props: {
				order,
			},
		});
	}

	function toggleCancel(order: App.IOrdersInfo) {
		bottomSheetStore.setSheet({
			show: true,
			children: OrderDetails,
			props: {
				order,
				referrerComponent: 'order/cancel',
				onCancelOrder: fetchOrdersList,
			},
		});
	}

	async function fetchOrdersList() {
		try {
			if (!$APP.User?.LocationId) return;
			const resp = await getOrdersList();
			if (!resp) return (loading = false);
			$APP.Orders = resp;
		} finally {
			loading = false;
		}
	}

	function handleAddDetails(orderID: string) {
		goto(`/orders/add-details/${orderID}`);
	}

	onMount(fetchOrdersList);

	function handlePickupClick() {
		goto('/orders/pickup');
	}
</script>

<h1 class="fw-bold mb-3 fs-5">
	{#if isEndUser}My{/if} Orders
</h1>

{#if loading}
	<Loader />
{:else if !Object.keys($APP.Orders || {}).length}
	{#if $APP.User?.ActiveSubscription}
		<div class="d-flex align-items-center flex-column mt-2">
			<p class="fs-6 text-center">No items in the orders yet.</p>
			<button on:click={handlePickupClick} class:d-none={Object.values($APP?.Orders || {}).length} class="btn btn-primary w-75">Book your first pickup</button>
		</div>
	{:else if isEndUser}
		<p class="text-center fs-6">No active subscription.</p>
	{:else}
		<p class="text-center fs-6">No items in the orders yet.</p>
	{/if}
{:else}
	<div class="d-flex flex-column gap-2 mb-3">
		{#each Object.values($APP?.Orders || {}) as order}
			<div class="order-card">
				<div class="d-flex justify-content-between align-items-center">
					<p class="m-0 fs-5">{order.Type} Order</p>
					<span class="chip bg-secondary text-primary p-1 rounded" class:bg-danger={order.Status === 'Cancelled'} class:text-white={order.Status === 'Cancelled'}>{order.Status}</span>
				</div>
				{#if !isLogistics && order?.ConfirmationCode}
					<p class="mt-3 m-0"><strong>OTP:</strong> {order.ConfirmationCode}</p>
				{/if}
				<p class="mt-3 m-0"><strong>Receipt ID:</strong> {order.ReceiptID}</p>
				<p class="m-0"><strong>Placed on:</strong> {DateTime.fromISO(order.CreatedAt).toFormat('dd LLL yyyy, hh:mma')}</p>
				<p><strong>No. of Articles:</strong> {order.NoOfArticles}</p>
				<p class="m-0"><strong>Order Total:</strong> ₹{order.Price.BasePrice}</p>
				<p class="m-0"><strong>Discount:</strong> ₹{order.Price.Discount}</p>
				<p class="m-0"><strong>Sub Total:</strong> ₹{order.Price.Total}</p>

				{#if isLogistics && order.UserInfo?.Address}
					<p class="mt-3 m-0"><strong>Pickup Address:</strong></p>
					<p class="m-0">Line 1: {order.UserInfo?.Address?.Line1}</p>
					<p class="m-0">Line 2: {order.UserInfo?.Address?.Line2}</p>
				{/if}

				{#if order.Articles.length > 0}
					<hr />
					<p class="fw-bold fs-6">Articles:</p>
					<div class="d-flex gap-2 flex-wrap">
						{#each order.Articles.slice(0, expandedOrders[order.ID] ? order.Articles.length : maxVisibleArticles) as article}
							<div class="article">
								{#if article.Images && article.Images.length > 0}
									<img class="rounded border border-black" width="100" height="100" src={article.Images[0]} alt="Article Image" />
								{/if}
							</div>
						{/each}

						{#if !expandedOrders[order.ID] && order.Articles.length > maxVisibleArticles}
							<div class="article position-relative">
								{#if order.Articles[maxVisibleArticles]?.Images?.[0]}
									<img class="rounded faded border border-black" width="100" height="100" src={order.Articles[maxVisibleArticles].Images[0]} alt="Article Image" />
									<div class="overlay">
										+{order.Articles.length - maxVisibleArticles} more
									</div>
								{/if}
							</div>
						{/if}
					</div>
				{/if}
				<div class="d-flex gap-3 mt-1">
					{#if isAdmin && !order.Articles.length && order.Status === 'Picked Up'}
						<button class="btn btn-link p-0 mt-2 text-capitalize" on:click={() => handleAddDetails(order.ID)}>
							<i class="bi bi-plus-circle"></i> Add details
						</button>
					{:else}
						<button class="btn btn-link p-0 mt-2 text-capitalize" on:click={() => toggleExpanded(order)}>
							{#if expandedOrders[order.ID]}<i class="bi bi-caret-up-fill"></i> Show less{:else}<i class="bi bi-caret-down-fill"></i> Show details{/if}
						</button>
					{/if}
					{#if $APP.User?.UserRole === 'endUser' && order.Status === 'Order Placed'}
						<button class="btn btn-link p-0 mt-2 text-capitalize text-danger" on:click|stopPropagation={() => toggleCancel(order)}> Cancel </button>
					{/if}
				</div>
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
