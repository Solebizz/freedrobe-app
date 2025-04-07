<script lang="ts">
	import FooterNav, { type NavItem } from '$lib/components/footer_nav.svelte';

	let links: NavItem[] = [
		{ href: '/closet', icon: 'house', label: 'Closet' },
		{ href: '/orders', icon: 'file-earmark-text', label: 'Orders' },
		{ href: '/profile', icon: 'person', label: 'Profile' },
	];
</script>

<FooterNav items={links} />
