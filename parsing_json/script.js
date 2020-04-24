import Shakespeare from './data/shakespeare.js'

let quotes = document.querySelector('#quotes')
let inp = document.querySelector('#search')


const showQuote = (quote, div) => {
    let article = document.createElement('article')
    let p = document.createElement('p')
    p.innerHTML = quote
    article.appendChild(p)
    div.appendChild(article)
}

// showQuote(Shakespeare.phrases[3], quotes)
// showQuote(Shakespeare.phrases[10], quotes)
// showQuote(Shakespeare.phrases[18], quotes)

const filterQuotes = () => {
    console.log(inp.value)
    let filtered = Shakespeare.phrases.filter(
        quote => quote.includes(inp.value)
    )
    quotes.innerHTML = ''
    filtered.map( quote => showQuote(quote, quotes))
}

inp.addEventListener('input', filterQuotes)

Shakespeare.phrases.map( 
    quote => showQuote(quote, quotes)
)

