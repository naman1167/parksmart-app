import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';

export const useSocket = () => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const socketIO = io(SOCKET_URL, {
            transports: ['websocket'],
            autoConnect: true,
        });

        socketIO.on('connect', () => {
            console.log('✅ Socket connected:', socketIO.id);
            setIsConnected(true);
        });

        socketIO.on('disconnect', () => {
            console.log('❌ Socket disconnected');
            setIsConnected(false);
        });

        setSocket(socketIO);

        return () => {
            socketIO.disconnect();
        };
    }, []);

    return { socket, isConnected };
};

export const useSlotUpdates = (onSlotUpdated) => {
    const { socket, isConnected } = useSocket();

    useEffect(() => {
        if (!socket) return;

        socket.on('slotUpdated', (data) => {
            console.log('Slot updated:', data);
            if (onSlotUpdated) {
                onSlotUpdated(data);
            }
        });

        return () => {
            socket.off('slotUpdated');
        };
    }, [socket, onSlotUpdated]);

    return { socket, isConnected };
};
