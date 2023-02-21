<script lang="ts">
	import type { LayoutData } from './$types';
	import '../app.css';
	import NavSearch from '$lib/components/nav-search.svelte';
	import HamburgerMenuIcon from '$lib/icons/hamburger-menu-icon.svelte';
	import ProfileButton from '$lib/components/profile-button.svelte';

	export let data: LayoutData;
	let drawerVisible = true;

    function toggleDrawerVisibility() {
        drawerVisible = !drawerVisible
    }
</script>

<svelte:head>
	<title>SMLTOWN</title>
</svelte:head>

<input type="checkbox" id="modal-signup" class="modal-toggle" />
<div class="modal modal-bottom sm:modal-middle">
	<div class="modal-box">
		<h3 class="font-bold text-lg">Congratulations random Internet user!</h3>
		<p class="py-4">
			You've been selected for a chance to get one year of subscription to use Wikipedia for free!
		</p>
		<div class="modal-action">
			<label for="modal-signup" class="btn">Yay!</label>
		</div>
	</div>
</div>

<div class="bg-base-300 w-screen h-screen">
	<nav class="navbar bg-base-200 justify-between px-4">
		<div class="basis-1/3 flex justify-start gap-4">
			<button class=" btn btn-ghost btn-square active:bg-opacity-30" on:click={toggleDrawerVisibility}>
				<HamburgerMenuIcon />
			</button>
			<a href="/"><h1 class="font-logo text-[1.75rem] text-sky-500">SMLTOWN</h1></a>
		</div>
		<div class="basis-1/3 flex justify-center">
			<NavSearch />
		</div>

		<div class=" basis-1/3 flex justify-end gap-4">
			<label for="modal-signup" class="btn btn-primary btn-sm">Sign Up</label>
			<ProfileButton theme={data.theme} />
		</div>
	</nav>
	<div class="flex gap-4">
		{#if drawerVisible}
			<div class="w-40 flex-none">
				<ul>
					<li>Hello</li>
					<li>hi</li>
					<li>mommy</li>
				</ul>
			</div>
			<main class="w-full -ml-44">
				<slot />
			</main>
		{:else}
		<main class="w-full">
			<slot />
		</main>
		{/if}
	</div>
</div>
