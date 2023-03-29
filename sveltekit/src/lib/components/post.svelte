<script lang="ts">
	import type { Post } from "$lib/types";

    export let post: Post;
</script>

<div class="flex gap-3 w-full bg-base-100 group rounded-md p-4">
    <div class="w-10">
		<h1>{post.votes}</h1>
	</div>
	<div class="flex flex-col gap-3 w-full">
        <h6>{post.username} <span>{post.channel2}</span></h6>
		<h1>{post.title}</h1>
        <p>{post.body}</p>
    </div>
</div>
	

	
	
			