<script lang="ts">
	import FooterNav, { type NavItem } from '$lib/components/footer_nav.svelte';
	import { APP } from '$lib/stores/appMain';

	let links: NavItem[] = $APP.User?.UserRole === 'endUser' ? [{ href: '/closet', icon: 'house', label: 'Closet' }] : [];

	links.push({ href: '/orders', icon: 'file-earmark-text', label: 'Orders' }, { href: '/profile', icon: 'person', label: 'Profile' });
</script>

<FooterNav items={links} />
