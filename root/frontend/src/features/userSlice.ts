import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SOCKET_STATUS, UserState, USER_STATUS } from "../types";
import { RootState } from '../store'

const initialState: UserState = {
    status: USER_STATUS.GUEST,
    socketStatus: SOCKET_STATUS.DISCONNECTED
} as UserState

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<{id: string, token: string, name: string}>) => {
            return {
                status: USER_STATUS.SIGNED,
                socketStatus: state.socketStatus,
                name: action.payload.name,
                id: action.payload.id,
                token: action.payload.token
            }
        },
        setUserName: (state, action: PayloadAction<string>) => {
            return {
                status: USER_STATUS.NAMED,
                socketStatus: state.socketStatus,
                name: action.payload
            }
        },
        setSocketStatus: (state, action: PayloadAction<SOCKET_STATUS>) => {
            state.socketStatus = action.payload;
        },
        disconnectUser: (state) => {
            return {
                status: USER_STATUS.GUEST,
                socketStatus: SOCKET_STATUS.DISCONNECTED
            }
        }
    }
})


export const getUser = () => (state: RootState) => state.user
export const getUserStatus = () => (state: RootState) => state.user.status;
export const getUserName = () => (state: RootState) => {
    if (state.user.status !== USER_STATUS.GUEST) {
        return state.user.name;
    }
}
export const getUserId = () => (state: RootState) => {
    if (state.user.status === USER_STATUS.SIGNED) {
        return state.user.id;
    }
}
export const getSocketStatus = () => (state: RootState) => {
    return state.user.socketStatus;
}

export const getUserToken = () => (state: RootState) => {
    if (state.user.status === USER_STATUS.SIGNED) {
        return state.user.token;
    }
}

export const { setUser, setSocketStatus, setUserName, disconnectUser } = userSlice.actions; 

export default userSlice.reducer;