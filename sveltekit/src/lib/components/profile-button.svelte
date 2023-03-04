<script lang="ts">
	import type { User } from '$lib/types';
	import ProfileIcon from '$lib/icons/profile-icon.svelte';
	import type { Theme, WithTarget } from '$lib/types';
	import type { UiContainer } from '@ory/kratos-client';
	import Messages from "$lib/components/auth/messages.svelte";
	import { isUiNodeInputAttributes } from "$lib/utils";

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
	export let openVerifyEmailModal: boolean = false;

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
			{#if verifyEmailUi && !user.verified}
				<li>
					<label for="modal-verify-email" class="w-full h-full text-start px-4 py-2 flex justify-between">
						Verify Email
						<span class="badge badge-secondary">PLZ</span>
					</label>
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

{#if verifyEmailUi}
<input type="checkbox" id="modal-verify-email" class="modal-toggle" checked={openVerifyEmailModal}/>
<label for="modal-verify-email" class="modal duration-0 bg-black bg-opacity-80">
	<label class="modal-box relative duration-0" for="">
		<div class=" modal-action absolute top-0 right-0 m-1">
			<label for="modal-verify-email" class="btn btn-circle btn-sm btn-ghost">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/></svg
				>
			</label>
		</div>
		<div class="flex justify-center flex-col items-center gap-2 py-4">
			<h1 class=" text-2xl font-bold pb-4">
				Verify your <span class="font-logo text-3xl text-sky-500">SMLTOWN</span> account
			</h1>
            <p class="text-center pb-1">
                Didn't receive your verification email? Please enter the email address associated with your
                SMLTOWN account, and we'll send you another email containing a verification link.
            </p>
		</div>
		<form action={verifyEmailUi.action} method="POST" enctype="application/x-www-form-urlencoded">
			{#if verifyEmailUi.messages}
				<Messages messages={verifyEmailUi.messages} />
			{/if}
			<div class="form-control w-full">
				{#each verifyEmailUi.nodes as { attributes, messages }}
					{#if isUiNodeInputAttributes(attributes)}
						{#if attributes.name === 'csrf_token'}
							<input
								name={attributes.name}
								type={attributes.type}
								value={attributes.value}
								required={attributes.required}
								disabled={attributes.disabled}
							/>
						{/if}
						{#if attributes.name === 'email'}
							<fieldset>
								<label class="label flex-col items-start">
									<span class="label-text py-1">Email</span>
									<input
										type={attributes.type}
										name={attributes.name}
										required={attributes.required}
										disabled={attributes.disabled}
										value={attributes.value ? attributes.value : ''}
										class="input input-bordered w-full mb-2"
									/>
								</label>
								{#if messages}
									<Messages {messages} />
								{/if}
							</fieldset>
						{/if}
						{#if attributes.type === 'submit'}
							<button
								type={attributes.type}
								name="auth_method"
								value={attributes.value}
								disabled={attributes.disabled}
								class="btn btn-block btn-primary mt-6 mb-2">Send Verification Email</button
							>
							{#if messages}
								<Messages {messages} />
							{/if}
						{/if}
					{/if}
				{/each}
			</div>
		</form>
	</label>
</label>
{/if}

