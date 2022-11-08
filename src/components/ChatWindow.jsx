import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/CArd';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useOutletContext, useParams } from 'react-router-dom';
import InputLabel from '@mui/material/InputLabel';
import axios from 'axios';
import AttachFileIcon from '@mui/icons-material/AttachFile';

export const ChatWindow = () => {
  const [socket, setSocket] = useOutletContext();
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [typing, setTyping] = useState(false);
  const { roomId } = useParams();
  const fileRef = useRef();

  useEffect(() => {
    if (!socket) return;
    socket.on('message-from-server', ({ message }) => {
      setChat((prev) => [...prev, { message, received: true }]);
    });

    socket.on('typing-started-from-server', () => setTyping(true));
    socket.on('typing-stopped-from-server', () => setTyping(false));

    socket.on('uploaded', ({ buffer }) => {
      setChat((prev) => [
        ...prev,
        { message: buffer, received: true, type: 'file' },
      ]);
    });
  }, [socket]);

  function handleForm(e) {
    e.preventDefault();
    socket.emit('send-message', { message, roomId });
    setChat((prev) => [...prev, { message, received: false }]);
    setMessage('');
  }

  const [typingTimeout, setTypingTimeout] = useState(null);

  function handleInput(e) {
    setMessage(e.target.value);
    socket.emit('typing-started', { roomId });
    if (typingTimeout) clearTimeout(typingTimeout);
    setTypingTimeout(
      setTimeout(() => {
        socket.emit('typing-stopped', { roomId });
      }, 1000)
    );
  }

  async function removeRoom() {
    // await axios.delete(`http://localhost:4000/rooms/${roomId}`);
    socket.emit('room-removed', { roomId });
  }

  function selectFile() {
    fileRef.current.click();
  }

  function fileSelected(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const data = reader.result;

      socket.emit('upload', { data, roomId });
      setChat((prev) => [
        ...prev,
        { message: data, received: false, type: 'file' },
      ]);
    };
  }

  return (
    <Card
      sx={{
        padding: 2,
        marginTop: 10,
        width: '60%',
        backgroundColor: '#eeeeee',
      }}
    >
      <Box sx={{ marginBottom: 5 }}>
        {chat.map((data) =>
          data.type === 'file' ? (
            <img
              style={{ float: data.received ? 'left' : 'right' }}
              src={data.message}
              alt='some-random-img'
              width='200'
            />
          ) : (
            <Typography
              sx={{ textAlign: data.received ? 'left' : 'right' }}
              key={data.message}
            >
              {data.message}
            </Typography>
          )
        )}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {roomId && <Typography>Room {roomId}</Typography>}
        {roomId && (
          <Button variant='text' onClick={removeRoom}>
            Delete Room
          </Button>
        )}
      </Box>

      <Box component='form' onSubmit={handleForm}>
        {typing && (
          <InputLabel sx={{ color: '#000000' }} shrink htmlFor='message-input'>
            Typing...
          </InputLabel>
        )}
        <OutlinedInput
          sx={{ backgroundColor: '#ffffff', width: '100%' }}
          placeholder='Write your message'
          value={message}
          id='message-input'
          onChange={handleInput}
          endAdornment={
            <InputAdornment position='end'>
              <input
                onChange={fileSelected}
                ref={fileRef}
                type='file'
                style={{ display: 'none' }}
              />
              <IconButton type='button' onClick={selectFile}>
                <AttachFileIcon />
              </IconButton>
              <IconButton type='submit'>
                <SendIcon />
              </IconButton>
            </InputAdornment>
          }
        />
      </Box>
    </Card>
  );
};
