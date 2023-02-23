<script lang="ts">
	import type { UiContainer } from "@ory/kratos-client";


    
    export let ui: UiContainer;
</script>


<label for="modal-signup" class="btn btn-primary btn-sm">Sign Up</label>
<input type="checkbox" id="modal-signup" class="modal-toggle" />
<label for="modal-signup" class="modal duration-0 bg-opacity-80">
	<label class="modal-box relative duration-0" for="">
		<h3 class="text-lg font-bold">Congratulations random Internet user!</h3>
		<p class="py-4">
			You've been selected for a chance to get one year of subscription to use Wikipedia for free!
		</p>
		<div class="modal-action">
			<label for="modal-signup" class="btn">Yay!</label>
		</div>
	</label>
</label>
