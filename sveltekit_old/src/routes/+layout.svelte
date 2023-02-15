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
    <div class="topbar">
        <a href="/">
            <SmltownIcon width={20} height={20} />
        </a>
        <div>
            <a href="/login"><button class="button-login">Log In</button></a>
            <a href="/registration"><button class="button-signup">Sign Up</button></a>
        </div>
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
			'topbar topbar'
			'nav content';
        height: 100vh;
        background-color: var(--color-background-accent-light);
        row-gap: 0.1rem;
    }

    nav {
		grid-area: nav;
		display: flex;
		flex-direction: column;
		justify-content: first;
        background-color: var(--color-background-nav-light);
	}

    .topbar {
        grid-area: topbar;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 1rem;
        background-color: var(--color-background-base-light);
    }

    .content {
        grid-area: content;
        background-color: var(--color-background-content-light);
    }

    button {
        height: 3rem;
        padding: 0 1rem;
        border: none;
        border-radius: 0.3rem;
        color: white;
        align-items: center;
        cursor: pointer;
        user-select: none;
        font-weight: 700;
        transition: background-color 0.2s;
		transition-timing-function: ease;
    }

    .button-login {
        background-color: var(--color-accent);
    }

    .button-signup {
        background-color: var(--color-main);
    }

</style>