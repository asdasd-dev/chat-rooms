import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { setRoomIdAndToken } from './features/roomSlice';
import { getUserStatus, setUser } from './features/userSlice';
import { ChatAppPage } from './pages/ChatAppPage';
import { JoinUserPage } from './pages/JoinUserPage';
import { useAppDispatch } from './store';
import { USER_STATUS } from './types';

function App() {

  const userStatus = useSelector(getUserStatus());

  const dispatch = useAppDispatch();


  // Checking local storage and url query params 
  // then pushing room/user data to the state
  useEffect(() => {

    const userIdLocalStorage = localStorage.getItem('userId');
    const roomIdLocalStorage = localStorage.getItem('roomId');
    const userTokenLocalStorage = localStorage.getItem('userToken');
    const roomTokenLocalStorage = localStorage.getItem('roomToken');

    const urlSearchParams = new URLSearchParams(window.location.search);
    const roomIdParam = urlSearchParams.get('roomId');
    const roomTokenParam = urlSearchParams.get('roomToken');
    
    if (userIdLocalStorage && userTokenLocalStorage) {
      console.log('found user id in local storage');
      dispatch(setUser({id: userIdLocalStorage, name: '', token: userTokenLocalStorage}));
    } 

    if (roomIdLocalStorage && roomTokenLocalStorage) {
      console.log(`required room ${roomIdParam} from url query`)
      dispatch(setRoomIdAndToken({_id: roomIdLocalStorage, token: roomTokenLocalStorage}))
    }
    else if (roomIdParam && roomTokenParam) {
      console.log('found room id and token in local storage');
      dispatch(setRoomIdAndToken({_id: roomIdParam, token: roomTokenParam}));
    }

  }, [dispatch])

  // if user has no userId in localStorage
  // then he is still guest => asking to set name
  if (userStatus === USER_STATUS.GUEST) {
    return <JoinUserPage />
  }
  
  return (
    <ChatAppPage />
  )

}

export default App;
