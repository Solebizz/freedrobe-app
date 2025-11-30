<div class="onboarding-container">
	<slot />
</div>

<style lang="scss">
	.onboarding-container {
		height: 100%;
		display: flex;
		flex-direction: column;
		background-color: var(--bs-body-bg);
		overflow: hidden;
	}

	:global(.onboarding-content) {
		flex: 1;
		overflow-y: auto;
		background-color: var(--bs-body-tertiary);
		padding: 1.5rem;
	}
</style>
