import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Cookies from 'js-cookie';
import Button from '@mui/material/Button';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

export const Header = ({ socket, userId, setUserId }) => {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchRooms = async () => {
      const { data } = await axios.get('http://localhost:4000/rooms');
      console.log(data.rooms);
      setRooms(data.rooms);
    };
    fetchRooms();
  }, []);

  function createNewRoom() {
    const roomId = uuidv4();
    navigate(`/room/${roomId}`);
    socket.emit('new-room-created', { roomId, userId });
    setRooms((prev) => [...prev, { roomId, name: 'test', _id: 'testId' }]);
  }

  useEffect(() => {
    if (!socket) return;
    socket.on('new-room-created', ({ room }) => {
      console.log(room);
      setRooms((prev) => [...prev, room]);
    });

    socket.on('room-removed', ({ roomId }) => {
      console.log(rooms, roomId);

      // setRooms(rooms.filter((room) => room.roomId !== roomId));
    });
  }, [socket]);

  function login() {
    const userId = uuidv4();
    setUserId(userId);
    Cookies.set('userId', userId);
    navigate('/');
  }

  function logout() {
    Cookies.remove('userId');
    setUserId(null);
    navigate('/');
  }

  return (
    <Card sx={{ marginTop: 5, backgroundColor: '#eeeeee' }} raised>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box>
          <Link style={{ textDecoration: 'none' }} to='/'>
            <Button sx={{ color: '#000000' }} variant='text'>
              Home
            </Button>
          </Link>
          {rooms.length > 0 &&
            rooms.map((room) => (
              <Link
                key={room.roomId}
                style={{ textDecoration: 'none' }}
                to={`/room/${room.roomId}`}
              >
                <Button sx={{ color: '#000000' }} variant='text'>
                  {room.name}
                </Button>
              </Link>
            ))}
        </Box>
        <Box>
          {userId ? (
            <>
              <Button
                sx={{ color: '#000000' }}
                variant='text'
                onClick={createNewRoom}
              >
                New Room
              </Button>
              <Button sx={{ color: '#000000' }} variant='text' onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <Button sx={{ color: '#000000' }} variant='text' onClick={login}>
              Login
            </Button>
          )}
        </Box>
      </Box>
    </Card>
  );
};
