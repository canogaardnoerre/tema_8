console.log('I am here')

function square(tall, name) {
    return name + ', regnestykket ditt gir: ' + tall * tall
}

console.log( square(16, 'Per') )

const squareA = tall => tall * tall + ' er resultatet'

console.log(squareA(21))

const fler = (name1, name2) => 'Hei ' + name1 + ' og ' + name2

console.log(fler('Per', 'Ivar'))

setTimeout(() => document.querySelector('body').style.backgroundColor='tomato', 2000)

// function antallTegn (ord) {
//     return 'Dette ord har ' + ord.length + ' karakterer'
// }

const antallTegn = ord => 'Dette or har ' + ord.length + ' karakterer'

console.log(antallTegn('nikodemos'))

// Array's

let body = document.querySelector('body')

const tallene = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]

tallene.map( tall => {
    let newLi = document.createElement('li')
    newLi.innerHTML = tall
    body.appendChild(newLi)
})

const ordene = ['løver', 'giraffer', 'sebraer', 'krokodiller', 'elefanter', 'apekatter']

let str = ''

ordene.map( ord => {
    str += `<section>Det satt to ${ord} på et bord</section>`
})

body.innerHTML = str

// Eksempel

let books = []

fetch('https://www.googleapis.com/books/v1/volumes?q=hemingway')
    .then( response => response.json() )
    .then( json => {   
    console.log(json)
    books = json.items    
    str = ''    
    showBooks()
})

const showBooks = () => {
    body.innerHTML = ''
    books.map( book => {
        let sec = document.createElement('section')
        sec.innerHTML = book.volumeInfo.title
        if(book.volumeInfo.imageLinks){
            sec.style.backgroundImage = `url(${book.volumeInfo.imageLinks.thumbnail})`
        }
        body.appendChild(sec)
    }
    )
}