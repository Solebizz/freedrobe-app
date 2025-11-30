<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { createEventDispatcher } from 'svelte';
	import Loader from './loader.svelte';

	export let data: App.ISubscriptionOrderInfo;
	const dispatch = createEventDispatcher();

	const {
		CouponCode,
		Total,
		GatewayEntityId,
		PriceBreakup: { SubscriptionAmount, DiscountAmount, DiscountPercent, ProtectionPlanAmount },
	} = data;
	let loading = false;

	$: isOnboarding = $page.url.pathname.includes('/onboarding');

	async function startPaymentFlow() {
		loading = true;
		try {
			goto('/payment/initiate', {
				state: {
					amount: Total,
					paymentGatewayEntityId: GatewayEntityId,
					referrer: isOnboarding ? 'onboarding_subscription' : 'subscription_list',
				},
			});
		} finally {
			dispatch('close');
			loading = false;
		}
	}
</script>

<p class="fs-4 fw-bold">Order Details</p>
<div class="mt-3">
	<div class="amount-grid">
		<div class="amount-row">
			<div class="amount-label">Subscription (3 months):</div>
			<div class="amount-value">₹{SubscriptionAmount}</div>
		</div>
		<div class="amount-row">
			<div class="amount-label">Protection Plan:</div>
			<div class="amount-value">₹{ProtectionPlanAmount}</div>
		</div>
		<div class="amount-row">
			<div class="amount-label">Discount ({DiscountPercent}%):</div>
			<div class="amount-value">- ₹{DiscountAmount}</div>
		</div>
		<div class="total">
			<div class="amount-label total-label mt-3">Total Payable Amount:</div>
			<div class="total-value mt-3">₹{Total}</div>
		</div>
	</div>
</div>

<button on:click={startPaymentFlow} class="btn btn-primary text-uppercase mb-3 d-flex justify-content-center gap-2 w-100 mt-3">
	Confirm & Pay {#if loading}<Loader />{/if}</button>

<style>
	.amount-grid {
		display: grid;
		grid-template-columns: 1fr auto; /* label | amount */
		gap: 8px 16px;
		max-width: 400px;
		font-family: sans-serif;
	}

	.amount-row {
		display: contents;
	}

	.amount-label {
		font-weight: bold;
	}

	.amount-value {
		text-align: right;
	}

	.total {
		display: contents;
	}

	.total-value {
		text-align: right;
		font-weight: bold;
	}
</style>
