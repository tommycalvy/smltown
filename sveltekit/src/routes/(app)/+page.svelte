<script lang="ts">
	import CreatePostForm from '$lib/components/create-post-form.svelte';
	import PostRangeSlider from "$lib/components/post-range-slider.svelte";
	import Post from '$lib/components/post.svelte';
	import type { PageServerData } from './$types';

	export let data: PageServerData;
</script>

<div class="flex justify-center h-full w-full mt-1">
	<div class="flex flex-col justify-start items-center w-[40rem] gap-5 py-4">
		<CreatePostForm userSession={data.userSession} />
		<PostRangeSlider />
		{#if data.posts}
			{#if data.posts.length === 0}
				<div class="flex flex-col justify-center items-center w-full h-full">
					<h1 class="text-2xl font-bold text-gray-500">No posts found</h1>
					<h1 class="text-xl font-bold text-gray-500">Try adjusting the slider</h1>
				</div>
			{/if}
			{#each data.posts as post}
				<Post {post} />
			{/each}
		{/if}
	</div>
</div>
