<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Loader from '$lib/components/loader.svelte';
	import OtpInput from '$lib/components/otp_input.svelte';
	import { APP } from '$lib/stores/appMain';
	import { addError } from '$lib/stores/notices';
	import { getOTP, verifyOTPAndGetUserInfo, getOrdersList } from '$lib/utils/apis';
	import { onMount } from 'svelte';

	let otpDisplay = '';
	let disabled = true;
	let loading = false;

	let phone = $page.url.searchParams.get('phone');
	let interval = 30;
	let intervalRef: NodeJS.Timeout;
	$: sessionId = $page.url.searchParams.get('session_id');

	onMount(() => {
		let errorMessage = '';
		if (!sessionId) {
			errorMessage = 'Unable to get the session id. Please login again.';
		} else if (!phone) {
			errorMessage = 'Unable to get the phone number. Please login again.';
		}

		if (errorMessage) {
			addError(errorMessage, 10);
			goto('/login', { replaceState: true });
			return;
		}

		startInterval();

		setTimeout(() => {
			const first = document.querySelector('.otp-input-0') as HTMLInputElement;
			first?.focus();
		}, 50);

		return () => intervalRef && clearInterval(intervalRef);
	});

	function handleBack() {
		goto('/login', { replaceState: true });
	}

	function startInterval() {
		intervalRef = setInterval(() => {
			if (interval === 0) {
				clearInterval(intervalRef);
			} else {
				interval--;
			}
		}, 1000);
	}

	async function onClickResendOtp() {
		try {
			clearInterval(intervalRef);
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

			const resp = await verifyOTPAndGetUserInfo({
				sessionId,
				otp: otpDisplay,
			});

			if (!resp || !resp.authInfo || !resp.authInfo.AuthToken || !resp.userInfo) {
				addError('Unable to get the user. Please try again later.');
				goto('/login', { replaceState: true });
			} else {
				$APP.Auth = resp.authInfo;
				$APP.User = resp.userInfo;

				// Check onboarding status (only for endUser role)
				if (resp.userInfo.UserRole === 'endUser') {
					// Redirect to onboarding if user hasn't completed profile
					if (!resp.userInfo.LocationId) {
						goto('/onboarding', { replaceState: true });
					} else if (!resp.userInfo.ActiveSubscription) {
						goto('/onboarding/subscription', { replaceState: true });
					} else {
						// Check if user has any orders
						const ordersResp = await getOrdersList({ limit: 1, start: 0 });
						if (ordersResp && (!ordersResp.orders || Object.keys(ordersResp.orders).length === 0)) {
							goto('/onboarding/pickup', { replaceState: true });
						} else {
							goto('/closet', { replaceState: true });
						}
					}
				} else {
					goto('/profile', { replaceState: true });
				}
			}
		} finally {
			loading = false;
		}
	}

	$: disabled = otpDisplay.length !== 6;
</script>

<header class="os_top_padding">
	<p class="px-3 fs-6 pt-3" on:click={handleBack}>
		<i class="bi bi-arrow-left me-2"></i>Back
	</p>
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
				<p class="info">
					OTP has been successfully sent to <span class="fw-bold">{phone}</span>
				</p>
			</div>

			<OtpInput length={6} value={otpDisplay} onChange={(v) => (otpDisplay = v)} />

			<div class="w-100 pt-1 d-flex align-items-center gap-1">
				<button class="btn text-capitalize p-0 border-0 text-underline" disabled={!!interval} on:click|preventDefault={onClickResendOtp}> Resend OTP </button>
				<span class:d-none={!interval}> in {interval}s</span>
			</div>

			<button type="submit" class="btn btn-primary w-100 my-3 d-flex justify-content-center gap-2" class:disabled>
				Verify
				{#if loading}
					<Loader />
				{/if}
			</button>
		</form>
	{/if}
</main>
