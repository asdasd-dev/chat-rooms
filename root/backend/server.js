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
const { mongoose } = require("./models");
const { ObjectID } = require("mongodb");

db.mongoose.connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false 
})
.then(() => {
  console.log('Successfully connect to MongoDB.');
})
.catch(err => {
  console.error('Connection error', err);
  process.exit();
})

app.use(cors());

app.use(index);

const io = socketIo(server);

// check user query and send his user and room actual data
// if everything ok
io.use(async (socket, next) => {
  try {
    console.log('middleware');
    let roomId = socket.handshake.query.roomId;
    let roomToken = socket.handshake.query.roomToken;
    let userId = socket.handshake.query.userId;
    let userToken = socket.handshake.query.userToken;
    let name = socket.handshake.query.name;

    let user, room;

    // find query provided room or create the new one
    if (roomId) {
      if (!ObjectID.isValid(roomId)) {
        console.log('Not valid room id')
        return next(new Error('Invalid room id'));
      }
      room = await Room.findOne({_id: mongoose.Types.ObjectId(roomId)});
      if (room.token !== roomToken) {
        console.log('Wrong room token provided');
        return next(new Error('Wrong room token'));
      }
      if (!room) {
        console.log('Room doesn\'t exist');
        return next(new Error('No such room'));
      }
    }
    else {
      room = new Room();
      await room.save();
    }

    // join socket to the found/created room and set
    // socket roomId field corresponding to the room's id
    socket.roomId = room._id.toString();
    socket.join(socket.roomId);

    // have userId provided by query => find him in database
    // and updating his sockets list
    // if he had no connected sockets before current join
    // then notify his room's users about new online user
    if (userId) {
      if (!ObjectID.isValid(userId)) {
        console.log('Not valid user id')
        return next(new Error('Invalid user id'));
      }
      user = await User.findOne({_id: mongoose.Types.ObjectId(userId)});
      if (!user) {
        console.log('User doesn\'t exist');
        return next(new Error('No such user'));
      }
      if (user.token !== userToken) {
        console.log('Wrong user token provided');
        return next(new Error('Wrong user token'));
      }
      user.socketIds.push(socket.id);
      await user.save();
      if (user.socketIds.length === 1) {
        room.users.push(user);
        await room.save();
        socket.to(socket.roomId).emit('chat join', { name: user.name, _id: user._id} );
      }
    }
    // when creating new user model notify all room members
    // about the new online user
    else {
      if (!name) {
        console.log('No name provided for creating user')
        return next(new Error('No name provided for creating user'));
      }
      user = new User({ name, room: room._id, socketIds: [socket.id] })
      await user.save();
      room.users.push(user);
      await room.save();
      socket.to(socket.roomId).emit('chat join', { name: user.name, _id: user._id} );
    }

    // populating user to send the initial data
    // to the client
    await user
        .populate({
          path: 'room',
          populate: [{
              path: 'users',
              select: 'name _id'
            },
            {
              path: 'messages',
              populate: {
                path: 'user',
                select: 'name _id'
              },
              select: 'content date user -_id'
            }]
        })
        .execPopulate();
    
    // set user-corresponding socket fields and
    // send object with actual data to the client
    socket.userId = user._id.toString();
    socket.userName = user.name;
    socket.emit('user data', user.toObject())

    return next();
  } catch (err) {
    console.log('Error middleware', err.message);
    console.log(err.stack);
  }
})

io.on("connection", (socket) => {

  console.log('connected user is ', socket.userId);
  console.log('user room is ', socket.roomId);

  socket.on('chat message', async (message) => {
    try {
      const dbMessage = new Message({ user: mongoose.Types.ObjectId(socket.userId), content: message });
      await dbMessage.save();
      await Room.findOneAndUpdate({_id: socket.roomId}, 
        { $push : {
            messages: dbMessage._id
          }
        }, { new: true });
      console.log(`emit message ${dbMessage.content} to all users of room ${socket.roomId}`);
      io.in(socket.roomId).emit('chat message', {user: {name: socket.userName, _id: socket.userId}, date: dbMessage.date, content: dbMessage.content});
    } catch (err) {
      console.log('error handling message', err.message);
    }
  })

  socket.on("disconnect", async () => {
    try {
      let user = await User.findOneAndUpdate({ _id: socket.userId },
        { $pull: {
            socketIds: socket.id
          }
        }, { new: true });
      // emit chat leave and update room users array
      // only if got disconnect from the last socket of the user 
      if (user.socketIds.length === 0) {
        let room = await Room.findOneAndUpdate({ _id: socket.roomId }, 
          { $pull: { 
              users: mongoose.Types.ObjectId(socket.userId)
            } 
          }, { new: true });
        console.log(`user ${socket.userId} is disconnected`);
        console.log(`current users in room ${socket.roomId}: [${room.users}]`);
        socket.to(socket.roomId).emit('chat leave', {name: user.name, _id: user._id})
      }
  } catch (err) {
    console.log('error disconnecting', err.message);
  }
  });
});

server.listen(8080, () => {
  console.log('listening on *:8080');
});