<script lang="ts">
	// import ImageInput from './image_input.svelte';

	enum FileTypes {
		image = 'image',
		csv = 'csv',
		test = 'test',
	}
	type FileType = `${FileTypes}`;

	export let maxSize: number | undefined = undefined;
	export let value: string = '';
	export let disabled = false;
	export let file_type: FileType = FileTypes.image;
	export let returnURL = true;
	export let required = false;

	let error = '';
	let input: HTMLInputElement;
	let dragging = false;
	let showCameraPreview = false;

	function drop(e: DragEvent) {
		e.preventDefault();
		dragging = false;
		error = '';
		if (e.dataTransfer?.files instanceof FileList) handleFileList(e.dataTransfer.files);
		else {
			error = 'Not a list of files';
		}
	}
	function selected(e: Event) {
		let { files } = e.target as HTMLInputElement;
		error = '';
		if (files instanceof FileList) handleFileList(files);
		else error = 'Invalid file list';
	}

	function handleFileList(files: FileList) {
		if (disabled) return;
		if (!files.length) return;
		let file = files[0];
		try {
			if (!file.type.includes(file_type)) {
				throw new Error(`File must be of type ${file_type}. Invalid type ${file.type}`);
			}
			if (maxSize && file.size > maxSize) {
				throw new Error(`File size ${file.size} exceeds allowed ${maxSize}`);
			}
			//upload and return URL to file
			if (returnURL) {
				//upload file
				const formData = new FormData();
				formData.append('file', file);
				fetch('/app/api/utils/upload', {
					method: 'POST',
					body: formData,
				})
					.then((res) => res.json())
					.then((res) => {
						if (res.url) {
							value = res.url;
						} else {
							error = res.error;
						}
					})
					.catch((err) => {
						error = err.message;
					});
			}
			//return data
			else {
				let reader = new FileReader();
				reader.onload = (e) => {
					if (typeof e.target?.result == 'string') value = e.target.result;
				};
				if (file_type == FileTypes.image) reader.readAsDataURL(file);
				else reader.readAsText(file);
			}
		} catch (err) {
			error = 'read error';
			if (err instanceof Error) error = err.message;
			if (typeof err == 'string') error = err;
			value = '';
		}
	}
</script>

<button
	class="drop rounded-pill border"
	class:p-3={!showCameraPreview}
	class:has_file={!!value}
	class:dragging
	type="button"
	on:drop={drop}
	on:dragover={(ev) => {
		ev.preventDefault();
	}}
	on:dragenter={() => (dragging = true)}
	on:dragleave={() => (dragging = false)}>
	{#if value}
		{#if file_type === FileTypes.image}
			<div class="d-flex align-items-center gap-2 mb-2">
				<img class="preview" src={value} alt="Uploaded preview" />
			</div>
		{/if}
		<!-- <span class="btn btn-outline-dark" class:d-none={showCameraPreview} on:click={() => (!disabled ? input.click() : null)}><i class="bi bi-arrow-clockwise"></i> Replace</span> -->
	{:else}
		<!-- <span class="btn btn-outline-dark" class:d-none={showCameraPreview} on:click={() => (!disabled ? input.click() : null)}><i class="bi bi-file-arrow-up"></i> Upload</span> -->
	{/if}
	<!-- <span class="mt-2" class:d-none={showCameraPreview}>OR</span> -->
	<span class="btn" class:d-none={showCameraPreview} on:click={() => (showCameraPreview = true)}><i class="bi bi-camera fs-1"></i></span>
	{#if error}<small class="text-danger mt-1">{error}</small>{/if}
	<input type="file" on:change={selected} class="d-none" bind:this={input} {disabled} {required} />
	{#if showCameraPreview}
		<!-- <ImageInput bind:input bind:showCameraPreview /> -->
	{/if}
</button>

<style lang="scss">
	.preview {
		height: 5rem;
		width: 5rem;
	}
	.drop {
		background: transparent;
		// min-height: 120px;
		&.has_file {
			border-color: var(--bs-success);
		}
		&.dragging {
			background-color: var(--bs-gray-100);
		}
	}
	.file_icon {
		font-size: 30px;
		margin-bottom: 10px;
	}
	img {
		height: 30px;
		width: 30px;
		object-fit: contain;
	}
</style>
