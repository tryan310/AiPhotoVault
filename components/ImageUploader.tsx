import React, { useState, useCallback, useRef, useEffect } from 'react';
import { UploadIcon, XCircleIcon } from './icons';

interface ImageUploaderProps {
  onFilesChanged: (files: File[]) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onFilesChanged }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onFilesChanged(files);
  }, [files, onFilesChanged]);

  const handleFileChange = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    setError(null);
    const newFiles = Array.from(selectedFiles);

    if (newFiles.length > 1) {
      setError('Please upload only 1 photo.');
      return;
    }

    const validImageFiles = newFiles.filter(file => file.type.startsWith('image/'));
    if (validImageFiles.length !== newFiles.length) {
        setError('Please upload only image files.');
        return;
    }

    setFiles(validImageFiles);
    const newPreviews = validImageFiles.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileChange(e.dataTransfer.files);
  }, []);

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setFiles([]);
    setPreviews([]);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full text-center p-4">
        <h2 className="text-3xl font-bold text-slate-100 mb-2">Upload Your Photos</h2>
        <p className="text-slate-400 mb-8">Upload 1-5 photos to get started. The first photo will be used for generation.</p>

        <div className="flex flex-col gap-8 items-center">
            {previews.length > 0 && (
                <div className="flex flex-wrap justify-center gap-4">
                {previews.map((preview, index) => (
                    <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden group">
                    <img src={preview} alt={`preview ${index}`} className="w-full h-full object-cover" />
                    <button onClick={() => removeFile(index)} className="absolute top-1 right-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <XCircleIcon className="w-6 h-6" />
                    </button>
                    </div>
                ))}
                </div>
            )}
            
            <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={openFileDialog}
                className="w-full max-w-xs py-1 px-3 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-slate-800/50 transition-colors flex flex-col items-center justify-center"
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e.target.files)}
                    className="hidden"
                />
                <UploadIcon className="w-12 h-12 text-slate-500 mb-4"/>
                <p className="text-slate-300 font-semibold">Drag & drop a photo here</p>
                <p className="text-slate-500">or click to browse</p>
                <p className="text-xs text-slate-600 mt-4">1 image only. PNG, JPG, WEBP.</p>
            </div>

            {error && <p className="text-red-400 mt-2">{error}</p>}
        </div>
    </div>
  );
};

export default ImageUploader;