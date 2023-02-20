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
	<nav class="navbar bg-base-300 min-h-12 justify-between px-4">
		<div class=" basis-1/6 flex-initial flex justify-start gap-4">
			<a href="/" class="px-2"><h1 class="font-logo text-3xl text-sky-500">SMLTOWN</h1></a>
		</div>
		<div class="flex-auto justify-center">
			<div class="dropdown dropdown-bottom">
				<div class="form-control">
					<input type="text" placeholder="Search" class="input h-10 input-bordered" />
				</div>
				<button
					type="submit"
					class="absolute top-0 right-0 p-2.5 h-10 text-sm font-medium bg-base-100 rounded-r-lg border border-base-content border-opacity-20 focus:outline-none"
				>
					<svg
						aria-hidden="true"
						class="w-5 h-5 text-gray-500 dark:text-gray-400"
						fill="currentColor"
						viewBox="0 0 20 20"
						xmlns="http://www.w3.org/2000/svg"
						><path
							fill-rule="evenodd"
							d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
							clip-rule="evenodd"
						/></svg
					>

					<span class="sr-only">Search</span>
				</button>
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
		<div class="basis-1/6 flex-initial flex justify-end gap-4">
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
