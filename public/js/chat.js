const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $send = document.querySelector('#messageinput')
const $location = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

socket.on("message", (message, username) => {
    console.log(message)

    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a'),
        username
    })
    $messages.insertAdjacentHTML('beforeend',html)
})

socket.on("locationMessage", (url, username) => {
    console.log(url)
    const html = Mustache.render(locationTemplate, {
        url: url.text,
        createdAt: moment(url.createdAt).format('h:mm a'),
        username
    })
    $messages.insertAdjacentHTML('beforeend', html)

})

socket.on("roomData", ({users, room}) => {
    console.log(users)
    const html = Mustache.render(sidebarTemplate, {
        users,
        room
    })

    document.querySelector('#sidebar').innerHTML = html
})

socket.emit("join", {username, room}, (error) => {
    if(error){
        alert(error)
        location.href = '/'
    }

    console.log('User joined successfully')
})


$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageForm.setAttribute('disabled', 'disabled')
    const message = $send.value
    socket.emit('sendMessage', message, (error) => {

        $messageForm.removeAttribute('disabled')
        $send.value = ''
        $send.focus()

        if(error) {
            return console.log(error)
        }

        
        console.log('message delivered!')
    })
})

$location.addEventListener('click', () => {
    
    
    if(!navigator.geolocation){
        console.log('unable to share location!')
        alert('Geolocation is not supported by your browser')
        return
    }
    
    $location.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $location.removeAttribute('disabled')
            console.log('Location shared')
        })
    })

})