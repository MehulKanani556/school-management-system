import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { incrementUnreadCount } from '../redux/slice/communication.slice';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const dispatch = useDispatch();
    const [socketInstance, setSocketInstance] = useState(null);
    const { user, isAuthenticated } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated && user) {
            const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:8000', {
                transports: ['websocket'],
                reconnection: true
            });

            newSocket.on('connect', () => {
                console.log('Socket connected:', newSocket.id);
                newSocket.emit('register_user', user._id);
            });

            // Global Real-time Dispatch
            newSocket.on('new_announcement', (data) => {
                dispatch(incrementUnreadCount());
            });
            newSocket.on('new_direct_message', (data) => {
                dispatch(incrementUnreadCount());
            });
            newSocket.on('new_notice', (data) => {
                dispatch(incrementUnreadCount());
            });

            setSocketInstance(newSocket);

            return () => {
                newSocket.disconnect();
                setSocketInstance(null);
            };
        } else {
            if (socketInstance) {
                socketInstance.disconnect();
                setSocketInstance(null);
            }
        }
    }, [isAuthenticated, user]);

    return (
        <SocketContext.Provider value={socketInstance}>
            {children}
        </SocketContext.Provider>
    );
};
