<script lang="ts">
	import Field, { type IField } from '$lib/components/field.svelte';
	import OrderDetails from '$lib/components/order_details.svelte';
	import { APP } from '$lib/stores/appMain';
	import { bottomSheetStore } from '$lib/stores/bottom_sheet';
	import { addError } from '$lib/stores/notices';
	import { placeOrderAndFetchPrice } from '$lib/utils/apis';
	import { DateTime } from 'luxon';
	import type { SvelteComponent } from 'svelte';

	let pickupOrder: Record<string, any> = {};
	let form: HTMLFormElement;

	const captionText = 'You may find some dates unavailable for scheduling pickup due to high demand.';

	const timeRanges = [
		{ label: '11:00 AM - 2:00 PM', value: '1100-1400' },
		{ label: '3:00 PM - 6:00 PM', value: '1500-1800' },
		// { label: '6:00 PM - 9:00 PM', value: '1800-2100' },
	];

	let fields: IField[] = [
		{
			key: 'NoOfArticles',
			definition: {
				Edit: true,
				Label: 'No. of articles to pick',
				Type: 'int',
				Required: true,
			},
		},
		{
			key: 'Date',
			definition: {
				Edit: true,
				Label: 'Select Date',
				Type: 'Date',
				Required: true,
				Default: DateTime.fromSQL('2025-07-01').toFormat('yyyy-MM-dd'),
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

	async function submitForm() {
		if (!$APP.User?.ActiveSubscription) return addError('No active subscriptions. Subscribe to continue.', 5);
		const maxPickupArticles = $APP.User.TotalStorageValue - $APP.User.StorageValue;

		if (maxPickupArticles < pickupOrder.NoOfArticles) return addError('Value must be less than available storage', 5);

		const [startTimeStr, endTimeStr] = pickupOrder.Time.split('-');

		const { hour: startHour, minute: startMinute } = parseTime(startTimeStr);
		const { hour: endHour, minute: endMinute } = parseTime(endTimeStr);

		const baseDate = DateTime.fromISO(pickupOrder.Date);
		const today = DateTime.now();
		if (today > baseDate) return addError('Cannot schdule pickups for previous dates.', 5);

		const launchDate = DateTime.fromISO('2025-07-01');
		if (launchDate > baseDate) return addError('Pick up date should be after 30th June', 5);

		const startDateTime = baseDate.set({ hour: startHour, minute: startMinute, second: 0, millisecond: 0 });
		const endDateTime = baseDate.set({ hour: endHour, minute: endMinute, second: 0, millisecond: 0 });

		const params = {
			type: 'Pickup', // TODO can we make this enum
			noOfArticles: pickupOrder.NoOfArticles,
			completionTimeSlotStart: startDateTime.toMillis(),
			completionTimeSlotEnd: endDateTime.toMillis(),
		};

		const resp = await placeOrderAndFetchPrice(params);
		if (resp && resp.ID) {
			bottomSheetStore.setSheet({
				show: true,
				children: OrderDetails as typeof SvelteComponent,
				props: {
					order: resp,
					referrerComponent: 'order/pickup',
				},
			});
		}
	}

	$: disabled = !form || !form.checkValidity() || !pickupOrder;
</script>

<h1 class="fw-bold fs-5">Schedule Pickup</h1>

<main class="mt-3">
	<form method="post" class="position-relative d-flex flex-column flex-grow-1 justify-content-between gap-2" bind:this={form} on:submit|preventDefault={submitForm}>
		<div class="narrow-form">
			{#each fields as { key, definition }}
				<div class="mb-3" data-field={key}>
					<Field {key} {definition} bind:value={pickupOrder[key]} />
				</div>
			{/each}
		</div>

		<p class="text-primary">* {captionText}</p>
		<button class="d-none">Needed for ENTER to submit</button>
		<button on:click={() => form.checkValidity()} type="submit" class="btn btn-primary text-uppercase" {disabled}> Schedule </button>
	</form>
</main>
