import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markRead, deleteNotification, markAllRead } from '../../redux/slice/notification.slice';
import { Bell, Check, Trash2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LibrarianNotifications = () => {
  const dispatch = useDispatch();
  const { items: notifications = [], loading } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleMarkAsRead = (id) => dispatch(markRead(id));
  const handleDelete = (id) => dispatch(deleteNotification(id));
  const handleMarkAllAsRead = () => dispatch(markAllRead());

  if (loading && notifications.length === 0) {
    return <div className="p-8 text-center text-slate-400">Loading Notifications...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-widest italic flex items-center gap-3">
            <Bell className="text-librarian-primary" size={28} />
            Library Alerts
          </h1>
          <p className="text-sm text-slate-400 mt-1 uppercase tracking-widest text-[10px]">Updates & Notifications</p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 bg-brand-surface border border-librarian-primary/30 text-librarian-primary px-4 py-2 rounded-md hover:bg-librarian-primary/10 transition-colors uppercase tracking-widest text-[10px] font-black italic"
          >
            <CheckCircle2 size={16} /> Mark All as Read
          </button>
        )}
      </div>

      <div className="bg-brand-surface border border-brand-border rounded-xl p-6 relative overflow-hidden min-h-[500px]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-librarian-primary/5 rounded-full blur-3xl -mr-10 -mt-10" />
        
        {notifications.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-slate-500">
            <Bell size={32} className="mb-2 opacity-50" />
            <p className="font-outfit uppercase tracking-widest text-xs">No Active Alerts</p>
          </div>
        ) : (
          <div className="space-y-3 relative z-10">
            <AnimatePresence>
              {notifications.map((notif) => (
                <motion.div
                  key={notif._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`p-4 rounded-lg border transition-all ${notif.isRead ? 'bg-brand-background border-brand-border opacity-70' : 'bg-librarian-primary/5 border-librarian-primary/30'}`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {!notif.isRead && <span className="w-2 h-2 rounded-full bg-librarian-primary animate-pulse" />}
                        <h3 className={`text-sm font-black uppercase tracking-wide truncate ${notif.isRead ? 'text-slate-300' : 'text-librarian-primary'}`}>
                          {notif.title}
                        </h3>
                      </div>
                      <p className="text-slate-400 text-xs mb-2 leading-relaxed">{notif.message}</p>
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic flex items-center gap-1">
                        {new Date(notif.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!notif.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notif._id)}
                          className="p-1.5 rounded-md hover:bg-librarian-primary/20 text-librarian-primary transition-colors"
                          title="Mark as Read"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notif._id)}
                        className="p-1.5 rounded-md hover:bg-librarian-primary/20 text-librarian-primary transition-colors"
                        title="Delete Notification"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default LibrarianNotifications;
