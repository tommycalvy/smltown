<script lang="ts">
    import { page } from '$app/stores';
    import Header from "$lib/components/header/header.svelte";
    import type { LayoutServerData } from './$types';
    import '../app.css';
	import MoreOutlined from "$lib/components/icons/more-outlined.svelte";
	import ForefinderGolf from "$lib/components/icons/forefinder-golf.svelte";
	import MessageIcon from "$lib/components/icons/message-icon.svelte";
	import SmltownIcon from "$lib/components/icons/smltown-icon.svelte";

    export let data: LayoutServerData;

  </script>

<svelte:head>
    <title>{$page.data.pageTitle}</title>
</svelte:head>



{#if data.user}
    <Header user={data.user} logoutToken={data.logout_token} />
{/if}

<main>
    <div class="home">
        <a href="/">
            <SmltownIcon width={20} height={20} />
        </a>
    </div>
    <div class="local">

    </div>
    <nav>

    </nav>
    <div class="content">
        <slot />
    </div>
</main>

<style>
    main {
        display: grid;
        grid-template-columns: 25rem auto;
        grid-template-rows: 5.5rem auto;
        grid-template-areas:
			'home local'
			'nav content';
        height: 100vh;
        background-color: var(--color-background-accent-light);
        row-gap: 0.1rem;
    }

    .home {
        grid-area: home;
        display: flex;
        justify-content: center;
        align-items: center;
        padding-right: 1rem;
        background-color: var(--color-background-base-light);
    }

    nav {
		grid-area: nav;
		display: flex;
		flex-direction: column;
		justify-content: first;
        background-color: var(--color-background-nav-light);
	}

    .local {
		grid-area: local;
		display: flex;
		justify-content: center;
		align-items: center;
        background-color: var(--color-background-base-light);
	}

    .content {
        grid-area: content;
        background-color: var(--color-background-content-light);
    }

</style>