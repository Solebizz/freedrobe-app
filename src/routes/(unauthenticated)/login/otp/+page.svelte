<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Loader from '$lib/components/loader.svelte';
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

		return () => intervalRef && clearInterval(intervalRef);
	});

	function handleOtpInput(event: Event) {
		const input = event.target as HTMLInputElement;
		// Remove all non-digit characters
		let value = input.value.replace(/\D/g, '');

		// Limit to 6 characters
		if (value.length > 6) {
			value = value.slice(0, 6);
		}

		input.value = value;
		otpDisplay = value;
	}

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

<div class="vh-100 d-flex flex-column bg-light">
	<!-- Header Image -->
	<div class="header-image">
		<img src="/imgs/coming-soon.png" alt="Closet" class="w-100 h-100" />
	</div>

	<!-- Content Card -->
	<div class="flex-grow-1 d-flex align-items-start justify-content-center content-wrapper">
		{#if !phone}
			<div class="otp-card bg-white rounded-4 shadow-sm p-4 w-100">
				<div class="text-center">
					<p class="fs-4">⚠️ Phone number is required.</p>
					<button class="btn btn-outline-secondary rounded-pill mt-3" on:click={handleBack}>Go back</button>
				</div>
			</div>
		{:else}
			<div class="otp-card bg-white rounded-4 shadow-sm p-4 w-100">
				<!-- Back Button -->
				<button class="border-0 bg-white btn-link text-decoration-none text-dark p-0 mb-3 d-flex align-items-center back-button" on:click={handleBack}>
					<i class="bi bi-arrow-left me-2"></i>
					<span>Back</span>
				</button>

				<!-- Form -->
				<form on:submit|preventDefault={handleSubmit} name="otp-form">
					<h5 class="fw-bold mb-2 fs-5">Verify OTP</h5>
					<p class="text-muted mb-3 small-text">OTP sent to +91-{phone}.</p>

					<!-- Single OTP Input -->
					<div class="mb-3">
						<input
							type="text"
							inputmode="numeric"
							class="form-control form-control-lg text-center otp-input"
							bind:value={otpDisplay}
							maxlength="6"
							on:input={handleOtpInput}
							autocomplete="one-time-code" />
					</div>

					<div class="mb-2">
						<span class="text-muted small-text mb-1">Didn't receive the OTP?</span>
						<button class="border-0 bg-white btn-link p-0 text-decoration-none fw-bold resend-button" disabled={!!interval} on:click|preventDefault={onClickResendOtp}> Send Again </button>
						{#if interval}
							<span class="text-muted small-text">in {interval}s</span>
						{/if}
					</div>

					<button type="submit" class="btn btn-primary w-100 py-2 fw-bold" style="background-color: #003366; border: none;" disabled={disabled || loading}>
						{#if loading}
							<span class="d-flex align-items-center justify-content-center gap-2">
								Verify and Proceed
								<Loader />
							</span>
						{:else}
							Verify and Proceed
						{/if}
					</button>
				</form>
			</div>
		{/if}
	</div>
</div>

<style lang="scss">
	.header-image {
		height: 200px;
		overflow: hidden;
	}

	.content-wrapper {
		margin-top: -40px;
		padding: 0 1rem;
	}

	.otp-card {
		max-width: 400px;
		margin: 0 auto;
	}

	.back-button {
		font-size: 0.85rem;
		letter-spacing: 0.5px;
	}

	.small-text {
		font-size: 0.9rem;
	}

	.otp-input {
		letter-spacing: 8px;
		font-size: 1.5rem;
		font-weight: 600;
		border: 1px solid #dee2e6;
		border-radius: 8px;
		padding: 12px;

		&:focus {
			border-color: #003366;
			box-shadow: 0 0 0 0.2rem rgba(0, 51, 102, 0.25);
		}
	}

	.resend-button {
		color: #000;
		font-size: 0.85rem;
		letter-spacing: 0.5px;

		&:hover:not(:disabled) {
			color: #003366;
		}

		&:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}
	}

	.submit-button {
		background-color: #003366;
		border: none;
		border-radius: 8px;

		&:hover:not(:disabled) {
			background-color: #002147;
		}

		&:disabled {
			opacity: 0.6;
			cursor: not-allowed;
		}
	}
</style>
