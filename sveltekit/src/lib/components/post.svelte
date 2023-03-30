<script lang="ts">
	import UpArrowIcon from "$lib/icons/up-arrow-icon.svelte";
    import DownArrowIcon from "$lib/icons/down-arrow-icon.svelte";
    import type { Post } from "$lib/types";

    export let post: Post;
    console.log(post.timestamp);

    // Function to convert timestamp to how many hours or days or weeks or months or years ago
    function timestampToAgo(timestamp: number) : string {
        let seconds = Math.floor((new Date().getTime() - timestamp) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) {
            return Math.floor(interval) + " years";
        }
        interval = seconds / 2592000;
        if (interval > 1) {
            return Math.floor(interval) + " months";
        }
        interval = seconds / 86400;
        if (interval > 1) {
            return Math.floor(interval) + " days";
        }
        interval = seconds / 3600;
        if (interval > 1) {
            return Math.floor(interval) + " hours";
        }
        interval = seconds / 60;
        if (interval > 1) {
            return Math.floor(interval) + " minutes";
        }
        return Math.floor(seconds) + " seconds";
    }
    let date = timestampToAgo(post.timestamp) + " ago";
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
            <h6 class=" text-xs">Posted by {post.username} on {date}</h6>
            <span class="badge badge-primary">{post.channel2}</span>
        </div>
		<h1 class=" text-xl">{post.title}</h1>
        <p>{post.body}</p>
    </div>
</div>
	

	
	
			