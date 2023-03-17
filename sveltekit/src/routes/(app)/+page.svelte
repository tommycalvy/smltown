<script lang="ts">
	import CreatePostForm from "$lib/components/create-post-form.svelte";
	import type { PageServerData } from './$types';
	
    export let data: PageServerData;
</script>

<div class="flex justify-center h-full w-full mt-1">
	<div class="flex flex-col justify-start items-center w-[40rem]">
		<CreatePostForm userSession={data.userSession}/>
	</div>
</div>
