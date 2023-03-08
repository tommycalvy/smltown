<script lang="ts">
	import NavSearch from '$lib/components/nav-search.svelte';
    import { page } from '$app/stores';
</script>

<div class="bg-base-300 w-screen h-screen">
	<nav class="navbar bg-base-200 px-4 min-h-6">
		<div class="basis-1/3 flex justify-start gap-4">
			<a href="/admin">
                <h1 class="text-[1.75rem]">
					<span class="font-logo text-[1.75rem] text-sky-500">SMLTOWN</span> 
                    Admin
				</h1> 
            </a>
            <h1 class="text-2xl">{$page.data.title}</h1>
		</div>
		<div class="basis-1/3 flex justify-center">
			<NavSearch />
		</div>
        <div class=" basis-1/3 flex justify-end gap-4">
            <a href="/admin/posts"><button class="btn btn-sm">Posts</button></a>
            <a href="/admin/users"><button class="btn btn-sm">Users</button></a>
        </div>
	</nav>
    <slot/>
</div>
