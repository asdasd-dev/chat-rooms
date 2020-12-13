// userSlice

export enum USER_STATUS {
    GUEST = 'guest',
    NAMED = 'named',
    SIGNED = 'signed',
}

export enum SOCKET_STATUS {
    CONNECTED = 'connected',
    DISCONNECTED = 'disconnected'
}

export interface UserStateGuest {
    status: USER_STATUS.GUEST,
    socketStatus: SOCKET_STATUS,
}

export interface UserStateNamed {
    status: USER_STATUS.NAMED,
    socketStatus: SOCKET_STATUS,
    name: string
}

export interface UserStateSigned {
    status: USER_STATUS.SIGNED,
    socketStatus: SOCKET_STATUS,
    id: string,
    token: string,
    name: string,
}

export interface UserPublic {
    name: string,
    _id: string
}

export type UserState = UserStateGuest | UserStateNamed | UserStateSigned;

// roomSlice

export enum ROOM_STATUS {
    NONE = 'none',
    REQUIRED = 'required',
    CONNECTED = 'connected'
}

export interface Message {
    user: UserPublic,
    date: Date,
    content: string
}

export interface RoomConnectedState {
    status: ROOM_STATUS.CONNECTED
    id: string,
    token: string,
    messages: Message[],
    users: UserPublic[]
}

export interface RoomRequiredState {
    status: ROOM_STATUS.REQUIRED,
    id: string,
    token: string
}

export interface RoomNoneState {
    status: ROOM_STATUS.NONE
}

export type RoomState = RoomConnectedState | RoomRequiredState | RoomNoneState;

// server responses

export interface RoomData {
    _id: string,
    token: string,
    users: UserPublic[],
    messages: Message[],
}

export interface UserData {
    _id: string,
    token: string,
    name: string,
    room: RoomData
}

export interface UserLocalStorage {
    userId: string,
    roomId: string,
    userToken: string,
    roomToken: string
}

export interface CreateUserRequest {
    roomId: string | null,
    name: string
}