import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle2, AlertCircle, Eye, EyeOff, CheckCheck } from 'lucide-react';
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

  const handleNotificationClick = async (notification: BackendNotification) => {
    // mark as read and then open sightings modal for sighting notifications
    try {
      await handleMarkOneRead(notification._id);
    } catch (err) {
      // ignore; markOneRead already rolls back on error
      console.error(err);
    }

    if (notification.type === 'new_sighting' && notification.postId) {
      const postId = typeof notification.postId === 'string'
        ? notification.postId
        : notification.postId._id;
      const sightingId = notification.referenceId ? `&sightingId=${encodeURIComponent(notification.referenceId)}` : '';
      navigate(`/profile?sightingPostId=${encodeURIComponent(postId)}${sightingId}`);
      return;
    }

    const postOwnerId =
      notification.postId && typeof notification.postId !== 'string'
        ? typeof notification.postId.userId === 'string'
          ? notification.postId.userId
          : notification.postId.userId?._id
        : undefined;

    if (notification.type === 'claim_approved') {
      const targetUserId = notification.referenceId || postOwnerId;
      if (targetUserId) {
        navigate(`/chat?chatWith=${encodeURIComponent(targetUserId)}`);
        return;
      }
    }

    if (notification.type === 'claim_approved_owner' && notification.referenceId) {
      navigate(`/chat?chatWith=${encodeURIComponent(notification.referenceId)}`);
      return;
    }

    if (notification.postId && typeof notification.postId !== 'string') {
      const post = notification.postId as BackendNotificationPost;
      navigate(`/profile?sightingPostId=${encodeURIComponent(post._id || String(post._id))}`);
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
        return (
          <div className="bg-blue-50 p-2.5 rounded-full">
            <Eye className="h-5 w-5 text-blue-600" />
          </div>
        );
      case 'new_claim':
        return (
          <div className="bg-amber-50 p-2.5 rounded-full">
            <AlertCircle className="h-5 w-5 text-amber-600" />
          </div>
        );
      case 'claim_approved':
        return (
          <div className="bg-emerald-50 p-2.5 rounded-full">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
        );
      case 'claim_rejected':
        return (
          <div className="bg-rose-50 p-2.5 rounded-full">
            <EyeOff className="h-5 w-5 text-rose-600" />
          </div>
        );
      default:
        return (
          <div className="bg-gray-50 p-2.5 rounded-full">
            <Bell className="h-5 w-5 text-gray-600" />
          </div>
        );
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
      case 'claim_approved_owner':
        return `${t('notifications.claim_approved_owner')}${postName}${t('notifications.claim_approved_owner_suffix')}`;
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
    <div className="min-h-screen pt-16 pb-6 px-4 sm:px-6 lg:px-8 bg-gray-50/50" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200/60">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center">
              <Bell className="h-6 w-6 text-gray-700" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{t('notifications.title')}</h1>
                {unreadCount > 0 && (
                  <span className="bg-primary/20 text-primary-700 text-xs font-bold px-2.5 py-1 rounded-full">
                    {unreadCount} {t('notifications.unread')}
                  </span>
                )}
              </div>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm cursor-pointer"
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
                className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-60"
              >
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <Bell className="h-10 w-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {t('notifications.empty')}
                </h3>
                <p className="text-gray-500 max-w-sm mt-1">
                  {language === 'ar' 
                    ? 'عندما تتلقى إشعارات جديدة حول التقارير والمطالبات، ستظهر هنا.'
                    : 'When you receive new notifications about reports and claims, they will appear here.'}
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="mt-8 px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold cursor-pointer transition-all duration-300 hover:bg-[#e6dcaf] hover:text-slate-900 hover:shadow-md hover:-translate-y-0.5"
                >
                  {language === 'ar' ? 'العودة للرئيسية' : 'Return Home'}
                </button>
              </motion.div>
            ) : (
              notifications.map((notification, index) => (
                <motion.div
                  key={notification._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => handleNotificationClick(notification)}
                  className={`relative overflow-hidden p-5 rounded-2xl border transition-all duration-300 cursor-pointer group ${
                    notification.isRead
                      ? 'bg-white border-gray-200 hover:border-gray-300 shadow-xs hover:shadow-sm'
                      : 'bg-white border-primary/30 shadow-sm hover:border-primary/50 hover:shadow-md'
                  }`}
                >
                  {!notification.isRead && (
                    <div className="absolute top-0 inset-s-0 w-1.5 h-full bg-primary" />
                  )}
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-base leading-snug mb-1.5 ${notification.isRead ? 'text-gray-700 font-medium' : 'text-gray-900 font-semibold'}`}>
                        {getNotificationText(notification)}
                      </p>
                      <p className={`text-sm flex items-center gap-1.5 ${notification.isRead ? 'text-gray-500' : 'text-primary-600 font-medium'}`}>
                        {!notification.isRead && <span className="block w-1.5 h-1.5 rounded-full bg-primary ml-1 mr-1"></span>}
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
