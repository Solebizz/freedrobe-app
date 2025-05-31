<script lang="ts">
	export let article: App.IArticleInfo;
</script>

<div class="text-primary position-relative">
	<div class="d-flex justify-content-between align-items-center mt-2">
		<p class="m-0 fs-5 fw-bold">{article.Name}</p>
		<span class="chip bg-secondary text-primary p-1 rounded">{article.Status}</span>
	</div>
	<p class="mt-3 m-0">{article.Category}</p>

	{#if article && article.Images}
		<hr />
		<div class="d-flex gap-2 overflow-scroll">
			{#each article.Images as img}
				<img class="rounded border border-black" width="80" height="100" src={img} alt="Article Image" />
			{/each}
		</div>
	{/if}
</div>
