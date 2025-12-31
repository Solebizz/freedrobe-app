<script lang="ts">
	import { goto } from '$app/navigation';
	import { APP } from '$lib/stores/appMain';

	const services = [
		{
			title: 'Dry Clean',
			description: 'Professional dry cleaning for your delicate garments with expert care',
			icon: 'bi-moisture',
			gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
			bgColor: '#f3f4ff',
		},
		{
			title: 'Laundry',
			description: 'Fresh and clean laundry service with premium detergents',
			icon: 'bi-droplet-half',
			gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
			bgColor: '#fff5f7',
		},
		{
			title: 'Storage',
			description: 'Schedule your first pickup and experience our premium service',
			icon: 'bi-truck',
			gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
			bgColor: '#f0fff9',
		},
	];

	function handleServiceClick() {
		if (!!$APP.User?.ActiveSubscription) {
			goto('/orders/pickup');
		} else {
			goto('/subscription-list');
		}
	}
</script>

<div class="mb-4">
	<h2 class="fw-bold fs-5 mb-3">Discover Our Services</h2>
	<div class="services-grid">
		{#each services as service}
			<button class="service-card border-0 p-0 text-start w-100 rounded-3 shadow-sm" on:click={handleServiceClick}>
				<div class="service-card-inner rounded-4 p-3 h-100 d-flex flex-column" style="background-color: {service.bgColor};">
					<div class="icon-wrapper mb-3 rounded-circle d-flex align-items-center justify-content-center" style="background: {service.gradient};">
						<i class="{service.icon} text-white fs-4"></i>
					</div>
					<h3 class="fw-bold fs-6 mb-2">{service.title}</h3>
					<p class="text-muted small mb-3 flex-grow-1">{service.description}</p>
					<div class="d-flex align-items-center text-primary fw-semibold cta-text">
						<span class="me-2">Get Started</span>
						<i class="bi bi-arrow-right"></i>
					</div>
				</div>
			</button>
		{/each}
	</div>
</div>

<style lang="scss">
	.services-grid {
		display: grid;
		gap: 1rem;
		grid-template-columns: repeat(1, 1fr);

		@media (min-width: 576px) {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	.service-card {
		background: transparent;
		cursor: pointer;
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;

		&:hover {
			transform: translateY(-4px);

			.service-card-inner {
				box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
			}
		}

		&:active {
			transform: translateY(-2px);
		}
	}

	.service-card-inner {
		transition: box-shadow 0.2s ease;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
		min-height: 200px;
	}

	.icon-wrapper {
		width: 56px;
		height: 56px;
	}

	.cta-text {
		font-size: 0.9rem;
		transition: gap 0.2s ease;

		i {
			transition: transform 0.2s ease;
		}
	}

	.service-card:hover .cta-text i {
		transform: translateX(4px);
	}

	.small {
		font-size: 0.875rem;
		line-height: 1.4;
	}
</style>
