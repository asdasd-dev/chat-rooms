import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { RoomState, UserPublic, Message, ROOM_STATUS } from "../types";

const initialState = {
    status: ROOM_STATUS.NONE
} as RoomState

const roomSlice = createSlice({
    name: 'room',
    initialState,
    reducers: {
        setRoom(state, action: PayloadAction<RoomState>) {
            return action.payload;
        },
        setRoomId(state, action: PayloadAction<string>) {
            return {
                status: ROOM_STATUS.REQUIRED,
                id: action.payload
            }
        },
        addUser: (state, action: PayloadAction<UserPublic>) => {
            if (state.status === ROOM_STATUS.CONNECTED) {
                if (!state.users.find(user => user._id === action.payload._id)) {
                    state.users.push(action.payload);
                    console.log('new user pushed');
                }
            }
        },
        removeUser: (state, action: PayloadAction<UserPublic>) => {
            if (state.status === ROOM_STATUS.CONNECTED) {
                const leftUserIndex = state.users.findIndex(user => user._id === action.payload._id);
                if (leftUserIndex !== -1) {
                    state.users.splice(leftUserIndex, 1);
                }
            }
        },
        addMessage: (state, action: PayloadAction<Message>) => {
            if (state.status === ROOM_STATUS.CONNECTED) {
                console.log('pushing message');
                state.messages.push(action.payload);
            }
        },
        disconnectRoom: (state) => {
            return {
                status: ROOM_STATUS.NONE
            }
        }
    }
})

export const { setRoom, addUser, addMessage, removeUser, disconnectRoom, setRoomId } = roomSlice.actions;

export default roomSlice.reducer;

export const getMessages = () => (state: RootState) => {
    if (state.room.status === ROOM_STATUS.CONNECTED) {
        return state.room.messages;
    }
    return [];
}

export const getRoomStatus = () => (state: RootState) => {
    return state.room.status;
}

export const getRoomId = () => (state: RootState) => {
    if (state.room.status !== ROOM_STATUS.NONE) {
        return state.room.id;
    }
    else {
        return null;
    }
}

export const getUsers = () => (state: RootState) => {
    if (state.room.status === ROOM_STATUS.CONNECTED) {
        return state.room.users;
    }
    return null;
}