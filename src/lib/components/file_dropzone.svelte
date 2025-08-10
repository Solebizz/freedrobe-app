<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { APP } from '$lib/stores/appMain';
	import { getUploadProgress, uploadImage } from '$lib/utils/apis';

	enum FileTypes {
		image = 'image/jpeg',
		csv = 'csv',
		test = 'test',
	}
	type FileType = `${FileTypes}`;

	export let maxSize: number | undefined = undefined;
	export let value: string = '';
	export let disabled = false;
	export let file_type: FileType = FileTypes.image;
	export let returnURL = true;

	let error = '';
	let input: HTMLInputElement;
	let dragging = false;

	let file_type_icon = 'image';
	if (file_type == FileTypes.csv) file_type_icon = 'file-csv';

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

	async function handleFileList(files: FileList) {
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

			console.log('her=e====', returnURL);
			//upload and return URL to file
			if (returnURL) {
				//upload file
				const id = await uploadImage(file);
				if (!id) throw Error('Server error.');

				const intervalID = setInterval(() => {
					getUploadProgress(id)
						.then((res) => {
							if (res?.UploadProgress === 100) {
								value = res.URL || '';
								clearInterval(intervalID);
							}
						})
						.catch((err) => {
							error = err.message;
							clearInterval(intervalID);
						});
				}, 1000);
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
	class="drop rounded"
	class:has_file={!!value}
	class:dragging
	type="button"
	on:drop={drop}
	on:click={() => (!disabled ? input.click() : null)}
	on:dragover={(ev) => {
		ev.preventDefault();
	}}
	on:dragenter={() => (dragging = true)}
	on:dragleave={() => (dragging = false)}>
	{#if value}
		{#if file_type === FileTypes.image}
			<div class="d-flex align-items-center gap-2 mb-2">
				<i class="fas fa-circle-check text-success"></i>
				<img src={value} alt="Uploaded preview" />
			</div>
		{:else}
			<i class="fal fa-{file_type_icon} file_icon"></i>
		{/if}
		<span class="btn btn-outline-dark"><i class="far fa-refresh"></i> Replace</span>
	{:else}
		<span class="btn btn-outline-dark"><i class="far fa-upload"></i> Upload</span>
	{/if}
	{#if error}<small class="text-danger mt-1">{error}</small>{/if}
	<input type="file" on:change={selected} class="d-none" bind:this={input} {disabled} />
</button>

<style lang="scss">
	.drop {
		border: 2px dashed var(--bs-border-color);
		display: block;
		width: 100%;
		padding: 0 10px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: transparent;
		min-height: 120px;
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
