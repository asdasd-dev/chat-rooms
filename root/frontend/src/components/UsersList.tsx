import React from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'
import { getUsers } from '../features/roomSlice'

const UsersListContainer = styled.div`
    & > div {
        background-color: rgba(0, 0, 0, .3);
        padding: 5px;
    }
    & > p {
        text-align: center;
    }
`

export const UsersList: React.FC = () => {
    
    const users = useSelector(getUsers());

    console.log('users: ', users);

    return (
        <UsersListContainer>
            <p>Online users</p>
            { users &&
                users.map(user => {
                    return (
                        <div>
                            <p>{user.name}</p>
                        </div>
                    )
                })
            }
        </UsersListContainer>
    )
}