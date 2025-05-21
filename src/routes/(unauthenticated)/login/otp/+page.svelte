<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Loader from '$lib/components/loader.svelte';
	import { APP } from '$lib/stores/appMain';
	import { addError } from '$lib/stores/notices';
	import { getOTP, verifyOTPAndGetUserInfo } from '$lib/utils/apis';
	import { onMount } from 'svelte';

	let otp = Array(6).fill('');
	let otpDisplay = '';
	let disabled = true;
	let loading = false;
	let phone = $page.url.searchParams.get('phone');
	let sessionId = $page.url.searchParams.get('session_id');
	let interval = 30;
	let intervalRef: number;

	onMount(() => {
		let errorMessage = '';
		if (!sessionId) {
			errorMessage = 'Unable to get the session id. Please login again.';
		} else if (!phone) {
			errorMessage = 'Unable to get the phone number. Please login again.';
		}

		if (errorMessage) {
			addError(errorMessage, 10);
			goto('/login');
		}
	});

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

	function startInterval() {
		intervalRef = window.setInterval(() => {
			if (interval === 0) {
				window.clearInterval(intervalRef);
			} else {
				interval -= 1;
			}
		}, 1000);
	}

	onMount(() => {
		startInterval();
		return () => {
			if (intervalRef) window.clearInterval(intervalRef);
		};
	});

	async function onClickResendOtp() {
		try {
			window.clearInterval(intervalRef);
			interval = 30;
			const resp = await getOTP(`91${phone}`);
			const sessionID = resp?.SessionID;
			if (!sessionID) return;
			goto(`/login/otp?session_id=${sessionID}&phone=${phone}`);
		} finally {
			startInterval();
		}
	}

	async function handleSubmit() {
		if (!sessionId) return;
		try {
			loading = true;
			const resp = await verifyOTPAndGetUserInfo({ sessionId, otp: otpDisplay });
			if (!resp || !resp.authInfo || !resp.authInfo.AuthToken || !resp.userInfo || resp.userInfo.UserRole !== 'endUser') {
				// TODO store logs somewhere.
				addError('Unable to get the user. Please try again after sometime.');
				goto('/login');
			} else {
				$APP.Auth = resp.authInfo;
				$APP.User = resp.userInfo;
				goto('/profile');
			}
		} finally {
			loading = false;
		}
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
	<p class="px-3 fs-6 pt-3" on:click={handleBack}><i class="bi bi-arrow-left me-2"></i>Back</p>
</header>
<main class="h-100 d-flex justify-content-center mt-3">
	{#if !phone}
		<div class="text-center">
			<p class="fs-4">⚠️ Phone number is required.</p>
			<button class="btn rounded-pill border" on:click={handleBack}>Go back</button>
		</div>
	{:else}
		<form on:submit|preventDefault={handleSubmit} class="otp-form d-flex flex-column align-items-center mt-5" name="otp-form">
			<div class="title text-center">
				<p class="fs-5 fw-bold">OTP Verification</p>
				<p class="info">OTP has been successfully sent to <span class="fw-bold">{phone}</span></p>
			</div>

			<div class="otp-input-fields">
				{#each otp as digit, i}
					<input class="otp__digit otp__field__{i + 1}" type="text" bind:value={digit} maxlength="1" inputmode="numeric" on:keydown={(e) => handleInput(i, e)} />
				{/each}
			</div>

			<div class="w-100 pt-1 d-flex align-items-center gap-1">
				<button class="btn text-capitalize p-0 border-0 text-underline" disabled={!!interval} on:click|preventDefault={onClickResendOtp}>Resend OTP</button>
				<span class:d-none={!interval}> in {interval}s</span>
			</div>

			<button type="submit" class:disabled class="btn btn-primary w-100 my-3 d-flex justify-content-center gap-2">
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
		max-width: 40px;
		height: 40px;
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
