// src/pages/TimelinePage.tsx
// フォロー中ユーザーのアクティビティを表示するタイムラインページ

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Flame, Zap, Award, Clock, User as UserIcon, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTimelineFeed, getFollowing } from '../lib/social';
import { getUserData } from '../lib/firebase';
import { Activity } from '../types';
import LoadingScreen from '../components/common/LoadingScreen';

interface ActivityWithUser extends Activity {
    userName?: string;
    userAvatar?: string;
}

const TimelinePage = () => {
    const navigate = useNavigate();
    const { user } = useApp();
    const [activities, setActivities] = useState<ActivityWithUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [followingCount, setFollowingCount] = useState(0);

    useEffect(() => {
        const loadTimeline = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                // Get following list and timeline
                const [following, feed] = await Promise.all([
                    getFollowing(user.uid),
                    getTimelineFeed(user.uid, 50)
                ]);

                setFollowingCount(following.length);

                // Enrich activities with user data
                const enrichedActivities = await Promise.all(
                    feed.map(async (activity) => {
                        try {
                            const userData = await getUserData(activity.uid);
                            return {
                                ...activity,
                                userName: userData?.displayName || 'Unknown',
                                userAvatar: userData?.photoURL || null
                            };
                        } catch {
                            return {
                                ...activity,
                                userName: 'Unknown',
                                userAvatar: null
                            };
                        }
                    })
                );

                setActivities(enrichedActivities);
            } catch (e) {
                console.error('Failed to load timeline:', e);
            } finally {
                setLoading(false);
            }
        };

        loadTimeline();
    }, [user]);

    const getActivityIcon = (type: Activity['type']) => {
        switch (type) {
            case 'streak':
                return <Flame size={20} className="text-orange-500" />;
            case 'levelUp':
                return <Zap size={20} className="text-blue-500" />;
            case 'badge':
                return <Award size={20} className="text-amber-500" />;
            default:
                return <Clock size={20} className="text-gray-500" />;
        }
    };

    const getActivityMessage = (activity: ActivityWithUser) => {
        switch (activity.type) {
            case 'streak':
                return `🔥 ${activity.detail.streak}日連続で学習中！`;
            case 'levelUp':
                return `🎉 レベル${activity.detail.newLevel}に到達！`;
            case 'badge':
                return `🏆 「${activity.detail.badgeName || activity.detail.badgeId}」を獲得！`;
            default:
                return 'アクティビティを記録しました';
        }
    };

    const formatTime = (timestamp: number) => {
        const diff = Date.now() - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'たった今';
        if (minutes < 60) return `${minutes}分前`;
        if (hours < 24) return `${hours}時間前`;
        if (days < 7) return `${days}日前`;
        return new Date(timestamp).toLocaleDateString('ja-JP');
    };

    if (loading) return <LoadingScreen />;

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-gray-500 p-4">
                <Users size={48} className="mb-4 opacity-50" />
                <h2 className="text-xl font-bold mb-2">ログインが必要です</h2>
                <p className="text-sm text-center mb-4">タイムラインを見るにはログインしてください</p>
                <button 
                    onClick={() => navigate('/')} 
                    className="text-blue-500 hover:underline"
                >
                    ホームへ戻る
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto pb-20 animate-fade-in">
            {/* Header */}
            <div className="sticky top-0 z-10 glass border-b border-gray-200 dark:border-gray-700 px-4 py-4 mb-6 flex items-center justify-between">
                <div className="flex items-center">
                    <button 
                        onClick={() => navigate('/')} 
                        className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className="text-2xl font-black text-gray-800 dark:text-white flex items-center">
                        <Users size={28} className="mr-2 text-blue-500" />
                        タイムライン
                    </h2>
                </div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {followingCount}人をフォロー中
                </div>
            </div>

            <div className="px-4 space-y-4">
                {activities.length === 0 ? (
                    <div className="text-center py-20">
                        <Users size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <h3 className="text-lg font-bold text-gray-500 dark:text-gray-400 mb-2">
                            まだアクティビティがありません
                        </h3>
                        <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs mx-auto">
                            ランキングから気になるユーザーをフォローしてみましょう！
                        </p>
                        <button
                            onClick={() => navigate('/ranking')}
                            className="mt-4 px-6 py-2 bg-blue-500 text-white font-bold rounded-full hover:bg-blue-600 transition-colors"
                        >
                            ランキングを見る
                        </button>
                    </div>
                ) : (
                    activities.map((activity) => (
                        <div 
                            key={activity.id}
                            onClick={() => navigate(`/profile/${activity.uid}`)}
                            className="glass p-4 rounded-2xl flex items-start gap-4 cursor-pointer hover:shadow-md transition-all active:scale-[0.99]"
                        >
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                {activity.userAvatar ? (
                                    <img 
                                        src={activity.userAvatar} 
                                        alt={activity.userName} 
                                        className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                        <UserIcon size={24} className="text-gray-400" />
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    {getActivityIcon(activity.type)}
                                    <span className="font-bold text-gray-800 dark:text-white truncate">
                                        {activity.userName}
                                    </span>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 text-sm">
                                    {getActivityMessage(activity)}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {formatTime(activity.createdAt)}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TimelinePage;
