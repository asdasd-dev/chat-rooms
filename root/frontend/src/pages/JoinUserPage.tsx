import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { getRoomId, setRoom } from '../features/roomSlice';
import { setUserName } from '../features/userSlice';
import { useAppDispatch } from '../store';
import { ROOM_STATUS } from '../types';

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

        a {
            color: lightblue;
            text-decoration: underline;
            &:hover {
                cursor: pointer;
            }
        }
    }
`

const Input = styled.input`
    background-color: transparent;
    color: inherit;
    border: none;
    outline: none;
    height: 2em;
    font-size: 1.5em;
    border-bottom: 1px solid ${props => props.theme.secondaryColor};
`

const Button = styled.button`
    background-color: transparent;
    padding: 10px;
    color: inherit;
    border: 2px solid ${props => props.theme.secondaryColor};
    border-radius: 5px;

    &:hover {
        cursor: pointer;
    }
` 

export const JoinUserPage: React.FunctionComponent = () => {

    const roomId = useSelector(getRoomId());

    const inputRef = useRef<HTMLInputElement | null>(null);
    
    const [name, setName] = useState('');

    const dispatch = useAppDispatch();

    useEffect(() => {
        inputRef.current?.focus();
    }, [inputRef])

    // user submits his name => set user name state
    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        console.log('submitting name');
        if (name !== '') {
            dispatch(setUserName(name));
        }
    }, [name])

    const handleCreateOwnRoomClick = useCallback(() => dispatch(setRoom({status: ROOM_STATUS.NONE})), [dispatch])

    const handleNameChange = useCallback(e => setName(e.target.value), []);

    return (
        <JoinUserPageContainer>
            <form onSubmit={handleSubmit}>
                {roomId &&
                    <p>Joining to the room {roomId} (<a onClick={handleCreateOwnRoomClick}>or create your own</a>)</p>
                }
                <Input ref={inputRef} type="text" placeholder="Enter your name..." onChange={handleNameChange} />
                <Button type='submit'>Create user</Button>
            </form>
        </JoinUserPageContainer>
    )
}