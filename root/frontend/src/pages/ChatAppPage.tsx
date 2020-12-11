import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Route, Switch } from 'react-router';
import { io, Socket } from 'socket.io-client';
import styled from 'styled-components';
import { Chat } from '../components/Chat';
import { JoinUserPage } from './JoinUserPage';
import { MessageInput } from '../components/MessageInput';
import { addMessage, setRoom, getRoomStatus, getRoomId, addUser, removeUser } from '../features/roomSlice';
import { setUserName, setSocketStatus, setUser, getUserName, getUserId, getSocketStatus } from '../features/userSlice';
import { useAppDispatch, AppDispatch } from '../store';
import {  ROOM_STATUS, SOCKET_STATUS, UserPublic, UserData, UserLocalStorage, Message, CreateUserRequest } from '../types';
import { UsersList } from '../components/UsersList';
import { stringify } from 'querystring';

const ENDPOINT = "http://localhost:8080";

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
  text-align: center;
  grid-column-start: 1;
  grid-column-end: 3;
`

const UsersAside = styled.div`
  grid-row-start: 2;
  grid-row-end: 4;
`

const ChatCell = styled.div`
`

const MessageInputCell = styled.div`
`

interface ChatAppPageParams {
  roomIdRequired: string | null;
}


export const ChatAppPage: React.FC<ChatAppPageParams> = ({ roomIdRequired }) => {

  const roomId = useSelector(getRoomId());
  const userName = useSelector(getUserName());
  const socketStatus = useSelector(getSocketStatus());

  const socketRef = useRef<Socket | null>(null);
  const userLocalStorageRef = useRef<string | null>(localStorage.getItem('userData'))

  const dispatch = useAppDispatch();

  useEffect(() => {
    
    if (!socketRef.current) {
      socketRef.current = io(ENDPOINT, {transports: ['websocket', 'polling', 'flashsocket']});
    }

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('client connected');

      // if don't have user data in local storage then 
      // asking server to create new user
      // and if required an existing room (joined by the link)
      // then creating a new room
      if (userLocalStorageRef.current === null) {
        if (userName) {
          const userCreateRequest: CreateUserRequest = {name: userName, roomId: roomIdRequired};
          console.log('requested creating new user');
          socket.emit('create user', userCreateRequest);
        }
      }
      // if have user data in local storge then just 
      // joining as existing user to the last used room
      else {
        const userLocalStorageObj: UserLocalStorage = JSON.parse(userLocalStorageRef.current);
        socket.emit('auth user', userLocalStorageObj);
      }

      dispatch(setSocketStatus(SOCKET_STATUS.CONNECTED));
    });
  
    socket.on('user data',  (userInitial: UserData) => {
      console.log('user data is ', userInitial);
      const userLocalStorageObj: UserLocalStorage = {userId: userInitial._id, roomId: userInitial.room._id};
      localStorage.setItem('userData', JSON.stringify(userLocalStorageObj));
      dispatch(setRoom(
        {
          status: ROOM_STATUS.CONNECTED,
          id: userInitial.room._id, 
          messages: userInitial.room.messages, 
          users: userInitial.room.users
        }
      ));
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
      dispatch(setSocketStatus(SOCKET_STATUS.DISCONNECTED));
    });
  
    socket.on("FromAPI", (data: any) => {
      console.log(data);
    });
  }, [socketRef]);

  if (socketStatus === SOCKET_STATUS.DISCONNECTED) {
    return <h1>No connection</h1>
  }

  return (
    <AppContainer>
      <Header>
        {roomId && 
          <p>Your room link is {window.location.origin}/?roomId={roomId}</p>
        } 
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