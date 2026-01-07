<script lang="ts">
	import { goto } from '$app/navigation';
	import Loader from '$lib/components/loader.svelte';
	import { getOTP } from '$lib/utils/apis';

	import { logoFullSrc, termsUrl } from '$lib/utils/globals';

	let disabled = true;
	let phone = '';
	let error = false;
	let loading = false;

	async function handleGetOTP() {
		try {
			loading = true;
			const resp = await getOTP(`91${phone}`);
			const sessionID = resp?.SessionID;
			if (!sessionID) return;
			goto(`/login/otp?session_id=${sessionID}&phone=${phone}`);
		} finally {
			loading = false;
		}
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
		if (phone.length === 10) {
			disabled = false; // Email is valid
		} else {
			disabled = true;
		}
	}
</script>

<div class="vh-100 d-flex flex-column" style="background-color: #f8f9fa;">
	<!-- Header Image -->
	<div class="position-relative" style="height: 280px; overflow: hidden;">
		<img src="/imgs/coming-soon.png" alt="Closet" class="w-100 h-100" />
		<!-- Logo Overlay -->
		<div class="bg-opacity-75 bg-white d-flex items-center justify-content-center position-absolute px-4 start-50 top-50 translate-middle w-100">
			<img src={logoFullSrc} alt="FREEDROBE" style="height: 120px;" />
		</div>
	</div>

	<!-- Content Card -->
	<div class="flex-grow-1 d-flex align-items-start justify-content-center px-3 mt-4">
		<div class="bg-white rounded-4 shadow-sm p-4 w-100" style="max-width: 400px;">
			<p class="fw-bold mb-2 fs-5">Login/ SignUp</p>
			<p class="text-muted mb-3 fs-6">Login/Create Account to access your wardrobe.</p>

			<span class="error-text text-danger d-block mb-2" class:d-none={!error}>Please check mobile number</span>

			<form on:submit|preventDefault={handleGetOTP} enctype="multipart/form-data">
				<div class="mb-3">
					<div class="d-flex align-items-center border rounded-3 px-3 py-2" style="background-color: #f8f9fa;">
						<span class="fw-bold text-dark">+91</span>
						<input
							type="text"
							inputmode="numeric"
							class="form-control bg-transparent border-0 shadow-none ps-2"
							bind:value={phone}
							aria-describedby="phone"
							placeholder="Enter Mobile number"
							on:input={handleInput} />
					</div>
				</div>

				<button type="submit" class="btn w-100 py-2 fw-bold text-uppercase text-white mb-2" style="background-color: #003366; border: none;" disabled={disabled || loading}>
					{#if loading}
						<span class="d-flex align-items-center justify-content-center gap-2">
							LOGIN
							<Loader />
						</span>
					{:else}
						LOGIN
					{/if}
				</button>

				<span class="text-muted">By tapping, I accept </span>
				<a href={termsUrl} target="_blank" class="text-dark fw-bold text-decoration-none">terms of service & privacy policy</a>
			</form>
		</div>
	</div>
</div>

<style lang="scss">
	.error-text {
		font-size: 0.85rem;
	}
</style>
