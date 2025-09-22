<script lang="ts">
	import FooterNav, { type NavItem } from '$lib/components/footer_nav.svelte';
	import { APP } from '$lib/stores/appMain';

	let links: NavItem[];
	switch ($APP.User?.UserRole) {
		case 'endUser':
			links = [
				{ href: '/closet', icon: 'house', label: 'Closet' },
				{ href: '/orders', icon: 'file-earmark-text', label: 'Orders' },
				{ href: '/profile', icon: 'person', label: 'Profile' },
			];
		case 'logistics':
			links = [
				{ href: '/orders', icon: 'file-earmark-text', label: 'Orders' },
				{ href: '/profile', icon: 'person', label: 'Profile' },
			];
		case 'admin':
			links = [
				{ href: '/users', icon: 'people', label: 'Users' },
				{ href: '/orders', icon: 'file-earmark-text', label: 'Orders' },
				{ href: '/profile', icon: 'person', label: 'Profile' },
			];
	}
</script>

<FooterNav items={links} />
