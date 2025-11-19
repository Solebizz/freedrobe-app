<script lang="ts">
	import { onMount } from 'svelte';
	import Loader from '$lib/components/loader.svelte';
	import { buySubscription, getSubscriptionsList } from '$lib/utils/apis';
	import { bottomSheetStore } from '$lib/stores/bottom_sheet';
	import SubscriptionSummaryAddons from './subscription_summary_addons.svelte';
	import DiscountCoupon from './discount_coupon.svelte';
	import SubscriptionOrderDetails from './subscription_order_details.svelte';

	let subscriptions: Record<string, App.ISubscriptionInfo> = {};
	let selected: App.ISubscriptionInfo;
	let loading = true;
	let submitLoading = false;
	let plansAddOnsLoading = false;
	let discountCouponsLoading = false;

	let plans: Record<string, App.IProtectionPlanInfo> | undefined = {
		'691832e12c958372717c9524': {
			ID: '691832e12c958372717c9524',
			Title: 'Basic',
			Description: 'Our Basic plan offers basic protection against loss or damage for your everyday garments.',
			Price: 0,
		},
	};
	let selectedProtectionPlan: string = '691832e12c958372717c9524';
	let discountCoupon: App.ICouopnInfo | undefined = {
		ID: '684d468807a2c336ee197038',
		Code: 'FDD50',
		Description: 'Discount Offer: 50% Off',
		Discount: 50,
	};
	let termsText = 'Subscription will start from the date of first pick up.';

	onMount(async () => {
		const resp = await getSubscriptionsList();
		if (!resp) return;

		// @ts-ignore making this handling complex
		subscriptions = resp;
		selected = subscriptions && Object.values(subscriptions)[0];
		loading = false;
	});

	async function handleAddOnsClick() {
		plansAddOnsLoading = true;
		plans = await getSubscriptionsList(true);
		if (!plans) return;
		bottomSheetStore.setSheet({
			show: true,
			children: SubscriptionSummaryAddons,
			heightOffset: 50,
			props: {
				plans,
				selectProtectionPlan: (planId: string) => {
					selectedProtectionPlan = planId;
				},
			},
		});
		plansAddOnsLoading = false;
	}

	async function handleDiscountCoupons() {
		submitLoading = true;

		bottomSheetStore.setSheet({
			show: true,
			children: DiscountCoupon,
			heightOffset: 50,
			props: {
				updateDiscountCoupon: (coupon: App.ICouopnInfo) => {
					discountCoupon = coupon;
				},
			},
		});
		submitLoading = false;
	}

	async function handleOrderDetails() {
		submitLoading = true;
		try {
			const params = {
				subscriptionId: selected.ID,
				protectionId: selectedProtectionPlan || '',
				couponId: discountCoupon?.ID || '',
			};
			const resp = await buySubscription(params);
			if (!resp) return;

			bottomSheetStore.setSheet({
				show: true,
				heightOffset: 50,
				children: SubscriptionOrderDetails,
				props: {
					data: resp.subscriptionOrderInfo,
				},
			});
		} finally {
			submitLoading = false;
		}
	}
</script>

