<script lang="ts">
	import { goto } from '$app/navigation';
	import { APP } from '$lib/stores/appMain';

	const services = [
		{
			title: 'Dry Clean',
			description: 'Professional dry cleaning for your delicate garments with expert care',
			gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
			bgColor: '#f3f4ff',
			bgImg: '/imgs/dryclean-bg.png',
		},
		{
			title: 'Laundry',
			description: 'Fresh and clean laundry service with premium detergents',
			gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
			bgColor: '#fff5f7',
			bgImg: '/imgs/laundry-bg.png',
		},
		{
			title: 'Storage',
			description: 'Schedule your first pickup and experience our premium service',
			gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
			bgColor: '#f0fff9',
			bgImg: '/imgs/storage-bg.png',
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
				<div class="service-card-inner rounded-4 p-3 d-flex flex-column position-relative overflow-hidden" style="background-color: {service.bgColor};">
					<img src={service.bgImg} alt={service.title + ' background'} class="service-bg-img position-absolute top-0 start-0 w-100 h-100" style="object-fit: cover; z-index: 1;" />
					<div class="service-gradient-overlay position-absolute top-0 start-0 w-100 h-100" style="z-index: 2; background: {service.gradient}; opacity: 0.65;"></div>
					<div class="position-relative d-flex flex-column h-100" style="z-index: 3;">
						<div>
							<h3 class="fw-bold fs-6 mb-2 text-white">{service.title}</h3>
							<p class="small mb-3 text-white-80">{service.description}</p>
						</div>
						<div class="d-flex align-items-center fw-semibold cta-text text-white mt-auto">
							<span class="me-2">Get Started</span>
							<i class="bi bi-arrow-right"></i>
						</div>
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
		height: 150px;
		position: relative;
		overflow: hidden;
	}

	.service-bg-img {
		pointer-events: none;
		user-select: none;
		filter: brightness(0.3) contrast(1);
	}

	.service-gradient-overlay {
		pointer-events: none;
		user-select: none;
	}

	.icon-wrapper {
		width: 56px;
		height: 56px;
	}

	.cta-text {
		font-size: 0.9rem;
		transition: gap 0.2s ease;
		color: #fff;
		i {
			transition: transform 0.2s ease;
			color: #fff;
		}
	}

	.text-white {
		color: #fff !important;
	}
	.text-white-80 {
		color: rgba(255, 255, 255, 0.8) !important;
	}

	.service-card:hover .cta-text i {
		transform: translateX(4px);
	}

	.small {
		font-size: 0.875rem;
		line-height: 1.4;
	}
</style>
