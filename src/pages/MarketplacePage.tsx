import React, { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from '../lib/firebase';
import { useApp } from '../context/AppContext';
import { PublicCourse } from '../types';
import { Download, Search, User, Heart, Calendar } from 'lucide-react';

const MarketplacePage: React.FC = () => {
    const { importCourse, user } = useApp();
    const [publicCourses, setPublicCourses] = useState<PublicCourse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                // Fetch all public courses ordered by publishedAt desc
                const q = query(collection(db, 'public_courses'), orderBy('publishedAt', 'desc'));
                const querySnapshot = await getDocs(q);
                const fetched: PublicCourse[] = [];
                querySnapshot.forEach((doc) => {
                    // We attach the Doc ID as the ID for PublicCourse usage
                    fetched.push({ ...doc.data(), id: doc.id } as PublicCourse);
                });
                setPublicCourses(fetched);
            } catch (err) {
                console.error("Failed to fetch public courses", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const filteredCourses = useMemo(() => {
        return publicCourses.filter(c => 
            c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
            c.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [publicCourses, searchTerm]);

    const handleDownload = async (course: PublicCourse) => {
        // Confirmation? importCourse handles logic.
        // Maybe check if already exists?
        // Simple check by title? Or just let user duplicate.
        // Let's passed to importCourse.
        await importCourse(course);
    };

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

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto mb-10">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="text-gray-400" size={20} />
                </div>
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
                        <PublicCourseCard key={course.id} course={course} onDownload={() => handleDownload(course)} isOwn={course.authorId === user?.uid} />
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

const PublicCourseCard: React.FC<{ course: PublicCourse; onDownload: () => void; isOwn: boolean }> = ({ course, onDownload, isOwn }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow flex flex-col h-full">
            <div className={`h-2 w-full ${course.color ? '' : 'bg-gradient-to-r from-blue-400 to-purple-500'}`} style={{ backgroundColor: course.color }} />
            
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white line-clamp-2">{course.title}</h3>
                    {course.likes > 0 && (
                         <div className="flex items-center text-xs text-pink-500 font-bold bg-pink-50 dark:bg-pink-900/20 px-2 py-1 rounded-full">
                             <Heart size={12} className="mr-1 fill-current" />
                             {course.likes}
                         </div>
                    )}
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

                    <button
                        onClick={onDownload}
                        className="w-full flex items-center justify-center py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-colors shadow-sm active:translate-y-0.5"
                    >
                        <Download size={16} className="mr-2" />
                        ダウンロード
                    </button>
                    {isOwn && <p className="text-center text-xs text-gray-400 mt-2">あなたが作成したコースです</p>}
                </div>
            </div>
        </div>
    );
};

export default MarketplacePage;
