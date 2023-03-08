<script lang="ts">
    import type { PageServerData } from "./$types";
    export let data: PageServerData;
</script>

<div class="flex justify-center flex-col items-center pt-10">
    <div class="flex flex-col justify-center prose items-center">
        {#if data.user}
            <h1>Hello {data.user.username}</h1>
            <p>You are logged in!</p>
        {:else}
            <h1>Welcome to SMLTOWN</h1>
            <p>Please log in or sign up!</p>
        {/if}
    </div>
    <div class="card w=[156] bg-base-100 shadow-xl my-6">
        <div class="card-body">
          <h2 class="card-title">Create Post</h2>
        </div>
      </div>
    <div class="card w=[156] bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Did anyone hear a loud explosion?</h2>
          <p>There is a bunch of police activity around the neighborhood as well.</p>
          <div class="card-actions justify-end">
            <button class="btn">Comments</button>
          </div>
        </div>
      </div>
</div>


    