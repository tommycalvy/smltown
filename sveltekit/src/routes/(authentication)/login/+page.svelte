<script lang="ts">
    import Messages from "$lib/components/auth/messages.svelte";
    import { isUiNodeInputAttributes } from "$lib/utils";
	import type { PageServerData } from "./$types";

    export let data: PageServerData
</script>


<div class="flex justify-center items-end gap-2 py-4">
    <h1 class=" text-2xl font-bold">
        Log in to <span class="font-logo text-3xl text-sky-500">SMLTOWN</span>
    </h1>
</div>
<form action={data.ui.action} method="POST" enctype="application/x-www-form-urlencoded">
    {#if data.ui.messages}
        <Messages messages={data.ui.messages} />
    {/if}
    <div class="form-control w-full">
        {#each data.ui.nodes as { attributes, messages }}
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
                            required
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
                        required
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
                        name={'auth_' + attributes.name}
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