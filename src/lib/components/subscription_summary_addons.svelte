<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let plans: Record<string, App.IProtectionPlanInfo>;
	export let selectProtectionPlan: (id: string) => {};

	let selectedPlan: App.IProtectionPlanInfo;

	const dispatch = createEventDispatcher();

	function submitForm() {
		selectProtectionPlan(selectedPlan.ID);
		dispatch('close');
	}

	$: disabled = !selectedPlan;
</script>

<p class="fs-5 fw-bold mb-1">Protection Plans</p>
<form class="mt-3 d-flex flex-column gap-2">
	{#each Object.values(plans) as plan}
		<div class="selectBox-ssa radio">
			<input type="radio" name="radio" id={plan.ID} value={plan} bind:group={selectedPlan} />
			<label class="rounded-3 border" for={plan.ID}>
				<div class="d-flex justify-content-between">
					<p class="fw-bold fs-5 m-0">{plan.Title}</p>
					<p class="m-0"><span class="currency fw-bold">₹</span><span class="fs-5 fw-bold">{plan.Price}</span>/6 months</p>
				</div>

				<p class="m-0 mt-1">{plan.Description}</p>
			</label>
		</div>
	{/each}
	<button on:click={submitForm} {disabled} class="submit-cta btn p-2 btn-primary w-100 mt-3 d-flex align-items-center justify-content-center gap-2 shadow"><span>Continue</span></button>
</form>

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
</style>
