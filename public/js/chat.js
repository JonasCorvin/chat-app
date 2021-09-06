const socket=io()

const messageForm=document.querySelector('#messageForm')
const messageFormInput=messageForm.querySelector('input')
const sendButton=messageForm.querySelector('button')
const messagess=document.querySelector('#messages')
//template
const messageTemplate=document.querySelector('#messageTemplate').innerHTML
const locationTemplate=document.querySelector('#locationTemplate').innerHTML
const sidebar=document.querySelector('#sidebar').innerHTML

const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoscroll = () => {

    const $newMessage = messagess.lastElementChild

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = messagess.offsetHeight

    const containerHeight = messagess.scrollHeight

    const scrollOffset = messagess.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        messagess.scrollTop = messagess.scrollHeight
    }
}

socket.on('message',(message)=>{
    // console.log(message)
    const html=Mustache.render(messageTemplate,{
        username:message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm A')
    })
    messagess.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage',(message)=>{
    const html=Mustache.render(locationTemplate,{
        username:message.username, 
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm A')
    })
    messagess.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebar,{
        room,users
    })
    document.querySelector('#sidebar2').innerHTML=html
})

document.querySelector('#messageForm').addEventListener('submit',(e)=>{
    e.preventDefault()
    const message=e.target.elements.message.value

    socket.emit('sendMessage',message,(error)=>{
        messageFormInput.value=''
        messageFormInput.focus()

        if(error){
            return console.log(error)
        }       

        console.log("Message was delivered.")
    })
})

document.querySelector('#location').addEventListener('click',()=>{
    if(!navigator.geolocation)
    return alert('Geolocation is not supported on your browser.')
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation',{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        },()=>{
            console.log('Location shared')
        })
    })
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})
// socket.on('countUpdated',(count)=>{
//     console.log("count updated.",count)
// })
// document.querySelector('#incr').addEventListener('click',()=>{
//     console.log('Clicked.')
//     socket.emit('increment')

// })