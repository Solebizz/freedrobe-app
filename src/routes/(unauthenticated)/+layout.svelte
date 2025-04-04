<div id="outermost_app_wrap">
	<div id="main_container">
		<slot />
	</div>
</div>

<style lang="scss">
	#outermost_app_wrap {
		display: flex;
		flex-direction: column;
		height: 100vh;
	}
	#main_container {
		flex-grow: 1;
		flex-shrink: 1;
		overflow: auto;
		display: flex;
		flex-direction: column;
	}
</style>
