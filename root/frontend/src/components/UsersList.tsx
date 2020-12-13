import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'
import { getUsers } from '../features/roomSlice'
import { getUserId } from '../features/userSlice'
import {ReactComponent as UsersOnlineIcon} from '../Icons/UsersOnline.svg'


const UsersListContainer = styled.div<{hover?: boolean}>`
    & > p {
        margin: 0;
        padding: 20px 0;
        text-align: center;
        svg {
            vertical-align: middle;
        }
    }
`

const UserListItem = styled.div`
    background-color: rgba(0, 0, 0, .1);
    padding: 20px;
    color: lightcyan;
    font-weight: bolder;
`

interface UserListProps {
    toggleUsersShow?: () => void
}

export const UsersList: React.FC<UserListProps> = ({ toggleUsersShow }) => {
    
    const myId = useSelector(getUserId());
    const users = useSelector(getUsers()).filter(user => user._id !== myId);

    const usersList = useMemo(() => users.map(user => { 
        console.log('users: ', users);
        return (
            <UserListItem key={user._id}>
                {user.name}
            </UserListItem>
        )
    }), [users])

    return (
        <UsersListContainer>
            <p><UsersOnlineIcon /> Online users</p>
            { users.length > 0 ?  usersList : <p>No users in this room</p> }
        </UsersListContainer>
    )
}