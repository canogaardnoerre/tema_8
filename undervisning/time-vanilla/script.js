import colors from './data/colors.js'

let main = document.querySelector('main')
let circle = document.querySelector('#circle')


let showAlarmButton = document.querySelector('#showAlarm')
let alarmDiv = document.querySelector('#alarm')

showAlarmButton.addEventListener('click', () => {
    alarmDiv.style.transform = 'translateX(0)'
})


let setAlarmButton = document.querySelector('#setAlarm')
let alarmSet = false
let alarmTime = {}
setAlarmButton.addEventListener('click', () => {
    let hours = document.querySelector('#hours').value
    let minutes = document.querySelector('#minutes').value
    alarmSet = true
    alarmDiv.innerHTML = 'Alarm set to: ' + hours + ': ' + minutes
    alarmTime.hours = hours
    alarmTime.minutes = minutes
})

let pos = 0

const time = () => { 
    let t = new Date()
    let hours = t.getHours()
    let minutes = t.getMinutes()
    let seconds = t.getSeconds()

    if(alarmTime.hours == hours && alarmTime.minutes == minutes) {
        circle.innerHTML = '<h1>ALARM</h1>'
        return
    }



    // sec = sec < 10 ? '0' + sec : sec

    // if(sec < 10) {
    //     sec = '0' + sec
    // }

    circle.innerHTML = `${hours}: ${minutes}: ${seconds}`
}





const setColor = () => {
    circle.style.backgroundColor = colors[pos].hex
    if(pos < colors.length -1){
        pos = pos + 1
    } else {
        pos = 0
    }
}

let timer = setInterval(time, 1000)
let timer2 = setInterval(setColor, 5000)


