import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import ImageCropper from './ImageCropper';
import { Profile } from '../../types';
import { checkUsernameAvailability, validateUsername } from '../../lib/usernameRegistry';

interface ProfileEditorProps {
  initialProfile?: Profile;
  onSave: (data: any) => Promise<void>;
  onClose: () => void;
  isWelcome?: boolean;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ initialProfile, onSave, onClose, isWelcome = false }) => {
  const { user } = useApp();

  
  // Basic Info
  const [name, setName] = useState(initialProfile?.name || '');
  const [username, setUsername] = useState(initialProfile?.username || '');
  const [bio, setBio] = useState(initialProfile?.bio || '');
  

  const [customAvatarBlob, setCustomAvatarBlob] = useState<Blob | null>(null);
  const [customAvatarPreview, setCustomAvatarPreview] = useState<string | null>(initialProfile?.customAvatarUrl || null);
  const [avatarSettings, setAvatarSettings] = useState(initialProfile?.avatarSettings || { scale: 1, position: { x: 0, y: 0 } });

  // Validation State
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [usernameError, setUsernameError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Debounce Username Check
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!username || username === initialProfile?.username) {
        setUsernameStatus('idle');
        setUsernameError('');
        return;
      }

      const validation = validateUsername(username);
      if (!validation.valid) {
        setUsernameStatus('invalid');
        setUsernameError(validation.error || 'Invalid format');
        return;
      }

      setUsernameStatus('checking');
      try {
        const available = await checkUsernameAvailability(username, user?.uid);
        if (available) {
          setUsernameStatus('valid');
          setUsernameError('');
        } else {
          setUsernameStatus('invalid');
          setUsernameError('このIDは既に使用されています');
        }
      } catch (e) {
        console.error(e);
        setUsernameStatus('idle');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username, initialProfile?.username, user?.uid]);

  const handleCropComplete = (blob: Blob, settings: any) => {
      setCustomAvatarBlob(blob);
      setAvatarSettings(settings); // We might just use the blob directly, storing settings is optional unless we want re-edit
      setCustomAvatarPreview(URL.createObjectURL(blob));
  };

  const handleSave = async () => {
    if (!name.trim()) return alert('表示名を入力してください');
    if (usernameStatus === 'invalid' || usernameStatus === 'checking') return alert('ユーザーIDを確認してください');
    
    // Check if username is required
    if (!username && !initialProfile?.username) {
        // Maybe force username setting? Or auto-generate? 
        // Let's allow empty for now if logic supports it, but strictly user asked for ID.
        // Let's require it if user touches it, or encourage it.
    }

    setIsSaving(true);
    try {
      await onSave({
        name: name.trim(),
        username: username.trim() || undefined,
        bio: bio.trim(),
        avatarId: 'default',
        customAvatarBlob: customAvatarBlob,
        avatarSettings: avatarSettings,
        mode: 'image'
      });
      onClose();
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">
            {isWelcome ? 'プロフィール作成' : 'プロフィール編集'}
          </h2>
          {!isWelcome && (
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
              <X size={20} className="text-gray-500" />
            </button>
          )}
        </div>

        <div className="p-6 space-y-8 flex-1">
            {/* Avatar Section */}
            <div>
                <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider">アイコン設定</label>
                
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border border-dashed border-gray-200 dark:border-gray-700">
                    {customAvatarPreview ? (
                         <div className="text-center">
                            <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-4 ring-4 ring-white dark:ring-gray-700 shadow-lg">
                                <img src={customAvatarPreview} alt="Current" className="w-full h-full object-cover" />
                            </div>
                            <button 
                                onClick={() => {
                                    setCustomAvatarPreview(null);
                                    setCustomAvatarBlob(null);
                                }}
                                className="text-sm text-red-500 font-bold hover:underline"
                            >
                                画像を削除して初期アイコンに戻す
                            </button>
                         </div>
                    ) : (
                        <ImageCropper onCropComplete={handleCropComplete} initialImage={undefined} />
                    )}
                </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-700" />

            {/* Basic Info */}
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    表示名 <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:border-blue-500 focus:outline-none font-bold"
                        placeholder="例: 山田 太郎"
                        maxLength={20}
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    ユーザーID (@username)
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">@</span>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => {
                                // Allow only valid chars input
                                const val = e.target.value.replace(/[^a-zA-Z0-9_-]/g, '');
                                setUsername(val);
                            }}
                            className={`w-full pl-10 pr-12 py-3 rounded-xl border-2 bg-white dark:bg-gray-700 focus:outline-none font-bold font-mono ${
                                usernameStatus === 'invalid' ? 'border-red-500 focus:border-red-500' :
                                usernameStatus === 'valid' ? 'border-green-500 focus:border-green-500' :
                                'border-gray-200 dark:border-gray-600 focus:border-blue-500'
                            }`}
                            placeholder="user_id"
                            maxLength={20}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            {usernameStatus === 'checking' && <Loader2 className="animate-spin text-gray-400" size={20} />}
                            {usernameStatus === 'valid' && <Check className="text-green-500" size={20} />}
                            {usernameStatus === 'invalid' && <AlertCircle className="text-red-500" size={20} />}
                        </div>
                    </div>
                    {usernameError && (
                        <p className="text-xs text-red-500 mt-1 font-bold ml-1">{usernameError}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1 ml-1">※ 半角英数字、アンダーバー、ハイフンのみ</p>
                </div>
                
                <div>
                     <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    自己紹介
                    </label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:border-blue-500 focus:outline-none font-medium h-24 resize-none"
                        placeholder="自己紹介を入力..."
                        maxLength={160}
                    />
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 sticky bottom-0 z-10">
          <button
            onClick={handleSave}
            disabled={isSaving || !name.trim() || usernameStatus === 'checking' || usernameStatus === 'invalid'}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold rounded-xl shadow-lg shadow-blue-200 dark:shadow-none transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {isSaving ? <Loader2 className="animate-spin" /> : <Check />}
            {isSaving ? '保存中...' : 'プロフィールを保存'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditor;
