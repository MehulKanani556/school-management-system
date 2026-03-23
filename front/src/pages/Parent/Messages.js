import React, { useState, useEffect, useRef } from 'react';
import { 
    Send, 
    MessageSquare, 
    User, 
    Search, 
    Clock, 
    ArrowLeft,
    ShieldCheck,
    Paperclip,
    Mic,
    Smile,
    MoreVertical
} from 'lucide-react';
import { useSelector } from 'react-redux';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../context/SocketContext';

const Messages = () => {
    const [messages, setMessages] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedChat, setSelectedChat] = useState(null);
    const [content, setContent] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    const { user: currentUser } = useSelector(state => state.auth);
    const { socket } = useSocket();
    const scrollRef = useRef();

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (!socket) return;
        
        socket.on('new_direct_message', (data) => {
            setMessages(prev => [...prev, data]);
            if (data.sender._id !== selectedChat?._id) {
               toast.info(`New message from ${data.sender.firstName}`);
            }
        });

        return () => socket.off('new_direct_message');
    }, [socket, selectedChat]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, selectedChat]);

    const fetchData = async () => {
        try {
            const [msgRes, conRes] = await Promise.all([
                axiosInstance.get('/my-messages'),
                axiosInstance.get('/contacts')
            ]);
            setMessages(msgRes.data);
            setContacts(conRes.data);
        } catch (err) {
            console.error('Snapshot sync failed');
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!content.trim() || !selectedChat) return;

        try {
            const res = await axiosInstance.post('/my-messages', {
                recipientId: selectedChat._id,
                content: content.trim()
            });
            setMessages([...messages, res.data]);
            setContent('');
        } catch (err) {
            toast.error('Manifest transmission failed');
        }
    };

    const filteredContacts = contacts.filter(c => 
        (c.firstName + ' ' + c.lastName).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeChatMessages = messages.filter(m => 
        (m.sender._id === selectedChat?._id || m.recipient?._id === selectedChat?._id)
    );

    return (
        <div className="flex bg-brand-surface/40 border border-brand-border/40 rounded-md overflow-hidden h-[calc(100vh-200px)] backdrop-blur-3xl shadow-2xl relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-luxury-rose/5 blur-[120px] -mr-48 -mt-48 pointer-events-none" />
            
            {/* Contact Panel */}
            <div className={`w-full md:w-80 border-r border-brand-border/40 flex flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-8 border-b border-brand-border/40 bg-black/40">
                    <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6">Institutional Grid</h3>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-focus-within:text-brand-primary" size={14} />
                        <input 
                            type="text" 
                            placeholder="Search contacts..." 
                            className="w-full bg-slate-900/60 border border-slate-800 py-3.5 pl-11 pr-4 rounded-md text-[10px] font-bold uppercase tracking-widest text-white placeholder:text-slate-700 focus:outline-none focus:border-brand-primary/40 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {filteredContacts.map((contact) => (
                        <motion.button
                            whileHover={{ x: 4 }}
                            key={contact._id}
                            onClick={() => setSelectedChat(contact)}
                            className={`w-full flex items-center gap-4 p-5 rounded-md transition-all group relative overflow-hidden ${selectedChat?._id === contact._id ? 'bg-luxury-rose/10 border border-luxury-rose/20' : 'hover:bg-slate-800/40 border border-transparent'}`}
                        >
                            <div className="relative">
                                <div className={`absolute -inset-0.5 rounded-full blur-[2px] ${selectedChat?._id === contact._id ? 'bg-luxury-rose' : 'bg-slate-700'}`} />
                                <img src={contact.photo || '/avatar.png'} className="w-11 h-11 rounded-full relative z-10 grayscale-[50%] group-hover:grayscale-0 transition-all object-cover" alt="" />
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black z-20" />
                            </div>
                            <div className="text-left relative z-10 overflow-hidden">
                                <p className={`text-[11px] font-black uppercase tracking-wider truncate mb-1 ${selectedChat?._id === contact._id ? 'text-white' : 'text-slate-300'}`}>{contact.firstName} {contact.lastName}</p>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-1.5 py-0.5 rounded ${contact.role === 'Teacher' ? 'bg-blue-500/10 text-blue-400' : 'bg-brand-primary/10 text-brand-primary'}`}>
                                        {contact.role}
                                    </span>
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Chat Panel */}
            <div className={`flex-1 flex flex-col relative ${!selectedChat ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
                {selectedChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-8 border-b border-brand-border/40 flex items-center justify-between bg-black/40 backdrop-blur-md sticky top-0 z-20">
                            <div className="flex items-center gap-6">
                                <button onClick={() => setSelectedChat(null)} className="md:hidden p-2 text-slate-500"><ArrowLeft size={20} /></button>
                                <div className="relative">
                                    <img src={selectedChat.photo || '/avatar.png'} className="w-12 h-12 rounded-md object-cover grayscale-[30%]" alt="" />
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-black text-white uppercase tracking-tighter italic leading-none mb-1">{selectedChat.firstName} {selectedChat.lastName}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Operational Status: En-Route</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button className="p-3 bg-slate-900 border border-slate-800 rounded-md text-slate-500 hover:text-white transition-all"><MoreVertical size={18} /></button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar relative">
                            {activeChatMessages.map((msg, idx) => {
                                const isOwn = msg.sender._id === currentUser._id;
                                return (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={idx} 
                                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[80%] md:max-w-[60%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                                            <div className={`p-6 rounded-md text-sm font-medium leading-relaxed tracking-wide ${isOwn ? 'bg-luxury-rose text-white shadow-[0_10px_30px_rgba(244,63,94,0.15)] rounded-br-none italic' : 'bg-slate-900 border border-slate-800 text-slate-300 rounded-bl-none'}`}>
                                                {msg.content}
                                            </div>
                                            <div className="flex items-center gap-4 mt-3">
                                                <span className="text-[9px] font-black text-slate-700 uppercase italic tracking-widest">
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {isOwn && <ShieldCheck size={12} className="text-luxury-rose opacity-40" />}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Input Area */}
                        <div className="p-8 border-t border-brand-border/40 bg-black/60 sticky bottom-0 z-20">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-6">
                                <button type="button" className="text-slate-600 hover:text-luxury-rose transition-all"><Paperclip size={20} /></button>
                                <div className="flex-1 relative group">
                                    <input 
                                        type="text" 
                                        placeholder="Transmit data..." 
                                        className="w-full bg-slate-900/40 border border-slate-800 py-4 px-8 rounded-md text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-luxury-rose/40 transition-all font-medium italic"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-4 opacity-40 group-focus-within:opacity-100 transition-all">
                                        <Smile size={18} className="text-slate-600 hover:text-amber-400 cursor-pointer" />
                                        <Mic size={18} className="text-slate-600 hover:text-luxury-rose cursor-pointer" />
                                    </div>
                                </div>
                                <motion.button 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="submit" 
                                    className="p-4 bg-luxury-rose hover:bg-rose-500 text-white rounded-md transition-all shadow-xl shadow-luxury-rose/20 active:shadow-inner"
                                >
                                    <Send size={22} />
                                </motion.button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center opacity-30 text-center p-20">
                        <div className="relative mb-8">
                            <div className="w-24 h-24 rounded-md border-2 border-dashed border-slate-800 animate-spin-slow"></div>
                            <MessageSquare size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-800" />
                        </div>
                        <h4 className="text-xl font-black text-white uppercase italic tracking-widest leading-none mb-4">No Active Sync</h4>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] max-w-sm mx-auto leading-relaxed">Select a terminal node from the left grid to establish a secure bilateral communication channel.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;
