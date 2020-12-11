import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { setRoom } from './features/roomSlice';
import { getSocketStatus, getUserStatus, setUser } from './features/userSlice';
import { ChatAppPage } from './pages/ChatAppPage';
import { JoinUserPage } from './pages/JoinUserPage';
import { useAppDispatch } from './store';
import { ROOM_STATUS, SOCKET_STATUS, USER_STATUS } from './types';

function App() {

  const userStatus = useSelector(getUserStatus());
  
  console.log(userStatus);

  const [roomId, setRoomId] = useState<string | null>(null);

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const roomIdParam = urlSearchParams.get('roomId');
    if (roomIdParam) {
      setRoomId(roomIdParam)
    }
  }, [])

  const dispatch = useAppDispatch();  

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      console.log('found user data in local storage');
      const userDataObj: {roomId: string, userId: string, name: string} = JSON.parse(userData);
      dispatch(setRoom({status: ROOM_STATUS.REQUIRED, id: userDataObj.roomId}));
      dispatch(setUser({id: userDataObj.userId, name: userDataObj.name}));
    }
  }, []);
  
  if (userStatus === USER_STATUS.GUEST) {
    return <JoinUserPage roomRequiredId={roomId}/>
  }
  
  return (
    <ChatAppPage roomIdRequired={roomId}/>
  )

}

export default App;
