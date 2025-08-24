<script lang="ts">
	import Field, { type IField } from '$lib/components/field.svelte';
	import ProfileUpdateNextSteps from '$lib/components/profile_update_next_steps.svelte';
	import { APP } from '$lib/stores/appMain';
	import { bottomSheetStore } from '$lib/stores/bottom_sheet';
	import { addNotice, type NoticeWithoutMeta } from '$lib/stores/notices';
	import { getLocationsInfo, saveUserInfo } from '$lib/utils/apis';
	import { DateTime } from 'luxon';
	import { onMount } from 'svelte';

	let form: HTMLFormElement;
	let profile: Record<string, any> = {
		Name: $APP.User?.Name,
		Phone: $APP.User?.Phone,
		Gender: $APP.User?.Gender,
		AddressLine1: $APP.User?.Address?.Line1,
		AddressLine2: $APP.User?.Address?.Line2,
	};

	const isProfileUpdatedForFirstTime = !$APP.User?.LocationId;

	let locationInfo: App.ILocationInfo[] | undefined = [];
	let locationId = '';
	const editable = true;

	const genderOptions = [
		{ label: 'Male', value: 'Male' },
		{ label: 'Female', value: 'Female' },
		{ label: 'Others', value: 'Others' },
	];

	onMount(async () => {
		locationInfo = await getLocationsInfo();
		if (!locationInfo) return;

		const userLocation = locationInfo?.filter((l) => l.ID === $APP.User?.LocationId);
		if (!userLocation.length) return;

		profile.State = userLocation[0].State;
		profile.City = userLocation[0].City;
		profile.Area = userLocation[0].Area;
	});

	$: fields = [
		{
			key: 'Phone',
			definition: {
				Edit: false,
				Label: 'Phone',
				Type: 'text',
				Required: true,
			},
		},
		{
			key: 'Name',
			definition: {
				Edit: editable,
				Label: 'Name',
				Type: 'text',
				Required: true,
			},
		},
		{
			key: 'Gender',
			definition: {
				Edit: editable,
				Label: 'Gender',
				Type: 'select',
				Options: genderOptions,
				Required: true,
			},
		},

		{
			key: 'AddressLine1',
			definition: {
				Edit: editable,
				Label: 'Address Line 1',
				Type: 'text',
				Required: true,
			},
		},
		{
			key: 'AddressLine2',
			definition: {
				Edit: editable,
				Label: 'Address Line 2',
				Type: 'text',
				Required: true,
			},
		},

		{
			key: 'State',
			definition: {
				Edit: editable,
				Label: 'State',
				Type: 'select',
				Required: true,
			},
		},
		{
			key: 'City',
			definition: {
				Edit: false,
				Label: 'City',
				Type: 'select',
				Required: true,
				HTMLAttributes: {
					disabled: true,
				},
			},
		},
		{
			key: 'Area',
			definition: {
				Edit: false,
				Label: 'Area',
				Type: 'select',
				Required: true,
			},
		},
	] as IField[];

	$: {
		let stateIndex = fields.findIndex(({ key }) => key == 'State');
		const duplicates = locationInfo?.map((l) => l.State);
		const uniquies = new Set(duplicates);
		fields[stateIndex].definition.Options = Array.from(uniquies).map((u) => ({ label: u, value: u }));
	}

	$: {
		if (profile?.State) {
			let cityIndex = fields.findIndex(({ key }) => key == 'City');
			const duplicates = locationInfo?.filter((l) => profile && l.State === profile.State).map((l) => l.City);
			const uniquies = new Set(duplicates);
			fields[cityIndex].definition.Options = Array.from(uniquies).map((u) => ({ label: u, value: u }));
			fields[cityIndex].definition.Edit = editable;
		}
	}

	$: {
		if (profile?.City) {
			let areaIndex = fields.findIndex(({ key }) => key == 'Area');
			const duplicates = locationInfo?.filter((l) => profile && l.City === profile.City).map((l) => l.Area);
			const uniquies = new Set(duplicates);
			fields[areaIndex].definition.Options = Array.from(uniquies).map((u) => ({ label: u, value: u }));
			fields[areaIndex].definition.Edit = editable;
		}
	}

	$: {
		if (profile?.Area) {
			const selectedLocation = locationInfo?.filter((l) => l.State === profile.State && l.City === profile.City && l.Area === profile.Area);
			if (selectedLocation?.length) locationId = selectedLocation[0].ID;
			else locationId = '';
		}
	}

	$: disabled = !form || !form.checkValidity() || !profile || (locationId && $APP.User?.LocationId && $APP.User.LocationId !== locationId && $APP.User.StorageValue);

	async function submitForm() {
		const params = {
			name: profile.Name,
			gender: profile.Gender,
			address: {
				line1: profile.AddressLine1,
				line2: profile.AddressLine2,
			},
			locationId: locationId,
		};
		// save this data in user
		const user = await saveUserInfo(params);
		if (!user) return;

		$APP.User = user;
		if (isProfileUpdatedForFirstTime)
			bottomSheetStore.setSheet({
				show: true,
				children: ProfileUpdateNextSteps,
			});
		else {
			const noticeObj: NoticeWithoutMeta = {
				type: 'info',
				msg: 'Profile Updated Successfully.',
				snooze: 5,
			};
			addNotice(noticeObj);
		}
	}
</script>

{#if $APP.User?.ActiveSubscription}
	<h2 class="fs-4 fw-bold m-0">My Subscription</h2>
	<div class="subscription-card p-3 rounded-4 text-black bg-white border mt-3">
		<div class="mb-2">
			<p class="mb-1"><strong>Type:</strong> {$APP.User?.SubscriptionName}</p>
			<p class="mb-1">
				<strong>Valid Until:</strong>
				{DateTime.fromMillis(Number($APP.User?.SubscriptionValidTill)).toFormat('dd LLL yyyy')}
			</p>
		</div>

		<div class="mt-3 pt-3 border-top border-light-subtle">
			<p class="mb-1"><strong>Free Pickups/Deliveries Left:</strong> {$APP.User?.LogisticValue}</p>
			<p class="mb-1"><strong>Free Dry Cleans Left:</strong> {$APP.User?.DryCleanValue}</p>
			<p class="mb-1"><strong>Free Washes Left:</strong> {$APP.User?.WashValue}</p>
		</div>
	</div>
{/if}

<h1 class="fw-bold fs-5" class:mt-4={$APP.User?.ActiveSubscription}>My Profile</h1>
<main class="mt-2">
	<form method="post" class="position-relative d-flex flex-column flex-grow-1 justify-content-between gap-2" bind:this={form} on:submit|preventDefault={submitForm}>
		<div class="narrow-form">
			{#each fields as { key, definition }}
				<div class="mb-3" data-field={key}>
					<Field {key} {definition} bind:value={profile[key]} />
				</div>
			{/each}
		</div>

		<button class="d-none">Needed for ENTER to submit</button>
		<button on:click={() => form.checkValidity()} type="submit" class="btn btn-primary text-uppercase mb-3" disabled={!!disabled}> Update </button>
	</form>
</main>

<style lang="scss">
	.subscription-card {
		border-radius: 1.5rem;
		font-family: 'Poppins', 'Inter', sans-serif;
	}

	.status-chip {
		background-color: #a0def0; /* Light cyan background */
		color: #002b5b;
		font-size: 0.85rem;
	}

	.status-chip.expired {
		background-color: #f8d7da;
		color: #721c24;
	}
</style>
