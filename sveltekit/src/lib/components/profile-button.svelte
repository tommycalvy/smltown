<script lang="ts">
	import type { User } from '$lib/types';
	import ProfileIcon from '$lib/icons/profile-icon.svelte';
	import type { Theme, WithTarget } from '$lib/types';
	import VerifyEmailButton from './verify-email-button.svelte';
	import type { UiContainer } from '@ory/kratos-client';

	const setTheme = (event: WithTarget<MouseEvent, HTMLInputElement>) => {
		const checked = event.currentTarget.checked;
		const theme: Theme = checked ? 'dark' : 'light';
		document.documentElement.setAttribute('data-theme', theme);
		document.cookie = `theme=${theme};max-age=31536000;path="/";samesite=strict;secure`;
	};

	export let user: User | undefined;
	export let logoutToken: string | undefined;
	export let theme: Theme;
	export let verifyEmailUi: UiContainer | undefined;

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
			<h1 class=" text-base-content text-[1.75rem]">{user.username.charAt(0).toUpperCase()}</h1>
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
		{#if user}
			<li>
				<a href="/profile" class="justify-between">
					Profile
				</a>
			</li>
			{#if verifyEmailUi}
				<li>
					<VerifyEmailButton ui={verifyEmailUi} />
				</li>
			{/if}
			<li><a href="/settings">Settings</a></li>
			{#if logoutToken}
				<li>
					<form
						action="?/logout"
						method="POST"
						enctype="application/x-www-form-urlencoded"
						class="p-0 w-full h-full"
					>
						<input type="hidden" name="logout_token" value={logoutToken} />
						<button type="submit" class="w-full h-full text-start px-4 py-2"> Logout </button>
					</form>
				</li>
			{/if}
		{/if}
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
