<script>
	import ProfileIcon from '$lib/icons/profile-icon.svelte';
	import '../app.css';
	
</script>

<svelte:head>
	<title>SMLTOWN</title>
</svelte:head>

<input type="checkbox" id="modal-signup" class="modal-toggle" />
<div class="modal modal-bottom sm:modal-middle">
  <div class="modal-box">
    <h3 class="font-bold text-lg">Congratulations random Internet user!</h3>
    <p class="py-4">You've been selected for a chance to get one year of subscription to use Wikipedia for free!</p>
    <div class="modal-action">
      <label for="modal-signup" class="btn">Yay!</label>
    </div>
  </div>
</div>

<div class="bg-base-200 w-screen h-screen">
	<nav class="navbar bg-base-100 min-h-12">
		<div class="flex-1">
			<a href="/" class="btn btn-ghost btn-sm normal-case text-xl">daisyUI</a>
		</div>
		<div class="flex-none gap-2">
			
			<div class="dropdown dropdown-bottom">
				<input type="text" placeholder="Search" class="input input-sm input-bordered focus:border-primary hover:border-primary focus:outline-primary duration-75" />
				<ul
					
					class="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52"
				>
					<li>
						<a href="/profile" class="justify-between">
							Profile
							<span class="badge">New</span>
						</a>
					</li>
					<li><a href="/settings">Settings</a></li>
					<li><a href="/logout">Logout</a></li>
				</ul>
			</div>
			<label for="modal-signup" class="btn btn-primary btn-sm normal-case">Sign Up</label>
			<div class="dropdown dropdown-end">
				<label tabindex="0" class="btn btn-ghost btn-square btn-sm avatar duration-150 outline-none active:bg-opacity-30">
					<ProfileIcon class="inline-block w-6 h-6 stroke-current" />
				</label>
				<ul
					tabindex="0"
					class="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52"
				>
					<li>
						<a href="/profile" class="justify-between">
							Profile
							<span class="badge">New</span>
						</a>
					</li>
					<li><a href="/settings">Settings</a></li>
					<li><a href="/logout">Logout</a></li>
				</ul>
			</div>
		</div>
	</nav>
	<slot />
</div>
