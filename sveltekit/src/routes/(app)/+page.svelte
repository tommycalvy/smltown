<script lang="ts">
	import CreatePostForm from '$lib/components/create-post-form.svelte';
	import Post from '$lib/components/post.svelte';
	import type { PageServerData } from './$types';

	export let data: PageServerData;
</script>

<div class="flex justify-center h-full w-full mt-1">
	<div class="flex flex-col justify-start items-center w-[40rem] gap-5 py-4">
		<CreatePostForm userSession={data.userSession} />
		{#if data.posts}
			{#each data.posts as post}
				<Post {post} />
			{/each}
		{/if}
	</div>
</div>
