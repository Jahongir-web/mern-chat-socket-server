const PORT = process.env.PORT || 8000

const io = require("socket.io")(PORT, {
  cors: {
    origin: "https://mern-chat-webstar.netlify.app/"
  }
})

let activeUsers = []

io.on('connection', (socket)=> {
  // add new user
  socket.on('new-user-add', (newUserId)=>{
    // if user is not added previously
    if(!activeUsers.some((user)=> user.userId === newUserId)){
      activeUsers.push({userId: newUserId, socketId: socket.id})
      console.log('New user Connected', activeUsers);
    }
    // send all active users to new user
    io.emit('get-users', activeUsers)
  })

  socket.on('disconnect', ()=> {
    // remove user from active users
    activeUsers = activeUsers.filter((user)=> user.socketId !== socket.id)
    console.log('User disconnected!');
    // send all active users to all users
    io.emit('get-users', activeUsers)
  })

  // send message to a specific user
  socket.on("send-message", (data)=> {
    const {receivedId} = data
    const user = activeUsers.find(user => user.userId === receivedId)
    if(user){
      io.to(user.socketId).emit('recieve-message', data)
    }
  })
})

