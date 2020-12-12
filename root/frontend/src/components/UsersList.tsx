import React from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'
import { getUsers } from '../features/roomSlice'
import { getUserId } from '../features/userSlice'

const UsersListContainer = styled.div`
    & > div {
        background-color: rgba(0, 0, 0, .3);
        padding: 5px;
    }
    & > p {
        text-align: center;
    }
`

const UserListItem = styled.div<{isMe: boolean}>`
    color: ${props => props.isMe ? 'green' : 'inherit'}
`

export const UsersList: React.FC = () => {
    
    const users = useSelector(getUsers());
    const myId = useSelector(getUserId());

    console.log('users: ', users);

    return (
        <UsersListContainer>
            <p>Online users</p>
            { users &&
                users.map(user => {
                    return (
                        <UserListItem key={user._id} isMe={myId === user._id}>{user.name}</UserListItem>
                    )
                })
            }
        </UsersListContainer>
    )
}