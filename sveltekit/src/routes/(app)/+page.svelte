<script lang="ts">
	import ProfileIcon from '$lib/icons/profile-icon.svelte';
	import type { PageServerData } from './$types';
	import { loginModal } from '$lib/stores/login-modal';

	export let data: PageServerData;

	function openModal() {
		loginModal.update((open) => !open);
	}
</script>

<div class="flex justify-center h-full w-full mt-1">
	<div class="flex flex-col justify-start items-center w-[40rem]">
        <div class="card card-compact w-full bg-base-100 ">
            <div class="card-body">
                <div class="flex items-center">
                    {#if data.userSession}
                        <a href={`/profile/${data.userSession.username}`}>
                            <button tabindex="0" class="btn btn-ghost btn-circle avatar">
                                <h1 class=" text-base-content text-[1.75rem]">
                                    {data.userSession.username.charAt(0).toUpperCase()}
                                </h1>
                            </button>
                        </a>
                    {:else}
                        <button tabindex="0" class="btn btn-ghost btn-square btn-sm avatar" on:click={openModal}>
                            <ProfileIcon class="inline-block w-6 h-6 stroke-current" />
                        </button>
                    {/if}
                    <input
                        placeholder="What's going on?"
                        class="input input-bordered w-full "
                    />
                </div>
                <div class="card-actions justify-end">
                    <button class="btn btn-sm btn-primary">Post</button>
                </div>
            </div>
        </div>
	</div>
</div>
