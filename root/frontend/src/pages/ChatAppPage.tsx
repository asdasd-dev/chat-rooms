import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import styled from 'styled-components';
import { Chat } from '../components/Chat';
import { MessageInput } from '../components/MessageInput';
import { addMessage, setRoom, getRoomId, addUser, removeUser, disconnectRoom } from '../features/roomSlice';
import { setSocketStatus, setUser, getUserName, getSocketStatus, disconnectUser } from '../features/userSlice';
import { useAppDispatch } from '../store';
import {  ROOM_STATUS, SOCKET_STATUS, UserPublic, UserData, Message } from '../types';
import { UsersList } from '../components/UsersList';

const ENDPOINT = "http://localhost:8080/";

const AppContainer = styled.div`
  height: 100vh;
  overflow: hidden;
  display: grid;
  background-color: #393e46;
  grid-template-columns: minmax(200px, 300px) minmax(300px, auto);
  grid-auto-rows: 50px 1fr 100px;

  & > * {
    border-top: 1px solid #232931;
    border-right: 1px solid #232931;
    border-collapse: collapse;
  }
`

const Header = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-flow: row nowrap;
  grid-column-start: 1;
  grid-column-end: 3;
`

const UsersAside = styled.div`
  grid-row-start: 2;
  grid-row-end: 4;
`

const MessageInputCell = styled.div`
`

const saveUserDataToLocalStorage = (userId: string, roomId: string) => {
  localStorage.setItem("userId", userId);
  localStorage.setItem("roomId", roomId);
}

const getUserDataFromLocalStorage = () => {
  return {
    userId: localStorage.getItem("userId"),
    roomId: localStorage.getItem("roomId")
  }
}


export const ChatAppPage: React.FC = () => {

  const roomId = useSelector(getRoomId());
  const userName = useSelector(getUserName());
  const socketStatus = useSelector(getSocketStatus());

  const socketRef = useRef<Socket | null>(null);

  const dispatch = useAppDispatch();

  useEffect(() => {

    const userLocalStorageData = getUserDataFromLocalStorage();

    const authQuery: {name?:string, roomId?: string, userId?: string} = {};

    if (userName) {
      authQuery.name = userName;
    }
    if (userLocalStorageData.roomId) {
      authQuery.roomId = userLocalStorageData.roomId;
    }
    else if (roomId) {
      authQuery.roomId = roomId;
    }
    if (userLocalStorageData.userId) {
      authQuery.userId = userLocalStorageData.userId;
    }

    console.log(userLocalStorageData);
    
    if (!socketRef.current) {
      socketRef.current = io(ENDPOINT, {
        transports: ['websocket', 'polling', 'flashsocket'],
        query: authQuery
      })
    }

    let socket = socketRef.current;

    console.log('socket: ', socket);

    socket.on('connect', () => {
      console.log('client connected');
      dispatch(setSocketStatus(SOCKET_STATUS.CONNECTED));
    });
  
    socket.on('user data',  (userInitial: UserData) => {
      console.log('user data is ', userInitial);
      saveUserDataToLocalStorage(userInitial._id, userInitial.room._id);
      dispatch(setRoom({
          status: ROOM_STATUS.CONNECTED,
          id: userInitial.room._id, 
          messages: userInitial.room.messages, 
          users: userInitial.room.users
        }));
      dispatch(setUser({id: userInitial._id, name: userInitial.name}))
      console.log('set user and room');
    })
  
    socket.on('chat message', (message: Message) => {
      console.log('got message: ', message);
      dispatch(addMessage({user: message.user, date: message.date, content: message.content}));
    })

    socket.on('chat join', (user: UserPublic ) => {
      console.log('got chat join', user);
      dispatch(addUser(user));
    })

    socket.on('chat leave', (user: UserPublic) => {
      console.log('user left room: ' + user._id);
      dispatch(removeUser(user));
    })
  
    socket.on('disconnect', () => {
      console.log('client disconnected');
      dispatch(disconnectUser());
      dispatch(disconnectRoom());
    });

    return () => {socketRef.current?.disconnect()}
  }, []);

  const handleDisconnectClick = (e: React.MouseEvent) => {
    localStorage.removeItem('userId');
    localStorage.removeItem('roomId');
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  }

  if (socketStatus === SOCKET_STATUS.DISCONNECTED) {
    return <h1>Connecting to the server</h1>
  }

  return (
    <AppContainer>
      <Header>
          {roomId && 
            <p>Your room link is {window.location.origin}/?roomId={roomId}</p>
          } 
          <button onClick={handleDisconnectClick}>disconnect</button>
      </Header>
      <UsersAside>
        <UsersList />
      </UsersAside>
      <Chat />
      <MessageInputCell>
        <MessageInput socket={socketRef.current}/>
      </MessageInputCell>
    </AppContainer>
  );
}