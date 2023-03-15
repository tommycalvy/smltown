<script lang="ts">
	import CreatePostButton from "$lib/components/create-post-button.svelte";
	import { page } from '$app/stores';
</script>

<div class="flex p-20 justify-around">
    <div class="flex flex-col">
        <CreatePostButton />
        {#if $page.form && $page.form.createUser}
            <p>{$page.form.createPost}</p>
        {/if}
    </div>
</div>
<div class="overflow-x-auto">
	<table class="table table-compact w-full">
		<thead>
			<tr>
				<th />
				<th>Name</th>
				<th>Job</th>
				<th>company</th>
				<th>location</th>
				<th>Last Login</th>
				<th>Favorite Color</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<th>1</th>
				<td>Cy Ganderton</td>
				<td>Quality Control Specialist</td>
				<td>Littel, Schaden and Vandervort</td>
				<td>Canada</td>
				<td>12/16/2020</td>
				<td>Blue</td>
			</tr>
			<tr>
				<th>2</th>
				<td>Hart Hagerty</td>
				<td>Desktop Support Technician</td>
				<td>Zemlak, Daniel and Leannon</td>
				<td>United States</td>
				<td>12/5/2020</td>
				<td>Purple</td>
			</tr>
			<tr>
				<th>3</th>
				<td>Brice Swyre</td>
				<td>Tax Accountant</td>
				<td>Carroll Group</td>
				<td>China</td>
				<td>8/15/2020</td>
				<td>Red</td>
			</tr>
		</tbody>
		<tfoot>
			<tr>
				<th />
				<th>Name</th>
				<th>Job</th>
				<th>company</th>
				<th>location</th>
				<th>Last Login</th>
				<th>Favorite Color</th>
			</tr>
		</tfoot>
	</table>
</div>
