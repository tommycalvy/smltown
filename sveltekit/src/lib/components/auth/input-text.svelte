<script lang="ts">
	import type { UiNodeInputAttributes, UiText } from '@ory/kratos-client';
	import Messages from './messages.svelte';
	export let attributes: UiNodeInputAttributes;
	export let messages: Array<UiText> | undefined;
	export let label: string;
	export let value: string = '';
	export let type: string = 'text';
</script>

<fieldset>
	<label class="label">
		<span class="label-text">{label}</span>
	</label>
	<input
		{type}
		name={attributes.name}
		required={attributes.required}
		{value}
		disabled={attributes.disabled}
		placeholder=""
		class="input input-bordered w-full"
	/>
	{#if messages}
		<Messages {messages} />
	{/if}
</fieldset>
