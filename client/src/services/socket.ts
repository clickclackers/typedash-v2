import { io } from 'socket.io-client';

const api_url =
  process.env.NODE_ENV === 'production'
    ? (import.meta.env.VITE_API_URL as string)
    : 'http://localhost:3000/';

const socket = io(api_url, {});

socket.onAny((event, ...args) => {
  console.log(event, args);
});

export default socket;
