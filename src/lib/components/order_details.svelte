<script lang="ts">
	import { DateTime } from 'luxon';
	import Loader from './loader.svelte';
	import { goto } from '$app/navigation';
	import { cancelOrder } from '$lib/utils/apis';
	import { addError, addNotice, type NoticeWithoutMeta } from '$lib/stores/notices';
	import { createEventDispatcher } from 'svelte';
	import { noop } from '$lib/utils/globals';

	export let order: App.IOrdersInfo;
	export let referrerComponent = 'orders';
	export let onCancelOrder = noop;

	const dispatch = createEventDispatcher();

	const showPaymentOptionFor = ['basket', 'order/pickup'];

	let loading = false;

	async function handleCancelOrder() {
		const params = {
			orderId: order.ID,
		};
		const resp = await cancelOrder(params);
		if (!resp) return;
		const noticeObj: NoticeWithoutMeta = {
			type: 'info',
			msg: 'Order Cancelled Successfully.',
			snooze: 5,
		};
		addNotice(noticeObj);
		onCancelOrder();
		dispatch('close');

		window.location.reload();
	}

	async function handleClickPayment() {
		loading = true;
		try {
			goto('/payment/initiate', {
				state: {
					amount: order.Price,
					paymentGatewayEntityId: order.PaymentGatewayID,
					referrer: referrerComponent,
					orderUnderscoreId: order.ID,
				},
			});
		} finally {
			dispatch('close');
			loading = false;
		}
	}
</script>

<div class="order-card">
	<div class="d-flex justify-content-between align-items-center mt-2">
		<p class="m-0 fs-5 fw-bold">{order.Type} Order</p>
		<span class="chip bg-secondary text-primary p-1 rounded" class:bg-danger={order.Status === 'Cancelled'} class:text-white={order.Status === 'Cancelled'}>{order.Status}</span>
	</div>
	{#if order?.ConfirmationCode}
		<p class="mt-3 m-0"><strong>OTP:</strong> {order.ConfirmationCode}</p>
	{/if}
	<p class="mt-3 m-0"><strong>Receipt ID:</strong> {order.ReceiptID}</p>
	<p class="m-0"><strong>Placed on:</strong> {DateTime.fromISO(order.CreatedAt).toFormat('dd LLL yyyy, hh:mma')}</p>
	<p><strong>No. of Articles:</strong> {order.NoOfArticles}</p>
	<p class="m-0"><strong>Order Total:</strong> ₹{order.Price.BasePrice}</p>
	<p class="m-0"><strong>Discount:</strong> ₹{order.Price.Discount}</p>
	<p class="m-0"><strong>Sub Total:</strong> ₹{order.Price.Total}</p>

	{#if showPaymentOptionFor.includes(referrerComponent)}
		<button on:click={handleClickPayment} class="btn btn-primary text-uppercase mb-3 d-flex justify-content-center gap-2 w-100 mt-3">
			Confirm & Pay {#if loading}<Loader />{/if}</button>
	{/if}

	{#if referrerComponent === 'order/cancel'}
		<p>
			<button on:click={handleCancelOrder} class="btn btn-danger text-uppercase mb-3 d-flex justify-content-center gap-2 w-100 mt-3">
				Confirm Cancel {#if loading}<Loader />{/if}</button>
		</p>{/if}

	{#if order.Articles.length > 0}
		<hr />
		<div>
			<p class="fw-bold fs-6">Articles:</p>
			{#each order.Articles as article}
				<div class="article">
					<p class="m-0 mb-2"><strong>{article.Name}</strong> ({article.Category}) - ₹{article.Price ?? 'N/A'}</p>
					{#if article.Images && article.Images.length > 0}
						<img src={article.Images[0]} alt="Article Image" height="80" />
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style lang="scss">
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
