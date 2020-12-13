import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import styled from 'styled-components';
import { Chat } from '../components/Chat';
import { MessageInput } from '../components/MessageInput';
import { addMessage, setRoom, getRoomId, addUser, removeUser, disconnectRoom, getRoomToken } from '../features/roomSlice';
import { setSocketStatus, setUser, getUserName, getSocketStatus, disconnectUser, getUserId, getUserToken } from '../features/userSlice';
import { useAppDispatch } from '../store';
import {  ROOM_STATUS, SOCKET_STATUS, UserPublic, UserData, Message } from '../types';
import { UsersList } from '../components/UsersList';
import { ReactComponent as CopyIcon } from '../Icons/Copy.svg';
import {ReactComponent as UsersOnlineIcon} from '../Icons/UsersOnline.svg'

const ENDPOINT = "http://localhost:8080/";

function saveUserDataToLocalStorage(userId: string, roomId: string, userToken: string, roomToken: string) {
  localStorage.setItem("userId", userId);
  localStorage.setItem("roomId", roomId);
  localStorage.setItem("userToken", userToken);
  localStorage.setItem("roomToken", roomToken);
}

function querySocket (userName: string | undefined, userId: string | undefined, roomId: string | null, userToken: string | undefined, roomToken: string | null) {

  const authQuery: {name?:string, roomId?: string, userId?: string, userToken?: string, roomToken?: string} = {};

  if (userName) {
    authQuery.name = userName;
  }
  if (roomId) {
    authQuery.roomId = roomId;
  }
  if (userId) {
    authQuery.userId = userId;
  }
  if (userToken) {
    authQuery.userToken = userToken;
  }
  if (roomToken) {
    authQuery.roomToken = roomToken;
  }

  console.log('query socket');
  return io(ENDPOINT, {
    transports: ['websocket', 'polling', 'flashsocket'],
    query: authQuery
  })
}


export const ChatAppPage: React.FC = () => {

  const roomId = useSelector(getRoomId());
  const userId = useSelector(getUserId());
  const userName = useSelector(getUserName());
  const roomToken = useSelector(getRoomToken());
  const userToken = useSelector(getUserToken());

  const [error, setError] = useState<string | null>(null);
  const [isShowingUsersOnMobile, setIsShowingUsersOnMobile] = useState(false);
  const [isMobile, ] = useState(window.innerWidth < 768);

  const socketRef = useRef<Socket | null>(null);

  const dispatch = useAppDispatch();

  const roomLink = useMemo(() => window.location.origin + '/?roomId=' + roomId + '&roomToken=' + roomToken, [roomId, roomToken]);

  // user clicks on the 'Leave' button => clear localstorage and disconnect socket 
  const handleDisconnectClick = useCallback((e: React.MouseEvent) => {
    localStorage.removeItem('userId');
    localStorage.removeItem('roomId');
    localStorage.removeItem('roomToken');
    localStorage.removeItem('userToken');
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    dispatch(disconnectUser());
    dispatch(disconnectRoom());
    setError(null);
  }, [dispatch])

  const copyRoomLink = useCallback((e: React.MouseEvent) => {
    const input = document.createElement('input');
    input.value = roomLink;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    const button = e.currentTarget as HTMLButtonElement;
    (e.currentTarget as HTMLButtonElement).setAttribute('data-link', 'Copied!');
    // think about clearTimeout on unmount
    setTimeout(() => button.setAttribute('data-link', 'Copy room link: ' + roomLink), 1000)
  }, [roomLink])

  const toggleIsShowingUsersOnMobile = useCallback(() => setIsShowingUsersOnMobile(!isShowingUsersOnMobile), [isShowingUsersOnMobile])

  useEffect(() => {

    // initialize socket connection with the server
    // and sending user's data
    // username; roomId? => create new user and join the room if roomId provided
    // userId => join existing user to his initially assigned room
    if (!socketRef.current) {
      socketRef.current = querySocket(userName, userId, roomId, userToken, roomToken);
      setSocketStatus(SOCKET_STATUS.CONNECTED);
    }

    const socket = socketRef.current

    // if server successfully connected user after handshake then setting socket state as connected
    socket.on('connect', () => {
      dispatch(setSocketStatus(SOCKET_STATUS.CONNECTED));
    });

    // got user and room actual data => updating user and room states
    socket.on('user data',  (userInitial: UserData) => {
      console.log('user data is ', userInitial);
      saveUserDataToLocalStorage(userInitial._id, userInitial.room._id, userInitial.token, userInitial.room.token);
      dispatch(setRoom({
          status: ROOM_STATUS.CONNECTED,
          id: userInitial.room._id, 
          token: userInitial.room.token,
          messages: userInitial.room.messages, 
          users: userInitial.room.users
        }));
      dispatch(setUser({id: userInitial._id, token: userInitial.token, name: userInitial.name}))
      console.log('set user and room');
    })

    // got chat message => updating room messages state
    socket.on('chat message', (message: Message) => {
      console.log('got message: ', message);
      dispatch(addMessage({user: message.user, date: message.date, content: message.content}));
    })

    // someone joined => updating room users state
    socket.on('chat join', (user: UserPublic ) => {
      console.log('got chat join', user);
      dispatch(addUser(user));
    })

    // someone left room => updating room users state
    socket.on('chat leave', (user: UserPublic) => {
      console.log('user left room: ' + user._id);
      dispatch(removeUser(user));
    })

    // on disconnect setting user's state as guest and room state as none
    socket.on('disconnect', () => {
      console.log('client disconnected');
      dispatch(disconnectUser());
      dispatch(disconnectRoom());
    });

    socket.on('connect_error', (err: Error) => {
      console.log('got error from server');
      setError(err.message);
    })
  }, [socketRef, dispatch]);

  if (error) {
    return (
      <ErrorMessageContaner>
        <h1>{error}</h1>
        <LeaveButton onClick={handleDisconnectClick}>
          Go to create new user page
        </LeaveButton>
      </ErrorMessageContaner>
    )
  }

  return (
    <AppContainer>
      <Header>
          {roomId && 
              <p>
                Room:&nbsp;{roomId}&nbsp;
                <CopyButton data-link={roomLink} 
                            onClick={copyRoomLink}>
                  <CopyIcon />
                </CopyButton>
              </p>
          } 
          <LeaveButton onClick={handleDisconnectClick}>Leave</LeaveButton>
      </Header>
      <UsersAside>
        {isMobile ? 
          <MobileMenu>
            <UsersOnlineIcon onClick={toggleIsShowingUsersOnMobile} />
          </MobileMenu>
          :
          <UsersList />
        }
      </UsersAside>
      <ChatCell>
        {isShowingUsersOnMobile && <UsersList />}
        <Chat />
      </ChatCell>
      <MessageInputCell>
        <MessageInput socket={socketRef.current}/>
      </MessageInputCell>
    </AppContainer>
  );
}

