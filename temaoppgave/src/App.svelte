<script>

	import Description from './Description.svelte'
	import { fade } from 'svelte/transition';
	
	let showDescription = true

	const apikey = '44be8784988a4def8aada63319c511cb'

	let ingredients = []
	let recipes = []
	$: console.log(ingredients.toString())
	
	const getRecipes = () => {
		fetch(`https://api.spoonacular.com/recipes/findByIngredients?apiKey=${apikey}&ingredients=${ingredients}&number=5`)
			.then(res=>res.json())
			.then(json => recipes=json)
			console.log(json)
	}
	
	const add = (item) => {
		if (!ingredients.includes(item)) {
			ingredients = [...ingredients, item]
		} else {
			ingredients = ingredients.filter( element => element!= item)
		}
	}

	let ingredient = ''
	let suggestions = []
	
	const getIngredients = () => {
		if(ingredient.length > 1){
			fetch(`https://api.spoonacular.com/food/ingredients/autocomplete?apiKey=${apikey}&query=${ingredient}&number=5`)
				.then( res => res.json() )
				.then( json => {
					console.log(json)
					suggestions = json
			})
		}
	}

	let showRecipe = false
	let theRecipe 
	
	const show = recipe => {
		showRecipe = true
		theRecipe = recipe
	}
	
</script>

