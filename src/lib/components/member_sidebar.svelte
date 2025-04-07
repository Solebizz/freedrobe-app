<script lang="ts">
	import MemberImage from '$lib/components/member_image.svelte';
	import { termsUrl } from '$lib/utils/globals';

	export let trainer_mode: boolean = false;

	let is_staff: boolean;
	let show = false;

	function toggle() {
		show = !show;
	}

	function handleLogout() {
		toggle();
	}
</script>

{#if show}
	<div class="backdrop" on:click={toggle} on:keypress={toggle} role="button" tabindex="-1"></div>
{/if}

<aside class="os_top_padding d-flex flex-column" class:show>
	<button class="tab" on:click={toggle}>
		<MemberImage width={40} />

		<!-- {#if !trainer_mode}
			<MemberImage imageURL={viewing_as?.ImageURL} width={40} />
		{:else}
			<MemberImage imageURL={$APP.Staff?.Details?.ImageURL} width={40} />
			<div class="staff_crown">
				<i class="bi bi-star-fill"></i>
			</div>
		{/if} -->
	</button>

	<div class="p-3 d-flex flex-column flex-grow-1">
		<section class="members d-flex flex-column mb-4">
			<!-- {#if !trainer_mode && is_staff}
				<a class="link" href="/staff/home">
					<i class="bi bi-arrow-left-right"></i>
					<span>Switch to Trainer</span>
				</a>
			{:else if trainer_mode && $APP.Auth && unit_players}
				<a class="link" href="/home">
					<i class="bi bi-arrow-left-right"></i>
					<span>Switch to Member App</span>
				</a>
			{/if} -->
		</section>

		<section class="quick-actions d-flex flex-column">
			<p class="f-lbl-2">Quick Links</p>
			<a class="link" href={termsUrl}><i class="bi bi-shield-lock"></i>Terms & Conditions <i class="bi bi-box-arrow-up-right mx-1" aria-hidden="true"></i></a>
		</section>

		<section class="bottom mt-auto">
			<!-- {#if !trainer_mode} -->
			<!-- {#if is_staff}
					<a class="link" href="/staff/home">
						<i class="bi bi-person-add"></i>
						<span>View as Trainer</span>
					</a>
				{:else}
					<a class="link" href="/login/staff?with_history=1" data-sveltekit-preload-code="eager">
						<i class="bi bi-person-add"></i>
						<span>Login as Coach</span>
					</a>
				{/if} -->
			<!-- {#if $APP.Auth} -->
			<a class="link" href="/login" on:click={handleLogout}>
				<i class="bi bi-box-arrow-right"></i>
				<span>Logout</span>
			</a>
			<!-- {/if} -->
			<!-- {:else}
				<a class="link" href="/login/staff" on:click={handleLogout}>
					<i class="bi bi-box-arrow-right"></i>
					<span>Trainer Logout</span>
				</a>
			{/if} -->
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
		color: white;
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
