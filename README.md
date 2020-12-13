# chat-rooms

Socket.io app for messaging with chat rooms

## Features

- After entering the name user is joining new chat room
- There can be several chat rooms at the same time
- User can copy link to the room and send it someone for joining his room
- User can send text messages to the room and all its users will see the message
- Users can see who sent the message to the room and when
- Users can see who is in the chat room right now

## Application run

### Pre-Installation
Before running app locally, you must run MongoDB server locally on port 27017:
- Install https://www.mongodb.com/try/download/community
- Run mongod from the terminal, for example, `"C:\Program Files\MongoDB\Server\4.4\bin\mongod.exe" --dbpath="c:\data\db"`
database name will be `chat_rooms_db`

### Installation

```bash
git clone https://github.com/asdasd-dev/chat-rooms.git
cd chat-rooms
npm run front-deps
npm run back-deps
npm start
```

After that server will be loaded on `localhost:8080` and client on `localhost:3000`
