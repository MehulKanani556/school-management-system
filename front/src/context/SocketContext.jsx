import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { incrementUnreadCount, addMessage } from '../redux/slice/communication.slice';
import { 
    setNewTicket as setSANewTicket, 
    updateTicketReply as updateSATicketReply, 
    updateTicketStatusRealTime as updateSATicketStatusRealTime 
} from '../redux/slice/schoolAdmin.slice';

import { 
    setNewTicket as setSuperNewTicket, 
    updateTicketReply as updateSuperTicketReply, 
    updateTicketStatusRealTime as updateSuperTicketStatusRealTime 
} from '../redux/slice/superAdmin.slice';

import toast from 'react-hot-toast';

export const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const dispatch = useDispatch();
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef(null);
    const { user, isAuthenticated, token } = useSelector((state) => state.auth);

    useEffect(() => {
        const registerUser = () => {
            if (socketRef.current && user) {
                const registrationData = {
                    userId: user._id,
                    role: user.role,
                    classId: user.classSection || user.classSectionId
                };
                console.log('📡 Registering user with Socket:', registrationData);
                socketRef.current.emit('register_user', registrationData);
            }
        };

        if (isAuthenticated && user && token) {
            if (!socketRef.current) {
                const apiURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
                socketRef.current = io(apiURL, {
                    transports: ['polling', 'websocket'],
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
                    registerUser();
                });

                socketRef.current.on('connect_error', (error) => {
                    console.error('❌ Socket connection error:', error);
                    setIsConnected(false);
                });

                socketRef.current.on('disconnect', (reason) => {
                    console.log('🔌 Socket disconnected:', reason);
                    setIsConnected(false);
                });

                // Centralized Event Listeners
                
                // 1. Announcements
                socketRef.current.on('NEW_ANNOUNCEMENT', (data) => {
                    dispatch(incrementUnreadCount());
                    toast.success(`📢 New Announcement: ${data.subject || data.title}`);
                });

                // 2. Direct Messages
                socketRef.current.on('NEW_MESSAGE', (data) => {
                    dispatch(incrementUnreadCount());
                    dispatch(addMessage(data));
                    toast.success(`💬 New Message from ${data.senderName || 'someone'}`);
                });

                // 3. Ticket Support (Real-Time)
                socketRef.current.on('NEW_TICKET', (data) => {
                    console.log('🎫 REAL-TIME: NEW_TICKET received', data);
                    dispatch(setSANewTicket(data));
                    dispatch(setSuperNewTicket(data));
                    if (['School_Admin', 'Super_Admin'].includes(user.role)) {
                        toast.success(`🎫 New Support Ticket: ${data.subject}`, { icon: '🆘', duration: 5000 });
                    }
                });

                socketRef.current.on('TICKET_REPLY', (data) => {
                    console.log('💬 REAL-TIME: TICKET_REPLY received', data);
                    dispatch(updateSATicketReply(data));
                    dispatch(updateSuperTicketReply(data));
                    
                    // If the last reply is not from current user, show toast
                    const lastReply = data.replies[data.replies.length - 1];
                    const currentUserId = user._id.toString();
                    const senderId = (lastReply?.senderId?._id || lastReply?.senderId)?.toString();

                    if (senderId && senderId !== currentUserId) {
                        toast.success(`💬 New reply from ${lastReply.senderId?.firstName || 'System'} on ticket: ${data.subject}`);
                    }
                });

                socketRef.current.on('TICKET_STATUS_CHANGED', (data) => {
                    console.log('🔄 REAL-TIME: TICKET_STATUS_CHANGED received', data);
                    dispatch(updateSATicketStatusRealTime(data));
                    dispatch(updateSuperTicketStatusRealTime(data));
                    toast(`🔄 Ticket Status update: ${data.subject} is now ${data.status}`);
                });
            } else if (socketRef.current.connected) {
                // Already connected but user/token might have updated, re-register
                registerUser();
            }
        }

        return () => {
            if (socketRef.current) {
                console.log('🧹 Cleaning up socket connection...');
                socketRef.current.disconnect();
                socketRef.current = null;
                setIsConnected(false);
            }
        };
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
