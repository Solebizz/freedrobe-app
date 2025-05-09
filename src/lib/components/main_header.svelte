<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import MemberSidebar from '$lib/components/member_sidebar.svelte';
	import { logoFullSrc } from '$lib/utils/globals';
	import { APP } from '$lib/stores/appMain';
	import { DateTime } from 'luxon';

	export let show_sidebar = true;

	function handleBack() {
		if ($page.data.back_button === true) {
			history.back();
		} else if ($page.data.back_button) {
			goto($page.data.back_button);
		}
	}

	function handleClickSubscribe() {
		goto('/subscription-list');
	}
</script>

<section class="os_top_padding sticky_top">
	<div class="d-flex ps-3 pe-0 align-items-center justify-content-between pb-2">
		<div class="d-flex align-items-center">
			{#if $page.data.back_button}
				<button on:click={handleBack} class="back btn-plain"><i class="bi bi-arrow-left text-black"></i></button>
			{/if}
			<img src={logoFullSrc} class="header-logo" alt="FREEDROBE" />
			{#if $APP.User?.ActiveSubscription}
				<div class="subscription-wrapper ms-2 d-flex flex-column gap-1">
					<p class="m-0 fw-bold">Subscription: <span class="text-success">Active</span></p>
					<p class="m-0 fw-bold">Storage: <span class="bg-secondary text-primary rounded-2 px-1">{`${$APP.User.StorageValue}/${$APP.User.TotalStorageValue}`}</span></p>
				</div>
			{:else}
				<button class="border-0 text-uppercase p-2 px-3 shadow rounded-3 p-1 ms-4 bg-primary text-white shadow px-2" on:click={handleClickSubscribe}>Subscribe</button>
			{/if}
			<span class="fs-2 py-2 me-auto">{$page.data.the_title ?? ''}</span>
		</div>
		<div>
			{#if $page.data.the_ctas}
				{#each $page.data.the_ctas as cta}
					{@const isActive = cta.href === $page.url.pathname}
					<a class="btn text-white" href={cta.href} class:active={isActive}>
						{#if cta.icon}<i class="bi bi-{cta.icon}{isActive ? '-fill text-secondary' : ' text-black'} me-5 fs-3" />{/if}
						{cta?.label || ''}
					</a>
				{/each}
			{/if}
		</div>
		<!-- add ctas in header with label from load method-->
	</div>
</section>

{#if show_sidebar}
	<MemberSidebar />
{/if}

<style lang="scss">
	.back {
		color: white;
		font-size: 1rem;
		margin-right: 1rem;
	}

	.header-logo {
		height: 4.5rem;
	}
	.active {
		color: var(--bs-secondary);
		* {
			font-weight: bold;
		}
	}
	.primary-gradient {
		// TODO png header img
		// background:
		// 	linear-gradient(180deg, var(--bs-primary) 0%, var(--bs-link-hover-color) 100%),
		// 	url(/imgs/backgrounds/bg-header-chevrons.png) center;
		// background-size: cover;
		// background-blend-mode: soft-light;
		// &[data-staff='true'] {
		// 	background: var(--bs-secondary-dark) url(/imgs/backgrounds/bg-header-triangles.png) center;
		// }
	}

	.dot-indicator {
		position: absolute;
		width: 15px;
		height: 15px;
		top: 0px;
		background-color: var(--bs-secondary);
		right: -5px;
		font-size: 0.6rem;
	}
	.subscription-wrapper {
		p {
			span {
				padding: 0.1rem 0.2rem 0.1rem 0.2rem;
			}
		}
	}
</style>
