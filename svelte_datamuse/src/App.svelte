<script>
	import Datamuse from './components/Datamuse.svelte'
	
	let words = ''
</script>

<main>
	<div class="inp">
		<input type="text" bind:value={words}>
	</div>
	
	<Datamuse {words}/>
</main>

<style>
	
	main {
		display: grid;
		grid-template-rows: 10vh 90vh;
		font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
		letter-spacing: 0.1rem;
	}

	.inp {
		display: grid;
		place-items: center;
	}

	input {
		width: 40vw;
		font-size: 1.2rem;
		outline: none;
		padding: .8rem;
		border-radius: 0.2rem;
	}

</style>