<header>
	<input placeholder='Search for ingredients...' on:input={getIngredients} on:focus={ e => e.target.value = '' } bind:value={ingredient} />
	<button on:click={getRecipes}>FIND RECIPE</button>
	<button id="desc" on:click="{ () => showDescription = true}">?</button>

	<div class="suggestions">	
		{#each suggestions as item}
			<div class="suggestion" on:click={()=>ingredients = [item.name, ...ingredients]}>{item.name}</div>
		{/each}
	</div>
</header>

<main>
	<img class="logo" src="../img/logo.png" alt="logo">

	{#if showDescription}
		<Description on:close="{ () => showDescription = false }" >
			<h2 slot="x">What's in your fridge?</h2>
			<ol slot="list" class="descriptions">
				<li>Search for ingrediences based on what is in your fridge</li>
				<li>Click at the wanted ingrediences and add them to your list</li>
				<li>Click the button "FIND RECIPE" to see reciepes based on your list of ingrediences</li>
				<li>Click at the wanted recipe to find out what ingrediences you are missing</li>
			</ol>
		</Description>
	{/if}

	{#if !showRecipe}
		<div class="recipes">
			{#each recipes as recipe}
				<div class="recipe" transition:fade>
					<h1>{recipe.title}</h1>
					<img  src="{recipe.image}" alt="{recipe.title}">
					<button on:click={() => show (recipe) }>VIEW MISSED INGREDIENTS</button>
				</div>
			{/each}
		</div>
	{:else}
		<div class="recipe2" transition:fade>
			<h1>{theRecipe.title}</h1>
			<p>Missed ingredients:</p>
			{#each theRecipe.missedIngredients as missed}
				<li>{missed.name}</li>
			{/each}
			<button on:click={() => showRecipe = false }>CLOSE</button>
		</div>
	{/if}

	<div class="ingredients">
		{#each ingredients as item}
			<li>{item}</li>
			<div class="remove" 
				on:click={()=>add(item)}
				style={suggestions.includes(item) ? 'height:2rem' : 'height: 1rem'}> 
			<img src="../img/cross.png" alt="close-sign">
			</div>

		{/each}
	</div>
</main>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');

	:global(*) {
		box-sizing: border-box;
	}

	:global(body, html) {
		background-color: #E6E7D4;
		font-family: 'Raleway', sans-serif;
	}
	
	header {
		padding: 1rem 4rem 1rem 4rem;
		height: 25vh;
		width: 96vw;
		left: 2vw;
		background-color: #CCD6A9;
		border-radius: 0 0 100px 100px;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
		position: fixed;
		z-index: 10;
	}

	input, button {
		padding: 1rem;
		margin-top: 1.2rem;
		margin-bottom: 1rem;
		border-radius: 100px;
		outline: none;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
	}

	input {
		margin-right: 1rem;
		width: 50vw;
		color: #676E5E;
		background-color: #E6E7D4;
		border: none;
	}

	button {
		margin-right: 1rem;
		width: 148px;
		background-color: #C14C3B;
		color: #E6E7D4;
		font-weight: bold;
		border: none;
		transition: ease 0.2s;
	}

	#desc {
		width: 50px;
	}

	button:hover {
		transform: scale(1.05);
	}

	.logo {
		height: 230px;
		position: fixed;
		z-index: 15;
		right: 6rem;
		top: 2rem;
	}

	.suggestions {
		margin-top: .5rem;
		width: 63vw;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
		gap: 1rem;
	}

	.suggestion {
		display: grid;
		place-items: center;
		padding: .5rem; 
		text-align: center;
		border-radius: 100px;
		background-color: #97A885;
		color: #E6E7D4;
		font-size: .8rem;
		letter-spacing: .1rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
		transition: ease 0.2s;
	}

	.suggestion:hover {
		transform: scale(1.05);
	}

	main {
		min-height: 100vh;
		text-align: left;
		padding: 1em;
		max-width: 100vw;
		margin: 0 auto;
		display: grid;
		grid-template-columns: 73vw 25vw;
	}

	.recipes {
		margin: 2rem;
		display: grid;
		place-items: center;
		gap: 2rem;
		position: absolute;
		top: 25vh;
		left: 0;
		overflow: scroll;
		z-index: 5;
		scroll-behavior: smooth;
	}
	
	.recipe {
		width: 70vw;
		min-height: 68vh;
		padding: 1rem;
		text-align: center;
		background-color: #CCD6A9;
		border-radius: 100px 1px 100px 1px;
		display: grid;
		place-items: center;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
	}

	.recipe2 {
		width: 70vw;
		min-height: 68vh;
		padding: 1rem;
		margin: 2rem;
		text-align: center;
		background-color: #CCD6A9; 
		display: grid;
		place-items: center;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
		border-radius: 100px 1px 100px 1px;
		position: absolute;
		top: 25vh;
		left: 0;
		overflow: scroll;
		z-index: 5;
		scroll-behavior: smooth;
		letter-spacing: .1rem;
		color: #676E5E;
	}

	.recipe2 li {
		list-style-type: none;
	}

	.recipe img {
		border-radius: 100px 1px 100px 1px;
		height: 200px;
		object-fit: cover;
		margin: 1rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
	}

	.recipe button {
		margin-bottom: 2rem;
	}
	
	.ingredients {
		min-height: 68vh;
		max-height: 68vh;
		width: 22vw;
		right: 0;
		top: 25vh;
		margin: 2rem;
		padding: 4rem;
		list-style-type: none;
		display: grid;
		grid-template-columns: auto auto;
		place-content: center;
		gap: 2rem;
		padding: 1rem;
		border-radius: 1px 100px 1px 100px;
		background-color: #E9D095;
		color: #676E5E;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
		position: fixed;
		transition: ease .2s;
		overflow: scroll;
	}
	
	.ingredients li {
		padding: .2rem;
		transition: ease .2s;
		font-size: 1.2rem;
		letter-spacing: .1rem;
	}

	.remove {
		height: 1rem;
		padding-top: .5rem;
	}

	.remove:hover {
		transform: scale(1.05);	
	}
	
	h1 {
		color: #C14C3B;
		text-transform: uppercase;
		font-size: 1.6rem;
		margin: 2rem 0 1rem 0;
		letter-spacing: .2rem;
	}

	h2 {
		letter-spacing: .2rem;
		margin: 2rem 0 1rem 0;
	}

	p {
		font-size: 1.2rem;
		font-weight: bold;	
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
	
	
	