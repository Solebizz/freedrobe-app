<script lang="ts">
	import Field, { type IField } from '$lib/components/field.svelte';
	import { addNotice } from '$lib/stores/notices';
	import { placeOrderAndFetchPrice } from '$lib/utils/apis';
	import { DateTime } from 'luxon';

	let pickupOrder: Record<string, any> = {};
	let form: HTMLFormElement;

	const timeRanges = [
		{ label: '10:00am - 11:00am', value: '1030-1100' },
		{ label: '12:00am - 02:00pm', value: '1200-0200' },
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
				Min: DateTime.now().plus({ day: 1 }).toFormat('yyyy-MM-dd'),
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
		const [startTimeStr, endTimeStr] = pickupOrder.Time.split('-');

		const { hour: startHour, minute: startMinute } = parseTime(startTimeStr);
		const { hour: endHour, minute: endMinute } = parseTime(endTimeStr);

		const baseDate = DateTime.fromISO(pickupOrder.Date);

		const startDateTime = baseDate.set({ hour: startHour, minute: startMinute, second: 0, millisecond: 0 });
		const endDateTime = baseDate.set({ hour: endHour, minute: endMinute, second: 0, millisecond: 0 });

		const params = {
			type: 'Pickup', // TODO can we make this enum
			noOfArticles: pickupOrder.NoOfArticles,
			completionTimeSlotStart: startDateTime.toMillis(),
			completionTimeSlotEnd: endDateTime.toMillis(),
		};

		await placeOrderAndFetchPrice(params);
		addNotice('Order Placed Successfully.');
		pickupOrder = {};
	}

	$: disabled = !form || !form.checkValidity() || !pickupOrder;
</script>

<h1 class="fw-bold">Schedule Pickup</h1>

<main class="mt-3">
	<form method="post" class="position-relative d-flex flex-column flex-grow-1 justify-content-between gap-2" bind:this={form} on:submit|preventDefault={submitForm}>
		<div class="narrow-form">
			{#each fields as { key, definition }}
				<div class="mb-3" data-field={key}>
					<Field {key} {definition} bind:value={pickupOrder[key]} />
				</div>
			{/each}
		</div>

		<button class="d-none">Needed for ENTER to submit</button>
		<button on:click={() => form.checkValidity()} type="submit" class="btn btn-primary text-uppercase" {disabled}> Schedule </button>
	</form>
</main>
