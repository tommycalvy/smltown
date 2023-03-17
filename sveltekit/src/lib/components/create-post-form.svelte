<script lang="ts">
	import ProfileIcon from '$lib/icons/profile-icon.svelte';
	import { loginModal } from '$lib/stores/login-modal';
	import type { UserSession, WithTarget } from '$lib/types';
	import Geolocation from 'svelte-geolocation';
    import { onMount } from 'svelte';

	export let userSession: UserSession | undefined;

	let coords: [number, number] = [-1, -1];

	function openModal() {
		loginModal.update((open) => !open);
	}

	let postForm: 'flex' | 'hidden' = 'hidden';

	let placeholderText = 'Create Post';
	function onInputFocus() {
		placeholderText = 'Title';
        console.log(coords);
	}
	function onInputBlur() {
		placeholderText = 'Create Post';
	}

	function setPostForm() {
		postForm = 'flex';
	}

	let channels1 = ['General', 'News', 'Events'];
	let channels2 = ['General', 'News', 'Events'];

	let channel1value: string;
	let channel2value: string;

	function setChannel1Value(event: WithTarget<MouseEvent, HTMLButtonElement>) {
		channel1value = event.currentTarget.value;
	}
	function setChannel2Value(event: WithTarget<MouseEvent, HTMLButtonElement>) {
		channel2value = event.currentTarget.value;
	}
</script>

{#if postForm==='flex'}
    <Geolocation getPosition bind:coords />
{/if}

<form
	action="?/createPost"
	method="POST"
	enctype="application/x-www-form-urlencoded"
	class="flex gap-3 w-full bg-base-100 group rounded-md p-4"
>
    <input 
        type="hidden"
        name="latitude"
        bind:value={coords[1]}
    />
    <input 
        type="hidden"
        name="longitude"
        bind:value={coords[0]}
    />
	<div class="w-10">
		{#if userSession}
			<a href={`/profile/${userSession.username}`}>
				<button tabindex="0" class="btn btn-sm btn-circle avatar online">
					<h1 class=" text-base-content text-[1.75rem]">
						{userSession.username.charAt(0).toUpperCase()}
					</h1>
				</button>
			</a>
		{:else}
			<button tabindex="0" class="btn btn-ghost btn-square btn-sm avatar" on:click={openModal}>
				<ProfileIcon class="inline-block w-6 h-6 stroke-current" />
			</button>
		{/if}
	</div>
	<div class="flex flex-col gap-3 w-full">
		<input
			name="title"
			type="text"
			placeholder={placeholderText}
			class="input input-bordered w-full peer"
			required
			on:focus={onInputFocus}
			on:blur={onInputBlur}
		/>
		<div
			class={`${postForm} group-focus-within:flex flex-col gap-3 peer-valid:flex w-full focus:flex`}
		>
			<textarea
				name="body"
				placeholder="Text"
				class="textarea textarea-bordered textarea-lg w-full px-4 py-1"
				required
				on:change={setPostForm}
			/>
			<div class="flex items-center justify-between">
				<div class="dropdown dropdown-bottom">
					<input
						type="text"
						name="channel1"
						placeholder="Select Channel 1"
						class="input input-bordered"
						required
						bind:value={channel1value}
						on:change={setPostForm}
					/>
					<ul
						class="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-full"
					>
						{#each channels1 as channel}
							<li>
								<button
									type="button"
									class="w-full h-full text-start px-2 py-2 text-base"
									on:click={setChannel1Value}
									value={channel}
								>
									{channel}
								</button>
							</li>
						{/each}
					</ul>
				</div>
				<div class="dropdown dropdown-bottom">
					<input
						name="channel2"
						type="text"
						placeholder="Select Channel 2"
						class="input input-bordered"
						required
						bind:value={channel2value}
						on:change={setPostForm}
					/>
					<ul
						class="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-full"
					>
						{#each channels2 as channel}
							<li>
								<button
									type="button"
									class="w-full h-full text-start px-2 py-2 text-base"
									on:click={setChannel2Value}
									value={channel}
								>
									{channel}
								</button>
							</li>
						{/each}
					</ul>
				</div>
				<button type="submit" class="btn btn-primary btn-sm h-10 px-4 text-base">Post</button>
			</div>
		</div>
	</div>
</form>