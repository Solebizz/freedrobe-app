<script lang="ts">
	export let Options: {
		label: any;
		value: any;
	}[] = [];

	export let selected: any[] = [];
	export let key: string;
	export let disabled: boolean = false;

	if (!selected || !selected.length) selected = [];

	$: selected_string = Options.filter((item) => selected.includes(item.value))
		.map((item) => item.label)
		.join(', ')
		.slice(0, 66);

	function mass(on: boolean) {
		selected = [];
		if (on) {
			Options.forEach((item) => {
				selected.push(item.value);
			});
		}
	}

	let isBtnHovered = false;
</script>

<div class="dropdown">
	<button
		class="form-control d-flex align-items-end"
		type="button"
		data-bs-toggle="dropdown"
		data-bs-auto-close="outside"
		aria-expanded="false"
		{disabled}>
		{#if selected.length}
			<span class="text-truncate">
				{selected_string}
			</span>
			<span class="ps-1 pe-3">
				{#if selected.length > 1}({selected.length}){/if}
			</span>
		{:else}
			<span>Select One</span>
		{/if}
		<i class="fal fa-angle-down ms-auto"></i>
	</button>
	<ul class="dropdown-menu">
		<li>
			<div class="d-flex justify-content-start align-items-stretch btn-container px-2 mb-2">
				<button
					class="btn btn-sm btn-outline-primary mass-select-btn text-uppercase"
					type="button"
					on:mouseenter={() => (isBtnHovered = true)}
					on:mouseleave={() => (isBtnHovered = false)}
					on:click={() => mass(true)}>Select All</button>
				<div class="divider" class:hide={isBtnHovered}></div>
				<button
					class="btn btn-sm btn-outline-primary mass-select-btn text-uppercase"
					type="button"
					on:mouseenter={() => (isBtnHovered = true)}
					on:mouseleave={() => (isBtnHovered = false)}
					on:click={() => mass(false)}>Select None</button>
			</div>
		</li>
		{#each Options as option}
			<li class="dropdown-item p-0 ps-2">
				<div class="form-check m-0">
					<label class="form-check-label d-block">
						<input type="checkbox" class="form-check-input" name={key} bind:group={selected} value={option.value} />
						{option.label}
					</label>
				</div>
			</li>
		{/each}
	</ul>
</div>

<style lang="scss">
	span,
	label {
		font-size: 14px;
		font-weight: 300;
		padding-top: 0;
		padding-bottom: 0;
	}

	.divider {
		height: 25px;
		width: 1px;
		background-color: var(--bs-primary);
	}

	.mass-select-btn {
		font-size: 15px;
		border: none;
		padding-top: 0px;
		padding-bottom: 0px;
	}

	.hide {
		transition: all 0.3s ease;
		opacity: 0;
	}
</style>
