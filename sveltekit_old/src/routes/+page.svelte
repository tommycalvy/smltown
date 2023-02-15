<script lang="ts">
    import type { PageServerData } from "./$types";
    export let data: PageServerData;

</script>



<section>
	
	<br />
	<br />

	{#if data.user}
		<h1>Hello {data.user.name}!</h1>
	{:else}
		<a href="/login"><button>Log In</button></a>
		<p>or</p>
		<a href="/registration"><button>Sign Up</button></a>
	{/if}
	
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
        text-align: center;
	}

	h1 {
		width: 100%;
	}

	.crud-service {
		display: flex;
		justify-content: space-around;
	}

	.create-profile {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.radio-field {
		display: flex;
		justify-content: center;
		column-gap: 1rem;
	}

	.radio-option {
		display: flex;
		flex-direction: column;
	}
	/*
	.user-circle {
		margin-top: 2rem;
		display: flex;
		justify-content: center;
		flex-direction: column;
		width: 3rem;
		height: 3rem;
		border-radius: 50%;
	}


	.user-circle span {
		text-align: center;
		color: var(--pure-white);
		font-size: large;
	}
	*/
</style>