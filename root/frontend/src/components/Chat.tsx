import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux';
import styled, { ThemeConsumer } from 'styled-components'
import { getMessages } from '../features/roomSlice';
import { getUserId } from '../features/userSlice';


const ChatContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 10px;
    height: 100%;
    overflow-y: auto;   
    background-color: ${props => props.theme.primaryColor};
    overflow-wrap: anywhere;
`

const UserMessage = styled.div<{isMe: boolean}>`
     
    background-color: ${props => props.isMe ? props.theme.secondaryColor : `rgba(211,211,211, .2)`};
    position: relative;
    margin: 10px 0 0;
    padding: 5px 10px 10px;
    border-radius: 5px;
    display: inline-block;
    max-width: 500px;

    p {
        margin: 0 50px 5px 0;

        &:first-child {
            color: lightblue;
            font-weight: bolder;
        }
    }

    span {
        font-size: .75em;
        position: absolute;
        bottom: 5px;
        right: 5px;
        color: lightgrey;
    }
`

export const Chat: React.FC = () => {

    const messages = useSelector(getMessages());
    const myId = useSelector(getUserId());

    const chatRef = useRef<HTMLDivElement>(null);

    // scroll chat to the bottom on each new message received
    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages])

    const messagesList = messages.map(message => {
        const date = new Date(message.date);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        return (
            <UserMessage key={date.getTime()} isMe={myId === message.user._id}>
                <p>{message.user.name} </p>
                <p>{message.content}</p>
                <span>{hours}:{minutes}</span>
            </UserMessage>
        );
    })

    return (
        <ChatContainer ref={chatRef}>
            {messagesList}
        </ChatContainer>
    )
}