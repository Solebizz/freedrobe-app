<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { IField } from './field.svelte';
	import Field from './field.svelte';
	import { fetchCouponInfo } from '$lib/utils/apis';
	import { AVAILABLE_COUPONS } from '$lib/utils/constants';
	import Loader from './loader.svelte';

	export let updateDiscountCoupon: (id: App.ICouopnInfo) => {};
	export let currentCoupon: App.ICouopnInfo | undefined = undefined;

	let obj: Record<string, any> = {};
	let form: HTMLFormElement;
	let applyingCoupon = false;

	const fields: IField[] = [
		{
			key: 'Coupon',
			definition: {
				Label: 'Enter Coupon Code',
				Required: true,
				Edit: true,
				Type: 'text',
			},
		},
	];

	const dispatch = createEventDispatcher();

	async function submitForm() {
		if (!obj.Coupon) return;

		applyingCoupon = true;
		const resp = await fetchCouponInfo(obj.Coupon);
		applyingCoupon = false;

		if (!resp) {
			return;
		}

		updateDiscountCoupon(resp.discountInfo);
		dispatch('close');
	}

	function applyCoupon(coupon: App.ICouopnInfo) {
		updateDiscountCoupon(coupon);
		dispatch('close');
	}

	$: disabled = !form || !form.checkValidity() || !obj || applyingCoupon;
</script>

<p class="fs-5 fw-bold mb-1">Apply Coupon</p>
<main class="mt-3">
	<!-- Manual Coupon Entry Form -->
	<form method="post" class="position-relative d-flex flex-column gap-2 mb-4" bind:this={form} on:submit|preventDefault={submitForm}>
		<div class="narrow-form">
			{#each fields as { key, definition }}
				<div class="mb-3" data-field={key}>
					<Field {key} {definition} bind:value={obj[key]} />
				</div>
			{/each}
		</div>

		<button class="d-none">Needed for ENTER to submit</button>
		<button on:click={() => form.checkValidity()} {disabled} type="submit" class="btn btn-primary text-uppercase d-flex align-items-center justify-content-center gap-2">
			{#if applyingCoupon}
				<Loader />
			{:else}
				Apply Code
			{/if}
		</button>
	</form>

	<!-- Available Coupons Section -->
	<div class="available-coupons">
		<h6 class="fw-bold mb-3">Available Coupons</h6>

		<div class="d-flex flex-column gap-2">
			{#each AVAILABLE_COUPONS as coupon}
				{@const isApplied = currentCoupon?.ID === coupon.ID}
				<div
					class="coupon-card border rounded-3 p-3"
					class:applied={isApplied}
					on:click={() => applyCoupon(coupon)}
					role="button"
					tabindex="0"
					on:keydown={(e) => e.key === 'Enter' && applyCoupon(coupon)}>
					<div class="d-flex justify-content-between align-items-start mb-2">
						<div class="coupon-code bg-primary text-white px-2 py-1 rounded fw-bold">
							{coupon.Code}
						</div>
						<div class="text-primary fw-bold">
							{coupon.DirectDiscount ? `₹${coupon.Discount} OFF` : `${coupon.Discount}% OFF`}
						</div>
					</div>
					<p class="text-muted m-0 small">{coupon.Description}</p>
					<div class="mt-2 text-end">
						{#if isApplied}
							<span class="text-success small fw-bold">
								<i class="bi bi-check-circle-fill me-1"></i>Applied
							</span>
						{:else}
							<span class="text-primary small fw-bold">Apply →</span>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>
</main>

<style>
	.coupon-card {
		cursor: pointer;
		transition: all 0.2s ease;
		background-color: #f8f9fa;
	}

	.coupon-card:hover {
		border-color: var(--bs-primary) !important;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		transform: translateY(-2px);
	}

	.coupon-card.applied {
		border-color: var(--bs-success) !important;
		background-color: #d1e7dd;
		border-width: 2px !important;
	}

	.coupon-card.applied:hover {
		border-color: var(--bs-success) !important;
		box-shadow: 0 2px 8px rgba(25, 135, 84, 0.2);
	}

	.coupon-code {
		font-size: 0.875rem;
		letter-spacing: 0.5px;
	}
</style>
