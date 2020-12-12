import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux';
import styled from 'styled-components'
import { getMessages } from '../features/roomSlice';
import { getUserId } from '../features/userSlice';


const ChatContainer = styled.div`
    padding: 10px;
    background-color: ${props => props.theme.primaryColor};
    overflow-y: auto;
    overflow-wrap: anywhere;
`

const UserMessage = styled.p<{isMe: boolean}>`
    color: ${props => props.isMe ? 'green' : 'inherit'}
`

export const Chat: React.FC = () => {

    const messages = useSelector(getMessages());
    const myId = useSelector(getUserId());

    const chatRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages])

    return (
        <ChatContainer ref={chatRef}>
            {messages.map(message => {
                const date = new Date(message.date);
                const hours = date.getHours();
                const minutes = date.getMinutes();
                return (
                    <UserMessage key={date.getTime()} isMe={myId === message.user._id}>
                        <span >{message.user.name} </span>
                        <span> ({hours}:{minutes}) </span>
                        <span>{message.content} </span>
                    </UserMessage>
                );
            })}
        </ChatContainer>
    )
}