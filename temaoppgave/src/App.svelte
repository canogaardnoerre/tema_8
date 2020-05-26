<script>

	const apikey = '44be8784988a4def8aada63319c511cb'

	let ingredients = []
	let recipes = []
	$: console.log(ingredients.toString())
	
	const getRecipes = () => {
		fetch(`https://api.spoonacular.com/recipes/findByIngredients?apiKey=${apikey}&ingredients=${ingredients}&number=5`)
			.then(res=>res.json())
			.then(json => recipes=json)
	}
	
	const add = (item) => {
		if (!suggestions.includes(item)) {
			e.target.checked ? ingredients = [...ingredients, e.target.id] : ingredients.filter(i => i!= e.target.id)
		} else {
			suggestions = suggestions.filter( element => element!= item)
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

	const wholeRecipe = () => {
		fetch(` https://api.spoonacular.com/recipes/${id}/information`)
			.then( res => res.json() )
			.then( json => {
				
			})
	}
	
</script>

<header>
	<!-- <h2>What's in the fridge today? </h2> -->
	<input placeholder='Search for ingredients...' on:input={getIngredients} on:focus={ e => e.target.value = '' } bind:value={ingredient} />
	<button on:click={getRecipes}>FIND RECIPE</button>

	<div class="suggestions">	
		{#each suggestions as item}
			<div class="suggestion" on:click={()=>ingredients = [item.name, ...ingredients]}>{item.name}</div>
		{/each}
	</div>
</header>

<main>

	<!-- <img class="logo" src="./img/logo.png" alt="logo"> -->

	<div class="recipes">
		{#each recipes as recipe}
			<div class="recipe">
				<h1>{recipe.title}</h1>
				<img  src="{recipe.image}" alt="{recipe.title}">
				<button>VIEW WHOLE RECIPE</button>
			</div>
		{/each}
	</div>

	<div class="ingredients">
		{#each ingredients as item}
			<li>{item}</li>
			<div class="remove" 
				on:click={()=>add(item)}
				style={suggestions.includes(item) ? 'color:tomato' : 'color: blue'}> 
				<img src="./img/cross.png" alt="remove">
			</div>
		{/each}
	</div>
	
</main>

<style>

	:global(*) {
		box-sizing: border-box;
	}

	:global(body, html) {
		background-color: #E6E7D4;
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
		background-color: #E6E7D4;
		border: none;
	}

	button {
		width: 148px;
		background-color: tomato;
		color: #E6E7D4;
		font-weight: bold;
		border: none;
		transition: ease 0.2s;
	}

	button:hover {
		transform: scale(1.1);
	}
	.suggestions {
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
		color: white;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
		transition: ease 0.2s;
	}

	.suggestion:hover {
		transform: scale(1.1);
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
		height: 68vh;
		padding: 1rem;
		text-align: center;
		background-color: #CCD6A9;
		border-radius: 100px 1px 100px 1px;
		display: grid;
		place-items: center;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
		
	}
	.recipe img {
		border-radius: 100px 1px 100px 1px;
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
		gap: 1rem;
		padding: 1rem;
		border-radius: 1px 100px 1px 100px;
		background-color: #E9D095;
		color: white;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
		position: fixed;
		transition: ease 1s;
		overflow: scroll;
	}

	.ingredients li {
		padding: .5rem;
	}
	h1 {
		color: tomato;
		text-transform: uppercase;
		font-size: 1.6rem;
		margin: 2rem 0 1rem 0;
	}
	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
	
	
	