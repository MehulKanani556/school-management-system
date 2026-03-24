import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { incrementUnreadCount } from '../redux/slice/communication.slice';
import toast from 'react-hot-toast';

export const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const dispatch = useDispatch();
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef(null);
    const { user, isAuthenticated, token } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated && user && token) {
            // Initialize socket only if not already initialized
            if (!socketRef.current) {
                const apiURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
                socketRef.current = io(apiURL, {
                    transports: ['websocket'],
                    reconnection: true,
                    reconnectionAttempts: 10,
                    reconnectionDelay: 2000,
                    auth: {
                        userId: user._id,
                        token: token
                    }
                });

                socketRef.current.on('connect', () => {
                    console.log('✅ Socket connected:', socketRef.current.id);
                    setIsConnected(true);
                    socketRef.current.emit('register_user', user._id);
                });

                socketRef.current.on('connect_error', (error) => {
                    console.error('❌ Socket connection error:', error.message);
                    setIsConnected(false);
                });

                socketRef.current.on('disconnect', (reason) => {
                    console.log('⚠️ Socket disconnected:', reason);
                    setIsConnected(false);
                });

                // Centralized Event Listeners
                
                // 1. Announcements
                socketRef.current.on('NEW_ANNOUNCEMENT', (data) => {
                    dispatch(incrementUnreadCount());
                    toast.success(`📢 New Announcement: ${data.title}`);
                });

                // 2. Direct Messages
                socketRef.current.on('NEW_MESSAGE', (data) => {
                    dispatch(incrementUnreadCount());
                    toast.success(`💬 New Message from ${data.senderName}`);
                });

                // 3. Grade Assignments
                socketRef.current.on('GRADE_ASSIGNED', (data) => {
                    dispatch(incrementUnreadCount());
                    toast.success(`📝 New Grade Assigned: ${data.assignmentTitle}`);
                });

                // 4. Attendance Marked
                socketRef.current.on('ATTENDANCE_MARKED', (data) => {
                    toast.info(`📅 Attendance marked for ${data.date}`);
                });

                // 5. General Notifications
                socketRef.current.on('NEW_NOTIFICATION', (data) => {
                    dispatch(incrementUnreadCount());
                    toast(data.message, { icon: '🔔' });
                });
            }

            return () => {
                if (socketRef.current) {
                    socketRef.current.disconnect();
                    socketRef.current = null;
                    setIsConnected(false);
                }
            };
        } else {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setIsConnected(false);
            }
        }
    }, [isAuthenticated, user, token, dispatch]);

    const value = {
        socket: socketRef.current,
        isConnected,
        emit: (event, data) => socketRef.current?.emit(event, data),
        on: (event, cb) => socketRef.current?.on(event, cb),
        off: (event, cb) => socketRef.current?.off(event, cb)
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
