<script lang="ts" context="module">
	export interface NavItem {
		label: string;
		icon: string;
		href: string;
		notification?: number | true;
		hidden?: boolean;
	}
</script>

<script lang="ts">
	import { page } from '$app/stores';
	import { extractRoute } from '$lib/utils/globals';

	export let items: NavItem[];

	$: current_href = $page.url.href.replace($page.url.origin, '');
</script>

<footer class:show_shadow={$page.data.show_nav_shadow}>
	<nav>
		{#each items as link}
			{#if !link.hidden}
				{@const isActive = extractRoute(link.href) === extractRoute(current_href)}
				<a href={link.href} class:active={isActive} class="link p-2 pt-3 mb-1" title={link.label} data-sveltekit-preload-code="eager">
					<i class="fs-1 bi bi-{link.icon}{isActive ? '-fill' : ''} position-relative" />
					<span class="icon-label">{link.label}</span>
				</a>
			{/if}
		{/each}
	</nav>
</footer>

<style lang="scss">
	footer {
		background: white;
		border-radius: 16px 16px 0px 0px;
		border: 1px solid rgba(0, 0, 0, 0.1);
		&.show_shadow {
			box-shadow: 0px -4px 8px 0px rgba(0, 0, 0, 0.1);
		}
	}
	nav {
		display: grid;
		grid-auto-columns: minmax(0, 1fr);
		grid-auto-flow: column;
		i {
			font-size: 24px;
		}
		a {
			color: var(--bs-body-color);
			display: flex;
			align-items: center;
			justify-content: center;
			flex-grow: 1;
			flex-direction: column;
			font-size: 10px;
			span {
				max-width: 80px;
				overflow: hidden;
				white-space: nowrap;
				text-overflow: ellipsis;
			}
			&.active {
				color: var(--bs-secondary);
				* {
					font-weight: bold;
				}
			}
		}
	}
</style>
