import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { getRoomId } from '../features/roomSlice';
import { setUserName } from '../features/userSlice';
import { useAppDispatch } from '../store';

const JoinUserPageContainer = styled.div`
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;

    form {
        display: flex;
        flex-direction: column;
        align-items: center;

        & > * {
            margin: 10px;
        }
    }
`

export const JoinUserPage: React.FunctionComponent = () => {

    const roomId = useSelector(getRoomId());
    
    const dispatch = useAppDispatch();

    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('submitting name');
        if (name !== '') {
            dispatch(setUserName(name));
        }
    }

    return (
        <JoinUserPageContainer>
            <form onSubmit={handleSubmit}>
                {roomId &&
                    <p>Joining to the room {roomId}</p>
                }
                <label>Enter your name</label>
                <input type="text" onChange={e => setName(e.target.value)} />
            </form>
        </JoinUserPageContainer>
    )
}