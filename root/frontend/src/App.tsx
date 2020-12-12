import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { setRoomId } from './features/roomSlice';
import { getUserStatus, setUser } from './features/userSlice';
import { ChatAppPage } from './pages/ChatAppPage';
import { JoinUserPage } from './pages/JoinUserPage';
import { useAppDispatch } from './store';
import { USER_STATUS } from './types';

function App() {

  const userStatus = useSelector(getUserStatus());

  const dispatch = useAppDispatch();

  useEffect(() => {

    const userIdLocalStorage = localStorage.getItem('userId');
    const roomIdLocalStorage = localStorage.getItem('roomId');

    const urlSearchParams = new URLSearchParams(window.location.search);
    const roomIdParam = urlSearchParams.get('roomId');
    
    if (userIdLocalStorage) {
      console.log('found user id in local storage');
      dispatch(setUser({id: userIdLocalStorage, name: ''}));
    } 

    if (roomIdParam) {
      console.log(`required room ${roomIdParam} from url query`)
      dispatch(setRoomId(roomIdParam))
    }
    else if (roomIdLocalStorage) {
      console.log('found room id in local storage');
      dispatch(setRoomId(roomIdLocalStorage));
    }

  }, [dispatch])

  if (userStatus === USER_STATUS.GUEST) {
    return <JoinUserPage />
  }
  
  return (
    <ChatAppPage />
  )

}

export default App;
