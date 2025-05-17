<script lang="ts">
	import { onMount } from 'svelte';
	import Loader from '$lib/components/loader.svelte';
	import { buySubscription, getSubscriptionsList } from '$lib/utils/apis';
	import { goto } from '$app/navigation';
	import { bottomSheetStore } from '$lib/stores/bottom_sheet';
	import SubscriptionSummaryAddons from './subscription_summary_addons.svelte';

	let subscriptions: Record<string, App.ISubscriptionInfo> = {};
	let selected: App.ISubscriptionInfo;
	let loading = true;
	let submitLoading = false;
	let plansAddOnsLoading = false;

	let plans: Record<string, App.IProtectionPlanInfo> | undefined = {};
	let selectedProtectionPlan: string;
	let selectedCouponText: string = '';
	let termsText = 'Subscription will start from the date of your first pick up.';

	onMount(async () => {
		const resp = await getSubscriptionsList();
		if (!resp) return;

		// @ts-ignore making this handling complex
		subscriptions = resp;
		selected = subscriptions && Object.values(subscriptions)[0];
		loading = false;
	});

	async function startPaymentFlow() {
		submitLoading = true;
		try {
			const resp = await buySubscription(selected.ID);
			if (!resp) return;
			goto('/payment/initiate', {
				state: {
					amount: selected.Price,
					paymentGatewayEntityId: resp.paymentGatewayEntityId,
					referrer: 'subscription_list',
				},
			});
		} finally {
			submitLoading = false;
		}
	}

	async function handleAddOnsClick() {
		plansAddOnsLoading = true;
		plans = await getSubscriptionsList(true);
		if (!plans) return;
		bottomSheetStore.setSheet({
			show: true,
			children: SubscriptionSummaryAddons,
			props: {
				plans,
				selectProtectionPlan: (planId: string) => {
					selectedProtectionPlan = planId;
				},
			},
		});
		plansAddOnsLoading = false;
	}
</script>

{#if loading}
	<Loader />
{:else if subscriptions}
	<div class="d-flex flex-column gap-2">
		<h1 class="fw-bold mb-3">Available Plans</h1>

		{#each Object.values(subscriptions) as subscription}
			<div class="selectBox radio">
				<input type="radio" name="radio" id={subscription.ID} value={subscription} bind:group={selected} />
				<label class="rounded-3 border" for={subscription.ID}>
					<div class="d-flex justify-content-between">
						<p class="fw-bold fs-5 m-0">{subscription.Title}</p>
						<p class="m-0"><span class="currency fw-bold">₹</span><span class="fs-5 fw-bold">{subscription.Price}</span><span>/mo</span></p>
					</div>
					<p class="mt-1">Billed half yearly</p>

					<p class="m-0 mt-1">{subscription.Description}</p>
					<ul class="px-3 pt-2">
						{#each subscription.Features as f}
							<li>{f}</li>
						{/each}
					</ul>
				</label>
			</div>
		{/each}

		<h1 class="fw-bold mt-4">Additional Add-ons</h1>
		<div class="rounded-3 border p-3" on:click={handleAddOnsClick}>
			<p class="fw-bold fs-6 m-0">Protection Plans</p>
			<p>Stay worry-free with comprehensive protection from damage, loss & more, ensuring peace of mind for your wardrobe.</p>
			{#if plans && selectedProtectionPlan}
				<p class="fw-bold fs-6 m-0">Selected: {plans[selectedProtectionPlan].Title}</p>
			{/if}
			<div class="d-flex gap-3">
				<p class="mt-1 m-0 fw-bold text-primary">Compare Plans →</p>
				{#if plansAddOnsLoading}<Loader />{/if}
			</div>
		</div>

		<div class="rounded-3 border p-3">
			<p class="fw-bold fs-6 m-0">Discount Coupons</p>
			<p>Get the best discounts on your favourite subscription with our exclusive coupons.</p>
			<p class="mt-1 m-0 fw-bold">Apply now →</p>
		</div>
		<button on:click={startPaymentFlow} disabled={submitLoading} class="submit-cta btn btn-primary w-100 mt-3 d-flex align-items-center justify-content-center gap-2 shadow"
			><span>Continue with {selected?.Title}</span>{#if submitLoading}<Loader />{/if}</button>
		<p class="text-primary">* {termsText}</p>
	</div>
{/if}

<style lang="scss">
	.selectBox {
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
	.selectBoxGroup {
		display: flex;
		flex-wrap: wrap;
		.selectBox {
			&:first-child {
				margin-left: 0;
			}
		}
		@media screen and (max-width: 568px) {
			flex-direction: column;
			.selectBox {
				margin-left: 0;
				label {
					width: 100%;
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
