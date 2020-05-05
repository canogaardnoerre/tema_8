<script>
    // Fetch data
    let synonyms = []
    export let words  

    $: if(words.length > 2) {
        fetch('https://api.datamuse.com/words?rel_rhy=' + words)
        .then( res => res.json() )
            .then( json => {
                console.log(json) 
                synonyms = json
            })
}

</script>

<section>
    
    <!-- <h2>Rhymes: {words}</h2> -->

    {#each synonyms as synonym}
        <div>
            <h5>{synonym.word}</h5>
             <p>{synonym.score}</p>
        </div>
       
    {:else}
        <p>Please type a word ...</p>
    {/each}

</section>

<style>

    section {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        transition: ease;
    }

    section > div, section > p {
        background-color: lightgray;
        display: grid;
        place-items: center;
        height: 100%;
        border-radius: 0.2rem;
    }

</style>