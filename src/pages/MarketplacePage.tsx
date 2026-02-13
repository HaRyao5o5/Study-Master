import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { collection, getDocs, orderBy, query, doc, setDoc, deleteDoc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from '../lib/firebase';
import { useApp } from '../context/AppContext';
import { PublicCourse } from '../types';
import { Download, Search, User, Heart, Calendar } from 'lucide-react';

const MarketplacePage: React.FC = () => {
    const { importCourse, user } = useApp();
    const [publicCourses, setPublicCourses] = useState<PublicCourse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [likedCourseIds, setLikedCourseIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const q = query(collection(db, 'public_courses'), orderBy('publishedAt', 'desc'));
                const querySnapshot = await getDocs(q);
                const fetched: PublicCourse[] = [];
                querySnapshot.forEach((d) => {
                    fetched.push({ ...d.data(), id: d.id } as PublicCourse);
                });
                setPublicCourses(fetched);

                // ログイン中のユーザーのいいね状態を取得
                if (user?.uid && fetched.length > 0) {
                    const likedIds = new Set<string>();
                    await Promise.all(
                        fetched.map(async (course) => {
                            const likeDoc = await getDoc(doc(db, 'public_courses', course.id, 'likes', user.uid));
                            if (likeDoc.exists()) likedIds.add(course.id);
                        })
                    );
                    setLikedCourseIds(likedIds);
                }
            } catch (err) {
                console.error("Failed to fetch public courses", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, [user]);

    const filteredCourses = useMemo(() => {
        return publicCourses.filter(c => 
            c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
            c.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [publicCourses, searchTerm]);

    const handleDownload = async (course: PublicCourse) => {
        await importCourse(course);
    };

    const handleToggleLike = useCallback(async (courseId: string) => {
        if (!user?.uid) return;
        const isLiked = likedCourseIds.has(courseId);
        const likeRef = doc(db, 'public_courses', courseId, 'likes', user.uid);
        const courseRef = doc(db, 'public_courses', courseId);

        try {
            if (isLiked) {
                await deleteDoc(likeRef);
                await updateDoc(courseRef, { likes: increment(-1) });
                setLikedCourseIds(prev => { const next = new Set(prev); next.delete(courseId); return next; });
                setPublicCourses(prev => prev.map(c => c.id === courseId ? { ...c, likes: Math.max(0, (c.likes || 1) - 1) } : c));
            } else {
                await setDoc(likeRef, { likedAt: Date.now() });
                await updateDoc(courseRef, { likes: increment(1) });
                setLikedCourseIds(prev => new Set(prev).add(courseId));
                setPublicCourses(prev => prev.map(c => c.id === courseId ? { ...c, likes: (c.likes || 0) + 1 } : c));
            }
        } catch (e) {
            console.error('いいねの更新に失敗:', e);
        }
    }, [user, likedCourseIds]);

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in pb-24">
            <header className="mb-8 text-center">
                <h1 className="text-3xl font-black text-gray-800 dark:text-white mb-4">
                    📚 みんなのコース (マーケットプレイス)
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    他のユーザーが作成したコースをダウンロードして学習しましょう。
                </p>
            </header>

            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="コースを検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                />
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-500">
                    読み込み中...
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.length > 0 ? filteredCourses.map((course) => (
                        <PublicCourseCard 
                            key={course.id} 
                            course={course} 
                            onDownload={() => handleDownload(course)} 
                            isOwn={course.authorId === user?.uid}
                            isLiked={likedCourseIds.has(course.id)}
                            onToggleLike={() => handleToggleLike(course.id)}
                            isLoggedIn={!!user}
                        />
                    )) : (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            コースが見つかりませんでした。
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

interface PublicCourseCardProps {
    course: PublicCourse;
    onDownload: () => void;
    isOwn: boolean;
    isLiked: boolean;
    onToggleLike: () => void;
    isLoggedIn: boolean;
}

const PublicCourseCard: React.FC<PublicCourseCardProps> = ({ course, onDownload, isOwn, isLiked, onToggleLike, isLoggedIn }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow flex flex-col h-full">
            <div className={`h-2 w-full ${course.color ? '' : 'bg-gradient-to-r from-blue-400 to-purple-500'}`} style={{ backgroundColor: course.color }} />
            
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white line-clamp-2">{course.title}</h3>
                    <button
                        onClick={onToggleLike}
                        disabled={!isLoggedIn}
                        className={`flex items-center text-xs font-bold px-2 py-1 rounded-full transition-all ${
                            isLiked
                                ? 'text-pink-500 bg-pink-50 dark:bg-pink-900/20 hover:bg-pink-100 dark:hover:bg-pink-900/40'
                                : 'text-gray-400 bg-gray-50 dark:bg-gray-700 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20'
                        } ${!isLoggedIn ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                        title={!isLoggedIn ? 'いいねするにはログインが必要です' : isLiked ? 'いいねを取り消す' : 'いいね'}
                    >
                        <Heart size={12} className={`mr-1 ${isLiked ? 'fill-current' : ''}`} />
                        {course.likes || 0}
                    </button>
                </div>

                <div className="flex items-center text-xs text-gray-500 mb-3">
                    <User size={12} className="mr-1" />
                    <span className="mr-3 truncate max-w-[100px]">{course.authorName}</span>
                    <Calendar size={12} className="mr-1" />
                    <span>{new Date(course.publishedAt).toLocaleDateString()}</span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg flex-1">
                    {course.description || "説明はありません。"}
                </p>

                <div className="mt-auto">
                    <div className="flex flex-wrap gap-1 mb-3">
                         {course.tags.map(tag => (
                             <span key={tag} className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 px-2 py-1 rounded">
                                 #{tag}
                             </span>
                         ))}
                         <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                             {course.quizzes.length}セット
                         </span>
                    </div>

                    {isOwn ? (
                        <button
                            disabled
                            className="w-full flex items-center justify-center py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-400 rounded-lg font-bold text-sm cursor-not-allowed"
                        >
                            あなたが作成したコースです
                        </button>
                    ) : (
                        <button
                            onClick={onDownload}
                            className="w-full flex items-center justify-center py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-colors shadow-sm active:translate-y-0.5"
                        >
                            <Download size={16} className="mr-2" />
                            ダウンロード
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MarketplacePage;
