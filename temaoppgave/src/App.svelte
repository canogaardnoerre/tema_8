<script>

	const apikey = '44be8784988a4def8aada63319c511cb'

	let ingredients = []
	let recipe
	$: console.log(ingredients.toString())
	
	const getRecipes = () => {
		fetch(`https://api.spoonacular.com/recipes/findByIngredients?apiKey=${apikey}&ingredients=${ingredients}&number=1`)
			.then(res=>res.json())
			.then(json => recipe=json[0])
	}
	
	const add = (e) => {
		e.target.checked ? ingredients = [...ingredients, e.target.id] : ingredients.filter(i => i!= e.target.id)
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

	// let id = []
	// let wholeRecipe 

	// const showRecipe = () => {
	// 	fetch(`https://api.spoonacular.com/recipes/${id}/ingredientWidget.json`)
	// 	.then( res => res.json())
	// 	.then( json =>  {
	// 		console.log(json)
	// 		wholeRecipe = json.id[0].ingredients.amaount.metric.unit 
	// 		wholeRecipe = json.id[0].ingredients.amaount.metric.value 
	// 	})
	// }
	
</script>

<header>
	<!-- <h2>What's in the fridge today? </h2> -->
	<input placeholder='Search for ingredients' on:input={getIngredients} on:focus={ e => e.target.value = '' } bind:value={ingredient} />
	<button on:click={getRecipes}>finn oppskrift</button>

	<div class="suggestions">	
		{#each suggestions as item}
			<div class="suggestion" on:click={()=>ingredients = [item.name, ...ingredients]}>{item.name}</div>
		{/each}
	</div>
</header>

<main>

	<div class="recipes">
		{#if recipe}
			<img  src="{recipe.image}" alt="{recipe.title}">
			<h1>{recipe.title}</h1>
			<!-- <button bind-value={wholeRecipe.id} on:click{showRecipe}>Reed more</button> -->
		{/if}
	</div>

	<div class="ingredients">	
		{#each ingredients as item}
			<li>{item}</li>
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
		height: 20vh;
		margin: 0 1rem 0 1rem ;
		background-color: #CCD6A9;
		border-radius: 0 0 100px 100px;
	}

	input, button {
		padding: 1rem;
		margin-bottom: 1rem;
		border-radius: 100px;
		outline: none;
	}

	input {
		margin-right: 1rem;
		width: 49vw;
		background-color: #E6E7D4;
		border: none;
	}

	button {
		width: 148px;
		background-color: tomato;
		color: #E6E7D4;
		font-weight: bold;
		border: none;
	}
	.suggestions {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
		gap: 1rem;
	
	}
	.suggestion {
		display: grid;
		place-items: center;
		padding: .5rem; 
		border-radius: 100px;
		background-color: #97A885;
		color: white;
	}
	main {
		height: 75vh;
		text-align: left;
		padding: 1em;
		max-width: 100vw;
		margin: 0 auto;
		display: grid;
		grid-template-columns: 73vw 25vw;
	}

	.recipes {
		margin: 1rem;
		background-color: #CCD6A9;
		border-radius: 100px 1px 100px 1px;
		display: grid;
		grid-template-columns: auto auto;
		place-items: contain;
	}

	.recipes img {
		border-radius: 100px 1px 1px 1px;
		object-fit: cover;
		margin: 4rem;

	}
	.ingredients {
		margin: 1rem;
		list-style-type: none;
		display: grid;
		place-content: center;
		padding: 1rem;
		border-radius: 1px 100px 1px 100px;
		background-color: #E9D095;
		color: white;
	}

	.ingredients li {
		padding: .5rem;
	}
	h1 {
		color: tomato;
		text-transform: uppercase;
		font-size: 2rem;
		margin-top: 4rem;
	}
	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
	
	
	