import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, CheckCircle2, AlertCircle, Eye, EyeOff, CheckCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { notificationApi, type BackendNotification, type BackendNotificationPost } from '@/lib/api';
import { getSocket } from '@/lib/socket';

export default function Notifications() {
  const { token, isAuthenticated } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<BackendNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      navigate('/login');
      return;
    }

    const fetchNotifications = async () => {
      try {
        const res = await notificationApi.getMyNotifications(token);
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchNotifications();

    // Listen for realtime pushes so the page stays current without reload.
    const socket = getSocket();
    if (!socket) return;
    const handleNew = (n: BackendNotification) => {
      setNotifications((prev) => {
        if (prev.find((x) => x._id === n._id)) return prev;
        return [n, ...prev];
      });
      setUnreadCount((c) => c + 1);
    };
    const handleUnreadCount = ({ unreadCount: count }: { unreadCount: number }) => {
      setUnreadCount(count);
    };
    socket.on('notification:new', handleNew);
    socket.on('notification:unread-count', handleUnreadCount);

    return () => {
      socket.off('notification:new', handleNew);
      socket.off('notification:unread-count', handleUnreadCount);
    };
  }, [isAuthenticated, token, navigate]);

  const handleMarkOneRead = async (id: string) => {
    if (!token) return;
    const target = notifications.find((n) => n._id === id);
    if (!target || target.isRead) return;

    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));

    try {
      await notificationApi.markOneRead(id, token);
    } catch (err) {
      console.error('Failed to mark as read:', err);
      // rollback
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: false } : n))
      );
      setUnreadCount((c) => c + 1);
    }
  };

  const handleMarkAllRead = async () => {
    if (!token || unreadCount === 0) return;
    const previous = notifications;
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await notificationApi.markAllRead(token);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      setNotifications(previous);
      setUnreadCount(previous.filter((n) => !n.isRead).length);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_sighting':
        return <Eye className="h-6 w-6 text-blue-500" />;
      case 'new_claim':
        return <AlertCircle className="h-6 w-6 text-yellow-500" />;
      case 'claim_approved':
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case 'claim_rejected':
        return <EyeOff className="h-6 w-6 text-red-500" />;
      default:
        return <Bell className="h-6 w-6 text-gray-500" />;
    }
  };

  const getNotificationText = (notification: BackendNotification) => {
    let postName = '';
    if (notification.postId && typeof notification.postId !== 'string') {
      postName = (notification.postId as BackendNotificationPost).name || '';
    }

    switch (notification.type) {
      case 'new_sighting':
        return `${t('notifications.new_sighting')}${postName}`;
      case 'new_claim':
        return `${t('notifications.new_claim')}${postName}`;
      case 'claim_approved':
        return `${t('notifications.claim_approved')}${postName}`;
      case 'claim_rejected':
        return `${t('notifications.claim_rejected')}${postName}`;
      default:
        return postName;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-12 px-4 sm:px-6 lg:px-8 bg-gray-50" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Bell className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900">{t('notifications.title')}</h1>
            {unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <CheckCheck className="h-4 w-4" />
              {t('notifications.markAllRead')}
            </button>
          )}
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {notifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-12 text-center shadow-xs border border-gray-100"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                    <Check className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t('notifications.empty')}
                </h3>
              </motion.div>
            ) : (
              notifications.map((notification, index) => (
                <motion.div
                  key={notification._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleMarkOneRead(notification._id)}
                  className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    notification.isRead
                      ? 'bg-white border-gray-100 hover:bg-gray-50'
                      : 'bg-primary-50/50 border-primary-200 hover:bg-primary-50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-medium text-gray-900">
                        {getNotificationText(notification)}
                      </p>
                      {notification.message && (
                        <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-800 break-words whitespace-pre-wrap">
                          <strong>{t('notifications.reason') || 'Reason'}:</strong> {notification.message}
                        </div>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(notification.createdAt).toLocaleDateString(
                          language === 'ar' ? 'ar-EG' : 'en-US',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }
                        )}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <span
                        className="mt-2 h-2.5 w-2.5 rounded-full bg-primary shrink-0"
                        aria-label="unread"
                      ></span>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