const AppContainer = styled.div`
  height: 100vh;
  overflow: hidden;
  display: grid;
  background-color: #393e46;
  grid-template-columns: minmax(200px, 300px) minmax(300px, auto);
  grid-auto-rows: 50px 1fr 100px;

  @media screen and (max-width: 768px) {
    grid-template-columns: 50px 1fr;
  }

  & > * {
    border-top: 1px solid #232931;
    border-right: 1px solid #232931;
    border-collapse: collapse;
  }
`

const Header = styled.div`
  display: flex;
  padding: 0 20px;
  justify-content: space-between;
  align-items: center;
  flex-flow: row nowrap;
  grid-column-start: 1;
  grid-column-end: 3;

  svg {
    vertical-align: middle;
  }

  div {
    margin: 0 40px;
  }
`

const UsersAside = styled.div`
  grid-row-start: 2;
  grid-row-end: 4;
`

const MessageInputCell = styled.div`

`

const ChatCell = styled.div`
  overflow-y: auto;

  & > *:last-child:not(:only-child) {
    display: none;
  }
`

const LeaveButton = styled.button`
  padding: 10px;
  border: none;
  background-color: transparent;
  border: 2px solid rgba(255, 0, 0, .3);
  border-radius: 5px;
  color: inherit;
  outline: none;

  &:hover {
    cursor: pointer;
  }
`
const CopyButton = styled.button`
  background-color: transparent;
  padding: 0;
  border: none;
  outline: none;
  position: relative;
  &:hover {
    cursor: pointer;
    &::after {
      content: attr(data-link);
      position: absolute;
      top: 25px;
      color: white;
      text-align: left;
      border: 1px solid lightgrey;
      border-radius: 5px;
      background-color: ${props => props.theme.primaryColor};
      padding: 4px;
      opacity: .7;
      font-size: .75em;
      z-index: 1;
    }
  }
`

const ErrorMessageContaner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

const MobileMenu = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  margin: 10px 0;

  svg:hover {
    cursor: pointer;
  }
`