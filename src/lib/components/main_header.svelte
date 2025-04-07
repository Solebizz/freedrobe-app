<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import MemberSidebar from '$lib/components/member_sidebar.svelte';

	export let show_sidebar = true;

	function handleBack() {
		if ($page.data.back_button === true) {
			history.back();
		} else if ($page.data.back_button) {
			goto($page.data.back_button);
		}
	}

</script>

<section class="primary-gradient os_top_padding sticky_top">
	<div class="d-flex ps-3 pt-2 pe-0 align-items-center pb-4">
		{#if $page.data.back_button}
			<button on:click={handleBack} class="back btn-plain"><i class="bi bi-arrow-left"></i></button>
		{/if}
		<span class="fs-2 py-2 me-auto">{$page.data.the_title ?? ''}</span>
		<!-- add ctas in header with label from load method-->
		{#if $page.data.the_ctas}
			{#each $page.data.the_ctas as cta}
				<a class="btn text-white" href={cta.href}>
					{#if cta.icon}<i class="bi bi-{cta.icon} me-1" />{/if}
					{cta.label}
				</a>
			{/each}
		{/if}
		<div class="ms-3" style="width:40px"></div>
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
</style>
