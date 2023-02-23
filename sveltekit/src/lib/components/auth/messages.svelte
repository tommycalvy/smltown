<script lang="ts">
	import type { UiText } from '@ory/kratos-client';
	export let messages: UiText[];
</script>

{#each messages as { id, text, type }}
	{#if type === 'error'}
		<div class="flex w-full bg-error">
			<p class="text-error-content" data-testid="ui/message/{id}">{text}</p>
		</div>
	{/if}
	{#if type === 'info'}
		<div class="flex w-full bg-info">
			<p class="bg-info-content" data-testid="ui/message/{id}">{text}</p>
		</div>
	{/if}
{/each}