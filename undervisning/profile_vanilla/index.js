let name = document.querySelector('#name')
let email = document.querySelector('#email')
let submit = document.querySelector('#submit')
let form = document.querySelector('#form')

// name.addEventListener('input', nameInput)

// function nameInput() {
//     console.log(name.value)
// }

submit.addEventListener('click', okButton)

function okButton() {
    console.log(name.value, email.value)
    greet()
}

function greet() {
    form.innerHTML = ''
    form.innerHTML += '<h1>Hei på deg ' + name.value + ' !</h1>'
    form.innerHTML += '<p>Det var hyggelig!</p>'
    form.innerHTML += '<p>Om jeg forstår det korrekt, er navnet ditt ' + name.value + ' og eposten din er ' + email.value + ' </p>'

    const newOkButton = document.createElement('button')
    newOkButton.innerHTML = 'ok'
    newOkButton.addEventListener('click', function() {
        form.innerHTML = '<h1>Supert!</h1>'
    })
    form.appendChild(newOkButton)

    const newCancelButton = document.createElement('button')
    newCancelButton.innerHTML = 'cancel'
    newCancelButton.addEventListener('click', function(){
        form.innerHTML = ''
        form.appendChild(name)
        form.appendChild(email)
        form.appendChild(submit)

    })
}