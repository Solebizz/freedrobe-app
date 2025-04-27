<script lang="ts">
	const defaultAvatar = '/imgs/guest-avatar.png';
	export let imageURL = '';
	export let width = 50;
	export let border = 2;

	const avatar = imageURL ? imageURL : defaultAvatar;
</script>

<div class="memberimg" style="background-image:url({avatar});--imgwidth:{width}px;--border:{border}px;"></div>

<style lang="scss">
	.memberimg {
		width: var(--imgwidth);
		height: var(--imgwidth);
		border-radius: calc(var(--imgwidth) / 2);
		background-position: center;
		background-size: cover;
		box-sizing: content-box;
		border: var(--bs-secondary) var(--border) solid;
	}
</style>
