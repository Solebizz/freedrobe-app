<div class="onboarding-container os_top_padding">
	<slot />
</div>

<style lang="scss">
	.onboarding-container {
		height: 100vh;
		display: flex;
		flex-direction: column;
		background-color: var(--bs-body-bg);
		overflow: hidden;
	}

	:global(.onboarding-header-content) {
		padding: 1.5rem 1rem;
		flex-shrink: 0;
	}

	:global(.onboarding-content) {
		flex: 1;
		overflow-y: auto;
		background-color: var(--bs-body-tertiary);
		padding: 1.5rem;
	}
</style>
