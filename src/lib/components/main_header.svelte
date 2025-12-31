<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import MemberSidebar from '$lib/components/member_sidebar.svelte';
	import { logoSrc } from '$lib/utils/globals';
	import { APP } from '$lib/stores/appMain';
	import { onboardingStep } from '$lib/stores/onboarding';

	export let show_sidebar = true;
	export let logo_only = false;
	export let onboarding_title = '';
	export let onboarding_subtitle = '';

	const steps = [1, 2, 3];

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
			{#if !logo_only && $page.data.back_button}
				<button on:click={handleBack} class="back btn-plain"><i class="bi bi-arrow-left text-black"></i></button>
			{/if}
			<img src={logoSrc} class="header-logo" alt="FREEDROBE" />
			{#if logo_only && $onboardingStep.currentStep > 0}
				<div class="onboarding-text ms-3 d-flex align-items-center gap-3">
					<div class="d-flex align-items-center gap-2">
						{#each steps as step, index}
							<div class="d-flex align-items-center">
								<!-- Step Circle -->
								{#if $onboardingStep.completedSteps.includes(step)}
									<div class="rounded-circle bg-success d-flex align-items-center justify-content-center text-white" style="width: 30px; height: 30px; font-size: 0.75rem;">
										<i class="bi bi-check-lg"></i>
									</div>
								{:else if $onboardingStep.currentStep === step}
									<div class="rounded-circle bg-info d-flex align-items-center justify-content-center text-white fw-bold" style="width: 30px; height: 30px; font-size: 0.75rem;">
										{step}
									</div>
								{:else}
									<div class="rounded-circle bg-body-tertiary d-flex align-items-center justify-content-center text-secondary" style="width: 30px; height: 30px; font-size: 0.75rem;">
										{step}
									</div>
								{/if}

								<!-- Connector Line -->
								{#if index < steps.length - 1}
									{@const connectorClass =
										$onboardingStep.completedSteps.includes(step) && $onboardingStep.completedSteps.includes(steps[index + 1])
											? 'bg-success'
											: $onboardingStep.completedSteps.includes(step) && $onboardingStep.currentStep === steps[index + 1]
												? 'bg-info'
												: 'bg-body-tertiary'}
									<div class="mx-1 {connectorClass}" style="width: 40px; height: 3px;"></div>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/if}
			{#if !logo_only && $APP.User?.UserRole === 'endUser'}
				{#if $APP.User?.ActiveSubscription}
					<div class="subscription-wrapper ms-2 d-flex flex-column gap-1">
						<p class="m-0 fw-bold">Subscription: <span class="text-success">Active</span></p>
						<p class="m-0 fw-bold">Storage: <span class="bg-secondary text-primary rounded-2 px-1">{`${$APP.User.StorageValue}/${$APP.User.TotalStorageValue}`}</span></p>
					</div>
				{:else if !$page.url.pathname.startsWith('/onboarding')}
					<button class="border-0 text-uppercase p-2 px-3 shadow rounded-3 p-1 ms-4 bg-primary text-white shadow px-2" on:click={handleClickSubscribe}>Subscribe</button>
				{/if}
			{/if}
			{#if !logo_only}
				<span class="fs-2 py-2 me-auto">{$page.data.the_title ?? ''}</span>
			{/if}
		</div>
		{#if !logo_only}
			<div class="me-3">
				{#if $page.data.the_ctas}
					{#each $page.data.the_ctas as cta}
						{@const isActive = cta.href === $page.url.pathname}
						<a class="btn text-white position-relative" href={cta.href} class:active={isActive}>
							{#if $APP.ArticlesInBag && $APP.ArticlesInBag.length > 0}
								<span class="pill position-absolute rounded-pill bg-danger text-white px-2">{$APP.ArticlesInBag.length}</span>
							{/if}
							{#if cta.icon}<i class="bi bi-{cta.icon}{isActive ? '-fill text-secondary' : ' text-black'} me-5 fs-2" />{/if}
							{cta?.label || ''}
						</a>
					{/each}
				{/if}
			</div>
		{/if}
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
		height: 5.5rem;
	}
	.active {
		color: var(--bs-secondary);
		* {
			font-weight: bold;
		}
	}
	.pill {
		font-size: 0.6rem;
		right: 3.2rem;
		top: 0.6rem;
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
