<script lang="ts">
	import Loader from '$lib/components/loader.svelte';
	import { fetchUsersWithActiveSubscription } from '$lib/utils/apis';
	import { DateTime } from 'luxon';
	import { onMount } from 'svelte';

	let loading = true;
	let users: App.IUserInfo[] = [];

	onMount(async () => {
		try {
			const resp = await fetchUsersWithActiveSubscription();
			if (resp && resp.length) users = resp;
		} finally {
			loading = false;
		}
	});
</script>

{#if loading}
	<Loader />
{:else}
	<h1 class="fw-bold mb-3 fs-5">Manage Users ({users.length})</h1>
	<div class="d-flex flex-column gap-3 mb-3">
		{#each users as user}
			<div class="user-card">
				<p class="m-0"><strong>Name:</strong> {user.Name}</p>
				<p class="m-0"><strong>Phone:</strong> {user.Phone}</p>

				{#if user?.Address}
					<div class="mt-3 pt-3 border-top border-light-subtle">
						<p class="m-0"><strong>Address:</strong></p>
						<p class="m-0">Line 1: {user?.Address?.Line1}</p>
						<p class="m-0">Line 2: {user?.Address?.Line2}</p>
					</div>
				{/if}
				<div class="mt-3 pt-3 border-top border-light-subtle">
					<p class="m-0"><strong>Subscription Details:</strong></p>
					<p class="mb-1"><strong>Type:</strong> {user?.SubscriptionName}</p>
					<p class="mb-1">
						<strong>Valid Until:</strong>
						{DateTime.fromMillis(Number(user?.SubscriptionValidTill)).toFormat('dd LLL yyyy')}
					</p>
				</div>
				<div class="mt-3 pt-3 border-top border-light-subtle">
					<p class="mb-1"><strong>Free Pickups/Deliveries Left:</strong> {user?.LogisticValue}</p>
					<p class="mb-1"><strong>Free Dry Cleans Left:</strong> {user?.DryCleanValue}</p>
					<p class="mb-1"><strong>Free Washes Left:</strong> {user?.WashValue}</p>
				</div>
			</div>
		{/each}
	</div>
{/if}

<style lang="scss">
	.user-card {
		border: 1px solid #ccc;
		border-radius: 12px;
		padding: 1rem;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
	}
</style>
