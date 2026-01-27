import React, { useState, useRef } from 'react';
import { Upload, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageCropperProps {
  onCropComplete: (file: Blob, settings: { scale: number, position: { x: number, y: number } }) => void;
  initialImage?: string;
  initialScale?: number;
  initialPosition?: { x: number, y: number };
}

const ImageCropper: React.FC<ImageCropperProps> = ({ 
  onCropComplete, 
  initialImage,
  initialScale = 1, 
  initialPosition = { x: 0, y: 0 } 
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(initialImage || null);
  const [scale, setScale] = useState(initialScale);
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLandscape, setIsLandscape] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImageSrc(e.target.result as string);
          // Reset settings for new image
          setScale(1);
          setPosition({ x: 0, y: 0 });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { naturalWidth, naturalHeight } = e.currentTarget;
      setIsLandscape(naturalWidth > naturalHeight);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Generate cropped image on change or request (here we provide a helper to get blob)
  const getCroppedImg = async () => {
    if (!imageRef.current || !imageSrc) return null;

    const canvas = document.createElement('canvas');
    const size = 300; // Output size
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    // Draw image with transforms
    const img = imageRef.current;
    
    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip(); // Circular crop
    
    // Translate to center to apply scale from center
    ctx.translate(size / 2, size / 2);
    ctx.translate(position.x * (size / 200), position.y * (size / 200)); // Adjust for output size factor (approx 1.5 if container is 200)
    ctx.scale(scale, scale);
    
    // Draw centered
    // We need to know aspect ratio to draw nicely
    const aspect = img.naturalWidth / img.naturalHeight;
    let drawW, drawH;
    if (aspect > 1) {
        drawH = size;
        drawW = size * aspect;
    } else {
        drawW = size;
        drawH = size / aspect;
    }
    
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    return new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
            if (blob) {
                 onCropComplete(blob, { scale, position });
                 resolve(blob);
            }
        }, 'image/jpeg', 0.9);
    });
  };
  
  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {!imageSrc ? (
         <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer relative">
            <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
                <Upload size={32} className="mb-2" />
                <span className="text-sm font-bold">画像をアップロード</span>
            </div>
         </div>
      ) : (
        <div className="flex flex-col items-center animate-fade-in">
           <div className="relative overflow-hidden w-[200px] h-[200px] rounded-full ring-4 ring-blue-500/20 shadow-xl bg-gray-100 dark:bg-gray-900 cursor-move mb-4"
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
           >
              <img 
                ref={imageRef}
                src={imageSrc}
                alt="Profile Preview"
                onLoad={handleImageLoad}
                className="absolute top-1/2 left-1/2 max-w-none pointer-events-none select-none"
                style={{
                    transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${scale})`,
                    // Conditional sizing based on image orientation
                    ...(isLandscape ? { height: '100%', width: 'auto' } : { width: '100%', height: 'auto' })
                }}
              />
           </div>
           
           <div className="w-full flex items-center space-x-4 px-4">
              <ZoomOut size={20} className="text-gray-400" />
              <input 
                type="range" 
                min="1" 
                max="3" 
                step="0.1" 
                value={scale} 
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="flex-1 accent-blue-500 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <ZoomIn size={20} className="text-gray-400" />
           </div>

           <p className="text-xs text-center mt-2 text-gray-400">ドラッグして位置を調整</p>

           <div className="flex gap-2 mt-4 w-full">
              <button 
                onClick={() => setImageSrc(null)}
                className="flex-1 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                画像を変更
              </button>
              <button 
                onClick={() => getCroppedImg()}
                className="flex-1 py-2 text-sm font-bold text-white bg-blue-500 hover:bg-blue-600 rounded-lg shadow-md"
              >
                決定
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default ImageCropper;
