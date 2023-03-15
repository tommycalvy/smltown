<script lang="ts">
	import type { UiContainer } from '@ory/kratos-client';
	import Messages from '$lib/components/auth/messages.svelte';
	import { isUiNodeInputAttributes } from '$lib/utils';
	import { loginModal } from "$lib/stores/login-modal";

	export let ui: UiContainer;
	export let open: boolean = false;

	loginModal.set(open);

</script>

<label for="modal-login" class="btn btn-sm">Log In</label>
<input type="checkbox" id="modal-login" class="modal-toggle" bind:checked={$loginModal}/>
<label for="modal-login" class="modal duration-0 bg-black bg-opacity-80">
	<label class="modal-box relative duration-0" for="">
		<div class=" modal-action absolute top-0 right-0 m-1">
			<label for="modal-login" class="btn btn-circle btn-sm btn-ghost">
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
		<div class="flex justify-center items-end gap-2 py-4">
			<h1 class=" text-2xl font-bold">
				Log in to <span class="font-logo text-3xl text-sky-500">SMLTOWN</span>
			</h1>
		</div>
		<form action={ui.action} method="POST" enctype="application/x-www-form-urlencoded">
			{#if ui.messages}
				<Messages messages={ui.messages} />
			{/if}
			<div class="form-control w-full">
				{#each ui.nodes as { attributes, messages }}
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
						{#if attributes.name === 'identifier'}
							<fieldset>
								<label class="label flex-col items-start">
									<span class="label-text py-1">Username</span>
									<input
										type={attributes.type}
										name={attributes.name}
										required={attributes.required}
										disabled={attributes.disabled}
										value={attributes.value}
										class="input input-bordered w-full mb-2"
									/>
								</label>
								{#if messages}
									<Messages {messages} />
								{/if}
							</fieldset>
						{/if}
						{#if attributes.name === 'password'}
							<label class="label flex-col items-start">
								<span class="label-text py-1">Password</span>
								<input
									type={attributes.type}
									name={attributes.name}
									required={attributes.required}
									disabled={attributes.disabled}
									class="input input-bordered w-full mb-2"
								/>
							</label>
							{#if messages}
								<Messages {messages} />
							{/if}
						{/if}
						{#if attributes.type === 'submit'}
							<button
								type={attributes.type}
								name="auth_method"
								value={attributes.value}
								disabled={attributes.disabled}
								class="btn btn-block btn-primary mt-6 mb-2">Log In</button
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