{#if loading}
	<Loader />
{:else if subscriptions}
	<div class="d-flex flex-column gap-2">
		<form class="d-flex flex-column gap-2">
			<h1 class="fw-bold mb-3 fs-5">Available Plans</h1>
			{#each Object.values(subscriptions) as subscription}
				{@const finalPrice = Number(subscription.Price) - Math.floor(Number(subscription.Price) * ((discountCoupon?.Discount || 100) / 100))}
				<div class="selectBox-ssa radio">
					<input class="bg-white" type="radio" name="radio" id={subscription.ID} value={subscription} bind:group={selected} />
					<label class="rounded-3 border" for={subscription.ID}>
						<div class="d-flex justify-content-between">
							<div>
								<p class="fw-bold fs-5 m-0">{subscription.Title}</p>
								<p class="mt-1">Billed for 3 months</p>
							</div>
							<div class="d-flex flex-column align-items-end">
								<p class="m-0">
									<span class="currency fw-bold">₹</span><span class="fs-5 fw-bold me-1" class:d-none={!discountCoupon}>{finalPrice}</span>
									<span class="fs-5 fw-bold td-thickness" class:text-decoration-line-through={discountCoupon}>{subscription.Price} </span>
								</p>
								<p>/month</p>
							</div>
						</div>

						<p class="m-0 mt-1">{subscription.Description}</p>
						<ul class="px-3 pt-2">
							{#each subscription.Features as f}
								<li>{f}</li>
							{/each}
						</ul>
					</label>
				</div>
			{/each}
		</form>

		<h1 class="fw-bold mt-4 fs-5">Protection Plans</h1>
		<div class="rounded-3 border p-3" class:border-secondary={!!(plans && selectedProtectionPlan)} class:border-3={!!(plans && selectedProtectionPlan)} on:click={handleAddOnsClick}>
			<p class="fw-bold fs-6 mb-1">Get Insured</p>
			<p>Our Protection Plans are designed to give you peace of mind, safeguarding your stored goods from risks like theft, fire, and accidental damage—so you can store with confidence.</p>
			{#if plans && selectedProtectionPlan}
				<div class="bg-info-subtle p-3 rounded-3">
					<div class="d-flex justify-content-between">
						<p class="fw-bold fs-6 m-0">Selected: {plans[selectedProtectionPlan].Title}</p>
						<button
							class="m-0 fw-bold text-danger border-0 bg-transparent"
							on:click|stopPropagation={() => {
								selectedProtectionPlan = '';
							}}>
							Remove
						</button>
					</div>
					<!-- DO NOT remove == -->
					<p class="m-0">Price: {plans[selectedProtectionPlan].Price === 0 ? 'Free' : `₹${plans[selectedProtectionPlan].Price} / 3months`}</p>
				</div>
			{/if}
			<div class="d-flex gap-3 mt-4">
				<p class="m-0 fw-bold text-primary">Compare Plans →</p>
				{#if plansAddOnsLoading}<Loader />{/if}
			</div>
		</div>

		<h1 class="fw-bold mt-4 fs-5">Available Offers</h1>
		<div class="rounded-3 border p-3" class:border-secondary={!!discountCoupon} class:border-3={!!discountCoupon} on:click={handleDiscountCoupons}>
			<p class="fw-bold fs-6 mb-1">Discount Coupons</p>
			<p>Get the best discounts on your favourite subscription with our exclusive coupons.</p>
			{#if discountCoupon}
				<div class="bg-info-subtle rounded-3 p-3">
					<div class="d-flex gap-3 mb-1 justify-content-between align-items-center">
						<p class="fw-bold fs-6 m-0">Applied: {discountCoupon.Code}</p>
						<button
							class="m-0 fw-bold text-danger border-0 bg-transparent"
							on:click|stopPropagation={() => {
								discountCoupon = undefined;
							}}>
							Remove
						</button>
					</div>

					<p class="m-0">{discountCoupon.Description}</p>
				</div>
			{/if}
			<div class="d-flex gap-3 mt-4">
				<p class="mt-1 m-0 fw-bold text-primary">Apply Now →</p>

				{#if discountCouponsLoading}<Loader />{/if}
			</div>
		</div>
		<button on:click={handleOrderDetails} disabled={submitLoading} class="submit-cta btn p-2 btn-primary w-100 mt-3 d-flex align-items-center justify-content-center gap-2 shadow"
			><span>Continue with {selected?.Title}</span>{#if submitLoading}<Loader />{/if}</button>
		<p class="text-primary">* {termsText}</p>
	</div>
{/if}

<style lang="scss">
	.selectBox-ssa {
		.currency {
			position: relative;
			top: -0.25rem;
		}
		input {
			display: none;
			&:checked {
				+ label {
					display: block;
					border-color: var(--bs-secondary);
					z-index: 1;
					box-shadow: 0 0 0 3px var(--bs-tertiary-bg);
					background-color: var(--bs-secondary-bg);
					color: var(--bs-primary);
					&:before {
						background: var(--bs-primary);
						box-shadow: 0 0 0 1px var(--bs-secondary);
					}
				}
			}
		}
		label {
			display: block;
			border: 1px solid var(--bs-tertiary-bg);
			position: relative;
			padding: 33px 15px 15px 40px;
			cursor: pointer;
			&:before {
				content: '';
				width: 15px;
				height: 15px;
				box-shadow: 0 0 0 1px var(--bs-tertiary-bg);
				border: 3px solid var(--bs-white);
				position: absolute;
				left: 15px;
				top: 20%;
				transform: translateY(-50%);
			}
			&:hover {
				border-color: var(--bs-secondary-bg);
				z-index: 1;
			}
		}
		&.radio {
			label {
				&:before {
					border-radius: 100%;
				}
			}
		}
	}
	.submit-cta {
		i {
			font-size: 0.8rem;
		}
	}
</style>
