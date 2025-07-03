import { io } from 'socket.io-client';

const socket = io('', {});

socket.onAny((event, ...args) => {
  console.log(event, args);
});

export default socket;
