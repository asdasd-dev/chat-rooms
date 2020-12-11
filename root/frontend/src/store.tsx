import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import userReducer from './features/userSlice';
import roomReducer from './features/roomSlice';


const store = configureStore({
    reducer: {
        user: userReducer,
        room: roomReducer
    }
})

export default store;
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>()