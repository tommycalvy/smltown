<script lang="ts">
	import UpArrowIcon from "$lib/icons/up-arrow-icon.svelte";
    import DownArrowIcon from "$lib/icons/down-arrow-icon.svelte";
    import type { Post } from "$lib/types";

    export let post: Post;

    // Function to convert timestamp to how many hours or days or weeks or months or years ago
    function timestampToAgo(timestamp: number) : string {
        let seconds = Math.floor(Date.now() / 1000) - timestamp;
        let interval = seconds / 31536000;
        if (interval > 2) {
            return Math.floor(interval) + " years";
        } else if (interval > 1) {
            return Math.floor(interval) + " year";
        }
        interval = seconds / 2592000;
        if (interval > 2) {
            return Math.floor(interval) + " months";
        } else if (interval > 1) {
            return Math.floor(interval) + " month";
        }
        interval = seconds / 86400;
        if (interval > 2) {
            return Math.floor(interval) + " days";
        } else if (interval > 1) {
            return Math.floor(interval) + " day";
        }
        interval = seconds / 3600;
        if (interval > 2) {
            return Math.floor(interval) + " hours";
        } else if (interval > 1) {
            return Math.floor(interval) + " hour";
        }
        interval = seconds / 60;
        if (interval > 2) {
            return Math.floor(interval) + " minutes";
        } else if (interval > 1) {
            return Math.floor(interval) + " minute";
        }
        return Math.floor(seconds) + " seconds";
    }
    let ago = timestampToAgo(post.timestamp) + " ago";
</script>

<div class="flex gap-3 w-full bg-base-100 group rounded-md px-4 py-2">
    <div class="w-10 flex flex-col items-center">
        <form>
            <button
                class="btn btn-ghost btn-square btn-sm"
                type="submit"
            >
                <UpArrowIcon class="inline-block w-6 h-6 stroke-current" />
            </button>
        </form>
		<h1 class="text-2xl cursor-default">{post.votes}</h1>
        <button
                class="btn btn-ghost btn-square btn-sm"
                type="submit"
            >
                <DownArrowIcon class="inline-block w-6 h-6 stroke-current" />
            </button>
	</div>
	<div class="flex flex-col gap-3 w-full">
        <div class="flex justify-between">
            <h6 class=" text-xs">Posted by {post.username} {ago}</h6>
            <span class="badge badge-primary">{post.channel2}</span>
        </div>
		<h1 class=" text-xl">{post.title}</h1>
        <p>{post.body}</p>
    </div>
</div>
	

	
	
			