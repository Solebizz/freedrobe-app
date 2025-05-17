<script lang="ts">
	import type { Notice } from '$lib/stores/notices';

	export let notices: Notice[];

	function getClass(notice: Notice) {
		return classIcon(notice) + ' ' + classColor(notice);
	}
	function classIcon(notice: Notice) {
		if (notice.type == 'success') return 'bi-check2';
		return 'bi-exclamation-triangle';
	}
	function classColor(notice: Notice) {
		if (notice.type == 'error') return 'text-danger';
		return `text-${notice.type}`;
	}
	function getTitle(notice: Notice) {
		if (notice.title) return notice.title;
		return notice.type.charAt(0).toUpperCase() + notice.type.slice(1);
	}
	function remove(i: number) {
		notices.splice(i, 1);
		notices = notices;
	}
</script>

<div id="notice-container">
	{#each notices as notice, notice_i}
		<div class="notice mt-2" data-key="notice_i">
			<div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
				<div class="toast-header">
					<i class="bi me-2 fs-6 {getClass(notice)}" />
					<strong class="me-auto {classColor(notice)}">{getTitle(notice)}</strong>
					<button on:click={() => remove(notice_i)} type="button" class="me-1 mb-1 btn-close" data-bs-dismiss="toast" aria-label="Close" />
				</div>
				<div class="toast-body">
					{notice.msg}
				</div>
			</div>
		</div>
	{/each}
</div>

<style>
	#notice-container {
		position: fixed;
		top: 90px;
		right: 10px;
		z-index: 1001;
	}
</style>
