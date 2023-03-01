<script lang="ts">
	import type { UiContainer } from '@ory/kratos-client';
	import Messages from '$lib/components/auth/messages.svelte';
	import { isUiNodeInputAttributes } from '$lib/utils';

	export let ui: UiContainer;
</script>

<label for="modal-signup" class="btn btn-primary btn-sm">Sign Up</label>
<input type="checkbox" id="modal-signup" class="modal-toggle" />
<label for="modal-signup" class="modal duration-0 bg-black bg-opacity-80">
	<label class="modal-box relative duration-0" for="">
		<div class=" modal-action absolute top-0 right-0 m-1">
			<label for="modal-signup" class="btn btn-circle btn-sm btn-ghost">
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
				Sign up for <span class="font-logo text-3xl text-sky-500">SMLTOWN</span>
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
								type="hidden"
								value={attributes.value}
								required={attributes.required}
								disabled={attributes.disabled}
							/>
						{/if}
						{#if attributes.name === 'identifier'}
							<fieldset>
								<label class="label">
									<span class="label-text">Username</span>
								</label>
								<input
									type="text"
									name="identifier"
									required={attributes.required}
									disabled={attributes.disabled}
									class="input input-bordered w-full mb-2"
								/>
								{#if messages}
									<Messages {messages} />
								{/if}
							</fieldset>
						{/if}
						{#if attributes.name === 'password'}
							<label class="label">
								<span class="label-text">Password</span>
							</label>
							<input
								type="password"
								name="password"
								required={attributes.required}
								disabled={attributes.disabled}
								class="input input-bordered w-full mb-2"
							/>
							{#if messages}
								<Messages {messages} />
							{/if}
						{/if}
						{#if attributes.type === 'submit'}
							<button
								type="submit"
								name="auth_method"
								value={attributes.value}
								disabled={attributes.disabled}
								class="btn btn-block btn-primary mt-6 mb-2">Sign Up</button
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
