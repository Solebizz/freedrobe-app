<script lang="ts">
	import { onMount } from 'svelte';
	import Loader from '$lib/components/loader.svelte';
	import { subscriptions } from '$lib/utils/data';

	let memberships = subscriptions;
	let selected;
	let loading = true;
	let termsText = 'Subscription will be start from the date of payment.';

	onMount(async () => {
		if (!memberships) return;
		selected = memberships && Object.values(memberships)[0];
		loading = false;
	});

	async function startPaymentFlow() {}
</script>

{#if loading}
	<Loader />
{/if}

{#if memberships}
	<div class="d-flex flex-column gap-2">
		<h1 class="fw-bold mb-3">Available Plans.</h1>

		{#each Object.values(memberships) as membership}
			<div class="selectBox radio">
				<input type="radio" name="radio" id={membership.ID} value={membership} bind:group={selected} />
				<label class="rounded-3 border" for={membership.ID}>
					<p class="fw-bold">{membership.Name}</p>
					<p class="m-0"><span class="currency fw-bold">₹</span><span class="fs-5 fw-bold">{membership.Price}</span> / {membership.Validity} articles</p>
					<p class="m-0 mt-1">{@html membership.Description}</p>
				</label>
			</div>
		{/each}
		<button on:click={startPaymentFlow} class="submit-cta btn btn-primary w-100 mt-3 d-flex align-items-center justify-content-center gap-2 shadow"><span>Continue with {selected?.Name}</span></button>
		<p class="m-0 text-center">OR</p>
		<button on:click={startPaymentFlow} class="submit-cta btn btn-secondary text-white w-100 d-flex align-items-center justify-content-center gap-2 shadow"><span>Pay @ Pickup</span></button>
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
			padding: 15px 15px 15px 40px;
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
