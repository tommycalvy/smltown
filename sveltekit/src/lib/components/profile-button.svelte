<script lang="ts">
	import type { User } from '$lib/auth';
	import ProfileIcon from '$lib/icons/profile-icon.svelte';
	import type { Theme, WithTarget } from '$lib/types';

	const setTheme = (event: WithTarget<MouseEvent, HTMLInputElement>) => {
		const checked = event.currentTarget.checked;
		const theme: Theme = checked ? 'dark' : 'light';
		document.documentElement.setAttribute('data-theme', theme);
		document.cookie = `theme=${theme};max-age=31536000;path="/";samesite=strict;secure`;
	};

	export let user: User | undefined;
	export let theme: Theme;

	let isDropdownOpen = false; // default state (dropdown close)

	const handleDropdownClick = () => {
		isDropdownOpen = !isDropdownOpen; // togle state on click
	};

	const handleDropdownFocusLost = ({
		relatedTarget,
		currentTarget
	}: WithTarget<FocusEvent, HTMLDivElement>) => {
		// use "focusout" event to ensure that we can close the dropdown when clicking outside or when we leave the dropdown with the "Tab" button
		if (relatedTarget instanceof HTMLElement && currentTarget.contains(relatedTarget)) return; // check if the new focus target doesn't present in the dropdown tree (exclude ul\li padding area because relatedTarget, in this case, will be null)
		isDropdownOpen = false;
	};
</script>

<div class="dropdown dropdown-end" on:focusout={handleDropdownFocusLost}>
	{#if user}
		<button tabindex="0" class="btn btn-ghost btn-circle avatar" on:click={handleDropdownClick}>
			<div class="flex justify-center" style="background-color: {user.color}">
				<span>{user.name.charAt(0).toUpperCase()}</span>
			</div>
		</button>
	{:else}
		<button
			tabindex="0"
			class="btn btn-ghost btn-square btn-sm avatar"
			on:click={handleDropdownClick}
		>
			<ProfileIcon class="inline-block w-6 h-6 stroke-current" />
		</button>
	{/if}
	<ul
		tabindex="0"
		class="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52"
		style:visibility={isDropdownOpen ? 'visible' : 'hidden'}
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
					checked={theme == 'dark' ? true : false}
					on:click={setTheme}
				/>
			</label>
		</li>
	</ul>
</div>
