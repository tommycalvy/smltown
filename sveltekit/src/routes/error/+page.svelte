<script lang="ts">
    import type { PageServerData } from "./$types";

    export let data: PageServerData;
</script>

<label class="modal-box">
    <div class="flex justify-center pt-10">
        <div class="flex flex-col justify-center prose items-center">
            <h1>Uh oh, something went wrong...</h1>
            <p>{data.message}</p>
        </div>
    </div>
</label>