import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit3, ArrowLeft, Calendar, MessageCircle, User as UserIcon, Award, Sparkles, Zap, Trophy, Crown, Flame, Timer, BookOpen, Library, Globe, Download, LucideIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getProfile } from '../lib/firebaseProfile';
import { getEffectiveStreak } from '../utils/gamification';
import { Profile } from '../types';
import { ACHIEVEMENTS } from '../data/achievements';

const iconMap: Record<string, LucideIcon> = {
  Sparkles,
  Zap,
  Trophy,
  Crown,
  Flame,
  FlameKindle: Flame,
  Timer,
  BookOpen,
  Library,
  Globe,
  Download
};

import ProfileEditor from '../components/profile/ProfileEditor';
import { updateProfile, uploadAvatar } from '../lib/firebaseProfile';
import BadgesView from '../components/profile/BadgesView';

const ProfilePage = () => {
    const { uid } = useParams();
    const { user, profile: myProfile, isProfileLoading, userStats } = useApp();
    const navigate = useNavigate();
    
    const isOwnProfile = !uid || (user && user.uid === uid);
    
    // State
    const [profile, setProfile] = useState<Profile | null>(null);
    const [targetStats, setTargetStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showEditor, setShowEditor] = useState(false);

    // Load profile logic
    useEffect(() => {
        const load = async () => {
            if (isOwnProfile) {
                // Determine completion based on global profile loading state
                if (!isProfileLoading) {
                    if (myProfile) {
                        setProfile(myProfile);
                        setTargetStats(userStats);
                    } else if (user) {
                        // User exists but no profile doc yet -> use default
                        setProfile({
                            uid: user.uid,
                            name: user.displayName || 'No Name',
                            avatarId: 'avatar-1'
                        } as Profile);
                        setTargetStats(userStats);
                        // Optional: auto-open editor
                        // setShowEditor(true); 
                    }
                    setLoading(false);
                }
            } else if (uid) {
                try {
                    const { getUserData } = await import('../lib/firebase');
                    const [profileData, userData] = await Promise.all([
                        getProfile(uid),
                        getUserData(uid)
                    ]);
                    setProfile(profileData);
                    if (userData && userData.userStats) {
                        setTargetStats(userData.userStats);
                    }
                } catch (e) {
                    console.error(e);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };
        load();
    }, [uid, isOwnProfile, myProfile, isProfileLoading, user, userStats]);

    const handleSaveProfile = async (data: any) => {
        if (!user) return;
        
        try {
            // Handle avatar upload if Blob is present
            let finalAvatarUrl: string | null | undefined = profile?.customAvatarUrl;
            if (data.mode === 'image' && data.customAvatarBlob) {
                 finalAvatarUrl = await uploadAvatar(user.uid, data.customAvatarBlob);
            } else if (!data.customAvatarUrl && !data.customAvatarBlob) {
                 finalAvatarUrl = null;
            }

            const updateData = {
                name: data.name,
                username: data.username,
                bio: data.bio || '',
                avatarId: data.avatarId || 'avatar-1',
                customAvatarUrl: finalAvatarUrl || null, // Set to null to remove field in Firestore
                avatarSettings: data.avatarSettings || null,
                selectedBadgeId: data.selectedBadgeId || null,
                socialLinks: data.socialLinks || null
            };

            // Use imported updateProfile directly
            await updateProfile(user.uid, updateData, profile?.username);
            
            // Refresh local state immediately without reload
            const freshProfile = await getProfile(user.uid);
            setProfile(freshProfile);
        } catch (error) {
            console.error('Failed to save profile:', error);
            throw error; // Propagate to ProfileEditor to handle UI state
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (!profile && !isOwnProfile) return (
        <div className="min-h-screen flex flex-col items-center justify-center text-gray-500">
            <h2 className="text-2xl font-bold mb-2">ユーザーが見つかりません</h2>
            <button onClick={() => navigate('/')} className="text-blue-500 hover:underline">ホームへ戻る</button>
        </div>
    );
    
    // Fallback for safe rendering if profile is somehow null for own profile (should be caught by useEffect default)
    const effectiveProfile = profile || { uid: '', name: 'Guest', avatarId: 'avatar-1' } as Profile;

    // Avatar Logic

    const hasCustomImage = !!effectiveProfile.customAvatarUrl;

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 pb-20">
            {/* Banner Area */}
            <div className="h-40 md:h-60 bg-gradient-to-r from-blue-400 to-indigo-500 relative">
                <button 
                    onClick={() => navigate('/')} 
                    className="absolute top-4 left-4 bg-black/20 hover:bg-black/30 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                >
                    <ArrowLeft size={24} className="text-white" />
                </button>
            </div>

            {/* Profile Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
                <div className="flex flex-col md:flex-row items-start md:items-end gap-6 mb-6">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-gray-900 bg-white dark:bg-gray-800 shadow-xl overflow-hidden flex items-center justify-center text-6xl">
                            {hasCustomImage ? (
                                <img src={effectiveProfile.customAvatarUrl} alt={effectiveProfile.name} className="w-full h-full object-cover" />
                            ) : (
                                <UserIcon size={80} className="text-gray-300 dark:text-gray-600" />
                            )}
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="flex-1 pt-2 md:pb-4 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white truncate">
                                {effectiveProfile.name}
                            </h1>
                            {effectiveProfile.selectedBadgeId && (
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-full">
                                    {(() => {
                                        const achievement = ACHIEVEMENTS.find(a => a.id === effectiveProfile.selectedBadgeId);
                                        const Icon = achievement ? (iconMap[achievement.icon] || Trophy) : Award;
                                        return (
                                            <>
                                                <Icon size={14} className="text-amber-500" />
                                                <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                                                    {achievement?.name || '称号'}
                                                </span>
                                            </>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-bold font-mono">
                            @{effectiveProfile.username || 'unknown'}
                        </p>
                    </div>

                    {/* Actions */}
                    {isOwnProfile && (
                        <div className="md:pb-4 self-end md:self-auto w-full md:w-auto mt-4 md:mt-0">
                            <button
                                onClick={() => setShowEditor(true)}
                                className="w-full md:w-auto px-6 py-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <Edit3 size={18} /> プロフィールを編集
                            </button>
                        </div>
                    )}
                </div>

                {/* Bio & Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                    <div className="md:col-span-2 space-y-8 animate-slide-up">
                        {/* Bio */}
                        <div className="glass p-6 rounded-2xl">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <MessageCircle size={20} className="text-blue-500" />
                                自己紹介
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                {effectiveProfile.bio || "自己紹介はまだありません。"}
                            </p>
                        </div>

                        {/* Badges */}
                        <div className="glass p-6 rounded-2xl">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <Award size={20} className="text-amber-500" />
                                獲得したバッジ
                            </h3>
                            <BadgesView unlockedBadges={effectiveProfile.achievements || []} />
                        </div>

                        {/* Recent Activity / Stats Placeholder */}
                        <div className="glass p-6 rounded-2xl">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <Calendar size={20} className="text-purple-500" />
                                最近の活動
                            </h3>
                            <div className="text-gray-500 text-sm">
                                {/* Activity Log Placeholder */}
                                <p>まだアクティビティはありません。</p>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Stats/Links */}
                    <div className="space-y-6 animate-slide-up delay-100">
                        <div className="glass p-6 rounded-2xl">
                             <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-4">
                                <Calendar size={18} />
                                <span className="text-sm">2026年1月28日から利用中</span>
                             </div>
                             
                             {/* Stats Summary */}
                             <div className="grid grid-cols-2 gap-4">
                                 <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl text-center">
                                     <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                                         {targetStats?.level || 1}
                                     </div>
                                     <div className="text-xs font-bold text-gray-500">レベル</div>
                                 </div>
                                 <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-xl text-center">
                                     <div className="text-2xl font-black text-orange-600 dark:text-orange-400">
                                         {targetStats ? getEffectiveStreak(targetStats) : 0}日
                                     </div>
                                     <div className="text-xs font-bold text-gray-500">連続日数</div>
                                 </div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            {showEditor && (
                <ProfileEditor 
                    initialProfile={effectiveProfile}
                    onSave={handleSaveProfile}
                    onClose={() => setShowEditor(false)}
                />
            )}
        </div>
    );
};

export default ProfilePage;
