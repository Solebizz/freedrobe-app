<script lang="ts">
	import { goto } from '$app/navigation';
	import Loader from '$lib/components/loader.svelte';
	import { getOTP } from '$lib/utils/apis';

	import { logoFullSrc, termsUrl } from '$lib/utils/globals';

	let disabled = true;
	let phone = '';
	let error = false;
	let loading = false;
	let checked = false;

	async function handleGetOTP() {
		const resp = await getOTP(`91${phone}`);
		const sessionID = resp?.SessionID;
		loading = true;
		goto(`/login/otp?session_id=${sessionID}&phone=${phone}`);
	}

	function handleInput(event: Event) {
		const input = event.target as HTMLInputElement;
		// Remove all non-digit characters
		let value = input.value.replace(/\D/g, '');

		// Limit to 10 characters
		if (value.length > 10) {
			value = value.slice(0, 10);
		}

		input.value = value;
		phone = value;
	}

	$: {
		if (phone.length === 10 && checked) {
			disabled = false; // Email is valid
		} else {
			disabled = true;
		}
	}
</script>

<div class="d-flex h-100 flex-column os_top_padding mt-4">
	<div class="d-flex justify-content-center">
		<img src={logoFullSrc} class="splash-logo" alt="ICARUS" height="130" />
	</div>
	<div class="rounded-top-5 p-3 w-100 d-flex flex-column align-items-center pb-5">
		<div class="w-100">
			<h2 class="text-primary pb-2 pt-1 text-center my-3 fs-5 fw-bold">Welcome to Freedrobe</h2>
			<span class="error-text text-danger" class:d-none={!error}>Please check email or password</span>

			<form class="w-100" on:submit|preventDefault={handleGetOTP} enctype="multipart/form-data">
				<div class="text-input-group">
					<label class="mb-1 text-primary" for="email">Login / Signup</label>
					<div class="d-flex align-items-center gap-2 bg-white p-1 border rounded-3">
						<span class="fw-bold px-1">+91</span>
						<input
							type="text"
							inputmode="numeric"
							class="form-control bg-transparent border-0 p-1 shadow-none"
							bind:value={phone}
							aria-describedby="phone"
							placeholder="Enter mobile number"
							on:input={handleInput} />
					</div>
				</div>
				<div class="label-group">
					<input class="form-check-input" type="checkbox" bind:checked value="" id="flexCheckDefault" />
					<label class="form-check-label" for="flexCheckDefault">I accept <a href={termsUrl}>Terms & Conditions</a> </label>
				</div>

				<button type="submit" class:disabled class="btn btn-primary w-100 my-4 d-flex justify-content-center gap-2"
					>Get OTP
					{#if loading}
						<Loader />
					{/if}
				</button>
			</form>
		</div>
	</div>
</div>

<style lang="scss">
	a {
		text-decoration: underline;
		font-size: 0.8rem;
	}
	.error-text {
		font-size: 0.8rem;
	}
	.back {
		top: 1rem;
		left: 1rem;
	}
	.text-input-group {
		display: flex;
		flex-direction: column;
		justify-content: center;
		margin-bottom: 1rem;
		input[type='email'],
		input[type='password'] {
			padding: 0.5rem;
			border-radius: var(--bs-border-radius);
			color: var(--bs-body-color);
			border: var(--bs-border-width) solid var(--bs-border-color);
		}
	}
	.label-group {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		input[type='checkbox'] {
			margin-top: 0;
		}
	}
	// .splash-logo {
	// 	height: auto;
	// 	width: 11rem;
	// }
</style>
