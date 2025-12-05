<div class="onboarding-container bg-body-tertiary">
	<slot />
</div>

<style lang="scss">
	.onboarding-container {
		height: 100%;
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		padding-top: 1rem;
		padding-bottom: 2rem;
	}
</style>
