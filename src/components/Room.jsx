import { Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import { ChatWindow } from './ChatWindow';

export const Room = () => {
  const [socket, setSocket] = useOutletContext();
  const { roomId } = useParams();

  useEffect(() => {
    if (!socket) return;
    socket.emit('join-room', { roomId });
  }, [socket]);

  return (
    <div>
      <ChatWindow />
    </div>
  );
};
