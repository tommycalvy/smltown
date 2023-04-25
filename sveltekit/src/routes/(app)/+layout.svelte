<script lang="ts">
	import type { LayoutData } from './$types';
	import { onMount } from 'svelte';
	import '$lib/app.css';
	import ProfileButton from '$lib/components/profile-button.svelte';
	import SignupButton from '$lib/components/signup-button.svelte';
	import LoginButton from '$lib/components/login-button.svelte';
	import { page } from '$app/stores';
	import Geolocation from 'svelte-geolocation';
	import { latitude, longitude, coords, gerror } from '$lib/stores/geolocation';

	import EnableGeolocationButton from '$lib/components/enable-geolocation-button.svelte';

	let ismounted = false;
	let success = false;
	let getPosition = false;

	onMount(async () => {
		ismounted = true;
		getPosition = true;
	});

	$: if (success) {
		document.cookie = `latitude=${$latitude.toFixed(
			3
		)};max-age=3600;path="/";samesite=strict;secure`;
		document.cookie = `longitude=${$longitude.toFixed(
			3
		)};max-age=3600;path="/";samesite=strict;secure`;
	}

	export let data: LayoutData;
</script>

<svelte:head>
	<title>{$page.data.title}</title>
</svelte:head>

{#if ismounted}
	<Geolocation {getPosition} bind:coords={$coords} bind:error={$gerror} bind:success />
{/if}

<nav class="navbar bg-base-200 px-4 min-h-6 justify-between">
	<div class="flex justify-start gap-4">
		<a href="/"><h1 class="font-logo text-[1.75rem] text-sky-500">SMLTOWN</h1></a>
	</div>
	<div class="flex justify-end gap-4">
		{#if $latitude === -1 && $longitude === -1 && gerror}
			<EnableGeolocationButton />
		{/if}
		{#if !data.user}
			{#if $page.form}
				{#if $page.form.loginUi}
					<LoginButton ui={$page.form.loginUi} open={true} />
				{/if}
				{#if $page.form.signupUi}
					<SignupButton ui={$page.form.signupUi} open={true} />
				{/if}
			{/if}
			{#if data.loginUi}
				<LoginButton ui={data.loginUi} open={data.openLoginModal} />
			{/if}
			{#if data.signupUi}
				<SignupButton ui={data.signupUi} open={data.openSignupModal} />
			{/if}
		{/if}
		{#if $page.form}
			{#if $page.form.verifyEmailUi}
				<ProfileButton
					theme={data.theme}
					userSession={data.userSession}
					logoutToken={data.logoutToken}
					verifyEmailUi={$page.form.verifyEmailUi}
					openVerifyEmailModal={true}
				/>
			{:else}
				<ProfileButton
					theme={data.theme}
					userSession={data.userSession}
					logoutToken={data.logoutToken}
					verifyEmailUi={data.verifyEmailUi}
					openVerifyEmailModal={data.openVerifyEmailModal}
				/>
			{/if}
		{:else}
			<ProfileButton
				theme={data.theme}
				userSession={data.userSession}
				logoutToken={data.logoutToken}
				verifyEmailUi={data.verifyEmailUi}
				openVerifyEmailModal={data.openVerifyEmailModal}
			/>
		{/if}
	</div>
</nav>
<div class="flex gap-4">
	<main class="w-full">
		<slot />
	</main>
</div>
