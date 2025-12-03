<script lang="ts">
	import { onMount } from 'svelte';
	import { logoSrc } from '$lib/utils/globals';

	export let show = true;

	let progress = 0;
	let interval: ReturnType<typeof setInterval>;

	onMount(() => {
		// Animate the progress bar
		interval = setInterval(() => {
			if (progress < 100) {
				progress += 2;
			}
		}, 30);

		return () => {
			if (interval) clearInterval(interval);
		};
	});
</script>

{#if show}
	<div class="position-fixed top-0 start-0 end-0 bottom-0 bg-white d-flex align-items-center justify-content-center" style="z-index: 99999;">
		<div class="d-flex flex-column align-items-center gap-5">
			<img src={logoSrc} alt="Freedrobe" class="splash-logo" style="height: 8rem;" />
			<div class="progress" style="width: 200px; height: 8px;">
				<div
					class="progress-bar"
					role="progressbar"
					style="width: {progress}%; background: linear-gradient(90deg, var(--bs-secondary) 0%, var(--bs-primary) 100%);"
					aria-valuenow={progress}
					aria-valuemin="0"
					aria-valuemax="100">
				</div>
			</div>
		</div>
	</div>
{/if}

<style lang="scss">
	.splash-logo {
		animation: fadeIn 0.5s ease-in;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: scale(0.9);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	.progress {
		overflow: hidden;
	}

	.progress-bar {
		transition: width 0.3s ease;
	}
</style>
