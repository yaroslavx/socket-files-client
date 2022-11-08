import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { Outlet } from 'react-router-dom';
import { Header } from './components/Header';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Cookies from 'js-cookie';

function App() {
  const [socket, setSocket] = useState(null);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    setSocket(io('http://localhost:4000'));
    const _userId = Cookies.get('userId');
    if (_userId) setUserId(_userId);
  }, []);

  return (
    <Container>
      <Header socket={socket} userId={userId} setUserId={setUserId} />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Outlet context={[socket, setSocket]} />
      </Box>
    </Container>
  );
}

export default App;
