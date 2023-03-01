<script lang="ts">
    import type { PageServerData } from "./$types";
    export let data: PageServerData;
</script>

<div class="flex justify-center pt-10">
    <div class="flex flex-col justify-center prose items-center">
        {#if data.user}
            <h1>Hello {data.user.username}</h1>
            <p>You are logged in!</p>
        {:else}
            <h1>Welcome to SMLTOWN</h1>
            <p>Please log in or sign up!</p>
        {/if}
    </div>
</div>
    