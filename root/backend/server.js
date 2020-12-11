const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require('cors');

const index = require("./routes/index");

const app = express();
const server = http.createServer(app);

const dbConfig = require('./config/db.config');
const db = require('./models');
const Room = require("./models/room.model");
const User = require("./models/user.model");
const Message = require("./models/message.model");
const { use } = require("./routes/index");

db.mongoose.connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Successfully connect to MongoDB.');
})
.catch(err => {
  console.error('Connection error', err);
  process.exit();
})

const io = socketIo(server);

app.use(cors());

app.use(index);

io.on("connection", (socket) => {

  console.log(socket.id);
  let user = null;
  let room = null;

  socket.on('create user', async ({name, roomId}) => {
    try {
      user = new User({ name, socketIds: [socket.id] });
      
      if (roomId) {
        room = await Room.findOne({_id: roomId})
        room.users.push(user);
      } 
      else {
        room = new Room({ users: [user] });
      }

      user.room = room;
      
      await user.save();
      await room.save();
      await room
      .populate('users', 'name id')
      .populate({
        path: 'messages',
        populate: {
          path: 'user',
          model: 'User',
          select: 'name -_id'
        },
        select: '-_id'
      })
      .execPopulate();

        

      console.log('final user is ', user);
      console.log('final room is ', room);

      socket.join(room._id.toString());
      socket.room = room._id.toString();
      socket.emit('user data', user.toObject())
      socket.to(socket.room).emit('chat join', { name: user.name, _id: user._id} );
    }
    catch (err) {
      console.log('error creating user', err.message);
    }
  });

  socket.on('auth user', async ({userId}) => {
    try {
    console.log('auth user');
    
    user = await User.findOne({ _id: userId});
    room = await Room.findOne({ _id: user.room });

    user.socketIds.push(socket.id);
    await user.save();

    socket.join(room._id.toString());
    socket.room = room._id.toString();

    if (!room.users.includes(user._id)) {
      console.log('user not in room so adding it and notify room that he is joined' );
      room.users.push(user);
      await room.save();
      socket.to(socket.room).emit('chat join', { _id: user._id, name: user.name });
    }

    await user
      .populate({
        path: 'room',
        populate: [{
            path: 'users',
            select: 'name id'
          },
          {
            path: 'messages',
            populate: {
              path: 'user',
              select: 'name -_id'
            },
            select: 'content date user -_id'
          }]
      })
      .execPopulate();

    socket.emit('user data', user.toObject())
    }
    catch (err) {
      console.log('error auth user', err.message);
    } 
  });

  socket.on('chat message', async (message) => {
    try {
    const dbMessage = new Message({ user, content: message });
    await dbMessage.save();
    room.messages.push(dbMessage);
    await room.save();
    console.log('emit message to all users of room ', socket.room);
    io.in(socket.room).emit('chat message', {user: {name: user.name, _id: user._id}, date: dbMessage.date, content: dbMessage.content});
    } catch (err) {
      console.log('error handling message', err.message);
    }
  })

  socket.on("disconnect", async () => {
    try {
    user = await User.findOne({ _id: user._id });
    user.socketIds = user.socketIds.filter(socketId => socketId !== socket.id);
    await user.save();
    if (user.socketIds.length === 0) {
      room = await Room.findOne({ _id: user.room });
      const disconnectedUserIndex = room.users.findIndex(roomUser => roomUser._id.equals(user._id));
      if (disconnectedUserIndex !== -1) {
        room.users.splice(disconnectedUserIndex, 1);
      }
      await room.save();
      socket.to(socket.room).emit('chat leave', {name: user.name, _id: user._id})
    }
  } catch (err) {
    console.log('error disconnecting', err.message);
  }
  });
});

server.listen(8080, () => {
  console.log('listening on *:8080');
});