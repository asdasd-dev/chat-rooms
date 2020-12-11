import React from 'react'
import styled from 'styled-components'
import { UserPublic } from '../types'


const MessageContainer = styled.div`
    
`

interface MessageProps {
    user: UserPublic,
    date: Date,
    content: string
}

export const Message: React.FC<MessageProps> = ({ user, date, content }) => {
    return (
        <MessageContainer>
            <p><span>{user.name}</span> ({date}): {content}</p>
        </MessageContainer>
    )
}