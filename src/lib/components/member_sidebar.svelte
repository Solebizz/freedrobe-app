<script lang="ts">
	import MemberImage from '$lib/components/member_image.svelte';
	import { APP } from '$lib/stores/appMain';
	import { privacyUrl, termsUrl } from '$lib/utils/globals';

	export let trainer_mode: boolean = false;

	let is_staff: boolean;
	let show = false;

	function toggle() {
		show = !show;
	}

	function handleLogout() {
		$APP.User = undefined;
		$APP.Auth = undefined;
		toggle();
	}
</script>

{#if show}
	<div class="backdrop" on:click={toggle} on:keypress={toggle} role="button" tabindex="-1"></div>
{/if}

<aside class="os_top_padding d-flex flex-column" class:show>
	<button class="tab mt-2" on:click={toggle}>
		<MemberImage width={40} />
	</button>

	<div class="p-3 d-flex flex-column flex-grow-1 text-black">
		<section class="members d-flex flex-column mb-4"></section>

		<section class="quick-actions d-flex flex-column">
			<p class="f-lbl-2">Quick Links</p>
			<!-- <a class="link" href={termsUrl}> <i class="bi bi-credit-card" aria-hidden="true"></i>Payments</a> -->
			<a class="link" href="/prices" on:click={toggle}><i class="bi bi-cash-coin" aria-hidden="true"></i>Prices</a>
			<a class="link" href="/login" on:click={handleLogout}>
				<i class="bi bi-box-arrow-right"></i>
				<span>Logout</span>
			</a>
		</section>

		<section class="bottom mt-auto">
			<a class="link" target="_blank" href={termsUrl}> <i class="bi bi-box-arrow-up-right" aria-hidden="true"></i>Terms & Conditions</a>
			<a class="link" target="_blank" href={privacyUrl}> <i class="bi bi-box-arrow-up-right" aria-hidden="true"></i>PrivacyPolicy</a>
		</section>
	</div>
</aside>

<style lang="scss">
	.backdrop {
		background-color: rgba(0, 0, 0, 0.8);
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		z-index: var(--sticky-top-z-index);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
	}
	aside {
		background: var(--bs-secondary);
		z-index: var(--sticky-top-z-index);
		position: fixed;
		height: 100vh;
		top: 0;
		right: 0;
		color: white;
		width: 300px;
		right: -300px;
		transition: right 0.25s;
		&.show {
			right: 0px;
			box-shadow: 0 0 20px rgba(0, 0, 0, 0.7);
		}
	}
	.tab {
		padding: 5px;
		border-top-left-radius: 50%;
		border-bottom-left-radius: 50%;
		position: absolute;
		left: -50px;
		top: calc(var(--os_top_padding) + 3px);
		background: var(--bs-secondary);
		:global(.memberimg) {
			border: 1px solid color-mix(in lch, var(--bs-secondary), white);
		}
		//top inverted round
		&:before {
			content: '';
			background: transparent;
			position: absolute;
			box-shadow: 0 8px 0 var(--bs-secondary);
			border-bottom-right-radius: 8px;
			width: 8px;
			height: 16px;
			right: 0px;
			top: -16px;
		}
		//bottom inverted round
		&:after {
			content: '';
			background: transparent;
			position: absolute;
			box-shadow: 0 -8px 0 var(--bs-secondary);
			border-top-right-radius: 8px;
			width: 8px;
			height: 16px;
			right: 0px;
			bottom: -16px;
		}
		.primary,
		.staff_crown {
			position: absolute;
			bottom: -6px;
			right: 4px;
			z-index: 1;
			:global(.memberimg) {
				border: 1px solid white;
			}
		}
		.staff_crown {
			background-color: var(--bs-secondary);
			border-radius: 50%;
			width: 24px;
			height: 24px;
			display: flex;
			align-items: center;
			justify-content: center;
			border: 1px solid white;
		}
	}
	p {
		margin-bottom: 0.5rem;
	}
	.cap-height {
		max-height: 400px;
		overflow: auto;
	}
	button,
	a {
		background: none;
		color: #000;
		border: none;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
	}
	a i {
		font-size: 15px;
		width: 24px;
		text-align: center;
	}
	button.active {
		background: white;
		color: var(--bs-secondary);
	}
</style>
