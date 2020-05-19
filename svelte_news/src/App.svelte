<script>
	
	const api_key = 'ec402968fda3410789b33caf918ce5ba'
	let q = ''
	let article

	const getNews = () => {
	fetch(`http://newsapi.org/v2/everything?q=${q}&apiKey=${api_key}`)
		.then( res => res.json() )
			.then( json =>  {
				console.log(json.articles[0])
				article = json.articles[0]
			})
	}

// Object = Json

</script>

<main>
	<header>
		<input type="text" bind:value={q} placeholder="search">
		<button on:click={getNews}>ok</button>
	</header>

	{#if article }
		<a href="{article.article}">
			<div class="article">
				<h1>{article.title}</h1>
				<p>{article.description}</p>
			</div>
		</a>
	{:else}
		<h2>Loading article ...</h2>
	{/if}

</main>



<style>
	/* :global(*) {

	} */

	main {
		display: grid;
		place-items: center;
		height: 100%;
	}

	header {
		position: absolute;
		top: 2rem;
		width: 100%;
		display: grid;
		padding: 0 20vw 0 20vw;

	}
	
	.article {
		height: 50vh;
		width: 60vw;
		display: grid;
		place-items: center;
		background-color: lightgray;
		padding: 2rem;
	}

</style>