<script lang="ts">
	import type { LayoutData } from './$types';
	import '../app.css';
	import NavSearch from '$lib/components/nav-search.svelte';
	import HamburgerMenuIcon from '$lib/icons/hamburger-menu-icon.svelte';
	import ProfileButton from '$lib/components/profile-button.svelte';
	import SignupButton from "$lib/components/signup-button.svelte";
	import LoginButton from "$lib/components/login-button.svelte";

	export let data: LayoutData;
	let drawerVisible = true;

	function toggleDrawerVisibility() {
		drawerVisible = !drawerVisible;
	}
</script>

<svelte:head>
	<title>SMLTOWN</title>
</svelte:head>



<div class="bg-base-300 w-screen h-screen">
	<nav class="navbar bg-base-200 px-4 min-h-6">
		<div class="basis-1/3 flex justify-start gap-4">
			<button
				class=" btn btn-ghost btn-square btn-sm active:bg-opacity-30"
				on:click={toggleDrawerVisibility}
			>
				<HamburgerMenuIcon />
			</button>
			<a href="/"><h1 class="font-logo text-[1.75rem] text-sky-500">SMLTOWN</h1></a>
		</div>
		<div class="basis-1/3 flex justify-center">
			<NavSearch />
		</div>

		<div class=" basis-1/3 flex justify-end gap-4">
			<LoginButton />
			<SignupButton/>
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
