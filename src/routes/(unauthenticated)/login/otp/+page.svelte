<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Loader from '$lib/components/loader.svelte';

	let otp = Array(6).fill('');
	let otpDisplay = '';
	let disabled = true;
	let loading = false;
	let phone = $page.url.searchParams.get('phone');

	function handleInput(index: number, event: KeyboardEvent) {
		const input = event.target as HTMLInputElement;
		const key = event.key;

		if (!/^\d$/.test(key) && key !== 'Backspace') {
			event.preventDefault();
			return;
		}

		event.preventDefault(); // prevent default typing

		if (key === 'Backspace') {
			otp[index] = '';
			input.value = '';
			if (index > 0) {
				focusInput(index - 1);
			}
		} else {
			otp[index] = key;
			input.value = key;

			if (index < 5) {
				focusInput(index + 1);
			}
		}

		updateOtpDisplay();
	}

	function updateOtpDisplay() {
		const otpValue = otp.join('');
		otpDisplay = otpValue;
	}

	function focusInput(index: number) {
		const el = document.querySelector<HTMLInputElement>(`.otp__field__${index + 1}`);
		el?.focus();
	}

	function handleBack() {
		history.back();
	}

	function handleSubmit() {
		goto('/profile');
	}

	$: {
		if (otpDisplay.length === 6) {
			disabled = false;
		} else {
			disabled = true;
		}
	}
</script>

<header class="os_top_padding">
	<button class="btn px-3" on:click={handleBack}><i class="bi bi-arrow-left me-3"></i>Back</button>
</header>
<main class="h-100 d-flex justify-content-center mt-5">
	{#if !phone}
		<div class="text-center">
			<p class="fs-4">⚠️ Phone number is required.</p>
			<button class="btn rounded-pill border" on:click={handleBack}>Go back</button>
		</div>
	{:else}
		<form on:submit|preventDefault={handleSubmit} class="otp-form d-flex flex-column align-items-center mt-5" name="otp-form">
			<div class="title text-center">
				<h3>OTP Verification</h3>
				<p class="info">OTP has been successfully sent to <span class="fw-bold">{phone}</span></p>
			</div>

			<div class="otp-input-fields">
				{#each otp as digit, i}
					<input class="otp__digit otp__field__{i + 1}" type="text" bind:value={digit} maxlength="1" inputmode="numeric" on:keydown={(e) => handleInput(i, e)} />
				{/each}
			</div>

			<button type="submit" class:disabled class="btn btn-primary w-100 my-4 d-flex justify-content-center gap-2 rounded-pill">
				Verify
				{#if loading}
					<Loader />
				{/if}
			</button>
		</form>
	{/if}
</main>

<style>
	.otp-input-fields {
		display: flex;
		gap: 8px;
	}
	input.otp__digit {
		max-width: 45px;
		height: 50px;
		text-align: center;
		font-size: 24px;
		border: 2px solid #ccc;
		border-radius: 6px;
	}
	._ok {
		color: green;
		font-weight: bold;
	}
	._notok {
		color: red;
	}
</style>
