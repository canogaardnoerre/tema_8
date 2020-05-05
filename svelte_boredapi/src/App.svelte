<script>

import Activity from './components/Activity.svelte'

let activity = {}
let show = false
let type = 'recreational'

const getActivity = () => {
	fetch('https://www.boredapi.com/api/activity?type=' + type)
		.then( res => res.json() )
			.then( json =>  {
				activity = json 
				show = true
			})
}

</script>

<main>

<button on:click={getActivity}>hit me</button>

<input type="text" bind:value={type}>

{#if show}
	<Activity {activity}/>
{:else}
	 <h2>hit me</h2>
{/if}

</main>

<style>

	main {
		height: 100vh;
		display: grid;
		place-items: center;
		text-align: center;
		position: relative;
		
	}

	button {
		width: 4rem;
		height: 4rem;
		position: absolute;
		top: 2rem;
		background-color: black;
		color: white;
		border-radius: 50%;
	}

	

	

</style>