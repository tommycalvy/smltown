<script lang="ts">
    import type { UiNodeInputAttributes, UiText } from '@ory/kratos-client';
    import Messages from "./messages.svelte";
    export let attributes: UiNodeInputAttributes;
    export let messages: Array<UiText> | undefined;
    export let label: string;
</script>

<div>
    <button
        type="submit"
        name={'auth_' + attributes.name}
        value={attributes.value}
        disabled={attributes.disabled}
        for={}
        class=""
    >{label}</button>
    {#if messages}
        <Messages {messages} />
    {/if}
</div>