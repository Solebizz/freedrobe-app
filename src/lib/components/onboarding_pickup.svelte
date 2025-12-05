<script lang="ts">
	import { goto } from '$app/navigation';
	import { APP } from '$lib/stores/appMain';
	import Field, { type IField } from '$lib/components/field.svelte';
	import OrderDetails from '$lib/components/order_details.svelte';
	import { bottomSheetStore } from '$lib/stores/bottom_sheet';
	import { placeOrderAndFetchPrice } from '$lib/utils/apis';
	import { addError, addNotice } from '$lib/stores/notices';
	import { DateTime } from 'luxon';
	import type { SvelteComponent } from 'svelte';

	export let isOnboardingFlow = false; // Whether this is part of the onboarding flow

	let form: HTMLFormElement;
	let pickupOrder: Record<string, any> = {};
	let loading = false;

	const timeRanges = [
		{ label: '10:00 AM - 12:00 PM', value: '1000-1200' },
		{ label: '11:00 AM - 2:00 PM', value: '1100-1400' },
		{ label: '3:00 PM - 6:00 PM', value: '1500-1800' },
	];

	let fields: IField[] = [
		{
			key: 'NoOfArticles',
			definition: {
				Edit: true,
				Label: 'No of Articles',
				Type: 'int',
				Required: true,
				HTMLAttributes: {
					placeholder: '0 - 10',
				},
			},
		},
		{
			key: 'Date',
			definition: {
				Edit: true,
				Label: 'Select Date',
				Type: 'Date',
				Required: true,
				Default: DateTime.now().plus({ day: 1 }).toFormat('yyyy-MM-dd'),
			},
		},
		{
			key: 'Time',
			definition: {
				Edit: true,
				Label: 'Select Time',
				Type: 'select',
				Options: timeRanges,
				Required: true,
			},
		},
	];

	function parseTime(time: string) {
		return {
			hour: parseInt(time.slice(0, 2), 10),
			minute: parseInt(time.slice(2, 4), 10),
		};
	}

	async function handleBookNow() {
		if (!$APP.User?.ActiveSubscription) return addError('No active subscriptions. Subscribe to continue.', 5);
		const maxPickupArticles = $APP.User.TotalStorageValue - $APP.User.StorageValue;

		if (maxPickupArticles < pickupOrder.NoOfArticles) return addError('Value must be less than available storage', 5);

		const [startTimeStr, endTimeStr] = pickupOrder.Time.split('-');

		const { hour: startHour, minute: startMinute } = parseTime(startTimeStr);
		const { hour: endHour, minute: endMinute } = parseTime(endTimeStr);

		const baseDate = DateTime.fromISO(pickupOrder.Date);
		const today = DateTime.now();
		if (today > baseDate) return addError('Cannot schedule pickups for previous dates.', 5);

		const startDateTime = baseDate.set({ hour: startHour, minute: startMinute, second: 0, millisecond: 0 });
		const endDateTime = baseDate.set({ hour: endHour, minute: endMinute, second: 0, millisecond: 0 });

		const params = {
			type: 'Pickup',
			noOfArticles: pickupOrder.NoOfArticles,
			completionTimeSlotStart: startDateTime.toMillis(),
			completionTimeSlotEnd: endDateTime.toMillis(),
		};

		loading = true;
		const resp = await placeOrderAndFetchPrice(params);
		loading = false;

		if (resp && resp.ID) {
			bottomSheetStore.setSheet({
				show: true,
				children: OrderDetails as typeof SvelteComponent,
				heightOffset: 50,
				props: {
					order: resp,
					referrerComponent: 'order/pickup',
				},
			});
		}
	}

	function handleBookLater() {
		goto(isOnboardingFlow ? '/closet' : '/orders', { replaceState: true });
	}

	$: disabled = !form || !form.checkValidity() || !pickupOrder || loading;
</script>

<div class="px-3">
	<div class="bg-white p-4 rounded-4 shadow-sm">
		<h2 class="fw-bold fs-4 mb-2">Schedule Pickup</h2>
		<p class="text-muted mb-4">Please choose your preferred date and time.</p>

		<form bind:this={form} on:submit|preventDefault={handleBookNow}>
			<div class="form-fields">
				{#each fields as { key, definition }}
					<div class="mb-3" data-field={key}>
						<Field {key} {definition} bind:value={pickupOrder[key]} />
					</div>
				{/each}
			</div>

			<div class="d-flex gap-2 mt-4">
				<button type="button" class="btn btn-secondary flex-fill py-2 text-uppercase fw-bold" on:click={handleBookLater}> Book Later </button>
				<button type="submit" class="btn btn-primary flex-fill py-2 text-uppercase fw-bold" {disabled}> Book Now </button>
			</div>
		</form>

		<p class="text-muted small mt-3 mb-0">
			<span class="text-danger">*</span> You may find some dates unavailable for scheduling pickup due to high demand.
		</p>
	</div>
</div>

<style lang="scss">
	.form-fields {
		max-width: 100%;
	}
</style>
