<script lang="ts">
	import { goto } from '$app/navigation';
	import Field, { type IField } from '$lib/components/field.svelte';
	import Loader from '$lib/components/loader.svelte';
	import { APP } from '$lib/stores/appMain';
	import { addNotice, type NoticeWithoutMeta } from '$lib/stores/notices';
	import { getLocationsInfo, saveUserInfo } from '$lib/utils/apis';
	import { onMount } from 'svelte';

	let form: HTMLFormElement;
	let loading = false;
	let profile: Record<string, any> = {
		Name: $APP.User?.Name,
		Phone: $APP.User?.Phone,
		Gender: $APP.User?.Gender,
		AddressLine1: $APP.User?.Address?.Line1,
		AddressLine2: $APP.User?.Address?.Line2,
	};

	let locationInfo: App.ILocationInfo[] | undefined = [];
	let locationId = '';

	const genderOptions = [
		{ label: 'Male', value: 'Male' },
		{ label: 'Female', value: 'Female' },
		{ label: 'Others', value: 'Others' },
	];

	onMount(async () => {
		// If user already has LocationId, redirect to profile
		if ($APP.User?.LocationId) {
			goto('/profile', { replaceState: true });
			return;
		}

		locationInfo = await getLocationsInfo();
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
				Edit: true,
				Label: 'Name',
				Type: 'text',
				Required: true,
			},
		},
		{
			key: 'Gender',
			definition: {
				Edit: true,
				Label: 'Gender',
				Type: 'select',
				Options: genderOptions,
				Required: true,
			},
		},
		{
			key: 'AddressLine1',
			definition: {
				Edit: true,
				Label: 'Address Line 1',
				Type: 'text',
				Required: true,
			},
		},
		{
			key: 'AddressLine2',
			definition: {
				Edit: true,
				Label: 'Address Line 2',
				Type: 'text',
				Required: true,
			},
		},
		{
			key: 'State',
			definition: {
				Edit: true,
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
			fields[cityIndex].definition.Edit = true;
		}
	}

	$: {
		if (profile?.City) {
			let areaIndex = fields.findIndex(({ key }) => key == 'Area');
			const duplicates = locationInfo?.filter((l) => profile && l.City === profile.City).map((l) => l.Area);
			const uniquies = new Set(duplicates);
			fields[areaIndex].definition.Options = Array.from(uniquies).map((u) => ({ label: u, value: u }));
			fields[areaIndex].definition.Edit = true;
		}
	}

	$: {
		if (profile?.Area) {
			const selectedLocation = locationInfo?.filter((l) => l.State === profile.State && l.City === profile.City && l.Area === profile.Area);
			if (selectedLocation?.length) locationId = selectedLocation[0].ID;
			else locationId = '';
		}
	}

	$: disabled = !form || !form.checkValidity() || !locationId || loading;

	async function submitForm() {
		try {
			loading = true;
			const params = {
				name: profile.Name,
				gender: profile.Gender,
				address: {
					line1: profile.AddressLine1,
					line2: profile.AddressLine2,
				},
				locationId: locationId,
			};

			const user = await saveUserInfo(params);
			if (!user) return;

			$APP.User = user;

			const noticeObj: NoticeWithoutMeta = {
				type: 'success',
				msg: 'Welcome! Your profile has been created successfully.',
				snooze: 5,
			};
			addNotice(noticeObj);

			// Redirect to subscription step
			goto('/onboarding/subscription', { replaceState: true });
		} finally {
			loading = false;
		}
	}
</script>

<div class="onboarding-content bg-body-tertiary">
	<form method="post" class="onboarding-form bg-white p-3 border rounded-4 shadow-lg" bind:this={form} on:submit|preventDefault={submitForm}>
		<div class="form-fields">
			{#each fields as { key, definition }}
				<div class="mb-3" data-field={key}>
					<Field {key} {definition} bind:value={profile[key]} />
				</div>
			{/each}
		</div>

		<button class="d-none">Needed for ENTER to submit</button>
		<button on:click={() => form.checkValidity()} type="submit" class="btn btn-primary" {disabled}>
			<span>Continue to Subscription</span>
			{#if loading}
				<Loader />
			{/if}
		</button>
	</form>
</div>

<style lang="scss">
	.onboarding-form {
		background: white;
		border-radius: 1rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.form-fields {
		flex: 1;
	}
</style>
