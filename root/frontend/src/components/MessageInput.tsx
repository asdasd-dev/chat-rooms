import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'
import { getUser } from '../features/userSlice'
import {ReactComponent as SendIcon} from '../Icons/send.svg'
import { USER_STATUS } from '../types'
import { Socket } from 'socket.io-client'

const MessageInputContainer = styled.form`
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;

    input {
        margin: 0 20px;
        height: 2.5em;
        font-family: inherit;
        outline: none;
        padding: 0 5px;
        background-color: transparent;
        border: none;
        color: inherit;
        width: 100%;
    }
    
    img {
        margin: 10px;
        color: white;
    }

    button {
        background: transparent;
        border: none;
        padding: 0;
        margin: 0 20px;
        &:hover {
            cursor: pointer;
        }
    }
`

interface MessageInputProps {
    socket: Socket | null;
}

export const MessageInput: React.FC<MessageInputProps> = ({ socket }) => {

    const inputRef = useRef<HTMLInputElement>(null);

    const user = useSelector(getUser());

    const [message, setMessage] = useState('');

    useEffect(() => {
        inputRef.current?.focus();
        const mouseUpHandler = function() {
            if (window.getSelection()?.isCollapsed) {
                inputRef.current?.focus();
            }
        }
        document.addEventListener('mouseup', mouseUpHandler);

        return () => {
            document.removeEventListener('mouseup', mouseUpHandler);
        }
    }, [inputRef])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message && socket) {
            console.log('sending message', message);
            socket.emit('chat message', message);
            setMessage('');
        }
    }

    if (user.status === USER_STATUS.GUEST) {
        <MessageInputContainer>
            <h1>Not authorized</h1>
        </MessageInputContainer>
    }

    return (
        <MessageInputContainer onSubmit={handleSubmit}>
            <input ref={inputRef}
                                onChange={e => setMessage(e.target.value)} 
                                value={message} 
                                placeholder="Write a message..." />
            <button type="submit">
                <SendIcon type="submit" width="50px" height="50px"/>
            </button>
        </MessageInputContainer>
    )
}