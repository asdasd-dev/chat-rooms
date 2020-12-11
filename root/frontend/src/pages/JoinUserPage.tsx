import React, { useEffect, useState } from 'react';
import {  useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router';
import styled from 'styled-components';
import { setRoom } from '../features/roomSlice';
import { getUser, setUserName } from '../features/userSlice';
import { useAppDispatch } from '../store';
import { ROOM_STATUS, USER_STATUS } from '../types';

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

interface JoinUserPageProps {
    roomRequiredId: string | null
}

export const JoinUserPage: React.FC<JoinUserPageProps> = ({ roomRequiredId }) => {

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
                {roomRequiredId &&
                    <p>Joining to the room {roomRequiredId}</p>
                }
                <label>Enter your name</label>
                <input type="text" onChange={e => setName(e.target.value)} />
            </form>
        </JoinUserPageContainer>
    )
}