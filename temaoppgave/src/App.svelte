<script>

	import {apikeys} from '44be8784988a4def8aada63319c511cb'

	let ingredients = []
	let recipe 

	$: console.log(ingredients.toString())
	const apikey = apikeys.spoonacular.api_key

	const getRecipes = () => {
		fetch(`https://api.spoonacular.com/recipes/findByIngredients?apiKey=${apikey}&ingredients=${ingredients}&number=1`)
			.then( res => res.json() )
			.then( json => recipe = json[0])
	}

	const addIngredients = (e) => {
		e.target.checked ? ingredients = [...ingredients, e.target.id] : ingredients.filter( i => i!= e.target.id )
	}


</script>

<header>
	
	<h3>Whats in your fridge?</h3>

	<label for="tomatoes">Tomatoes</label>
	<input id="+tomatoes" type="checkbox">

	<label for="lettuce">Lettuce</label>
	<input id="+lettuce" type="checkbox">

	<label for="pasta">Pasta</label>
	<input id="+pasta" type="checkbox">

	<hr>
	<button on:click={getRecipes}>Find recipes</button>
	<hr>

</header>

<main>
	
	{#if recipe}
		<h1>{recipe.title}</h1>
		<img src={recipe.image} alt={recipe.title}>
	{/if}

</main>

<style>

	header {
		height: 20vh;
		background-color: lightsalmon;
	}

	main {
		height: 80vh;
	}
	
</style>