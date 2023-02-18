<script lang="ts">
	import type { LayoutData } from './$types';
	import type { Theme, WithTarget } from '$lib/types';
	import '../app.css';
	import ProfileIcon from '$lib/icons/profile-icon.svelte';

	const setTheme = (event: WithTarget<MouseEvent, HTMLInputElement>) => {
		const checked = event.currentTarget.checked;
		const theme: Theme = checked ? 'dark' : 'light';
		document.documentElement.setAttribute('data-theme', theme);
		document.cookie = `theme=${theme};max-age=31536000;path="/";samesite=strict;secure`;
	};

	export let data: LayoutData;
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
	<nav class="navbar bg-base-300 min-h-12 justify-center px-4">
		<div class="flex-none gap-2">
			<a href="/" class="px-2"><h1 class="font-logo text-2xl text-sky-500">SMLTOWN</h1></a>
		</div>
		<div class="flex-1 justify-center">
			<div class="dropdown dropdown-bottom">
				<input type="search" placeholder="Search" class="input input-bordered input-sm w-96" />
				<ul class="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52">
					<li>
						<a href="/profile" class="justify-between">
							Profile
							<span class="badge">New</span>
						</a>
					</li>
					<li><a href="/settings">Settings</a></li>
					<li><a href="/logout">Logout</a></li>
				</ul>
			</div>
		</div>
		<div class="flex-none gap-4">
			
			<label for="modal-signup" class="btn btn-primary btn-sm">Sign Up</label>
			<div class="dropdown dropdown-end">
				<label tabindex="0" class="btn btn-ghost btn-square btn-sm avatar active:bg-opacity-30">
					<ProfileIcon class="inline-block w-6 h-6 stroke-current" />
				</label>
				<ul
					tabindex="0"
					class="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52"
				>
					<li>
						<a href="/profile" class="justify-between">
							Profile
							<span class="badge badge-secondary">New</span>
						</a>
					</li>
					<li><a href="/settings">Settings</a></li>
					<li><a href="/logout">Logout</a></li>
					<li>
						<label class="label cursor-pointer w-full px-4 py-1.5">
							<span class="label-text active:text-white">Dark Mode</span>
							<!--Need to fix Dark Mode text on active-->
							<input
								type="checkbox"
								class="toggle toggle-primary"
								checked={data.theme == 'dark' ? true : false}
								on:click={setTheme}
							/>
						</label>
					</li>
				</ul>
			</div>
		</div>
	</nav>
	<slot />
</div>
