'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, File, CheckCircle } from 'lucide-react';
import { uploadFile, BucketName } from '@/lib/storage';

interface FileUploadProps {
    label: string;
    name: string;
    accept?: string;
    bucket: BucketName;
    onUploadComplete: (url: string, fileName: string) => void;
    existingFile?: { url: string; name: string };
    required?: boolean;
    maxSizeMB?: number;
}

export default function FileUpload({
    label,
    name,
    accept = '.pdf,.jpg,.jpeg,.png',
    bucket,
    onUploadComplete,
    existingFile,
    required = false,
    maxSizeMB = 5,
}: FileUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(existingFile?.url || null);
    const [fileName, setFileName] = useState<string>(existingFile?.name || '');
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (selectedFile: File) => {
        setError('');

        // Validate file size
        if (selectedFile.size > maxSizeMB * 1024 * 1024) {
            setError(`File size must be less than ${maxSizeMB}MB`);
            return;
        }

        setFile(selectedFile);
        setFileName(selectedFile.name);

        // Show preview for images
        if (selectedFile.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreview(e.target?.result as string);
            };
            reader.readAsDataURL(selectedFile);
        } else {
            setPreview(null);
        }

        // Auto-upload
        await uploadFileToStorage(selectedFile);
    };

    const uploadFileToStorage = async (fileToUpload: File) => {
        setUploading(true);
        setProgress(0);

        try {
            // Simulate progress
            const progressInterval = setInterval(() => {
                setProgress((prev) => Math.min(prev + 10, 90));
            }, 200);

            const fileUrl = await uploadFile(fileToUpload, bucket);

            clearInterval(progressInterval);
            setProgress(100);
            setUploading(false);

            onUploadComplete(fileUrl, fileToUpload.name);
        } catch (err) {
            console.error('Upload error:', err);
            setError('Failed to upload file. Please try again.');
            setUploading(false);
            setFile(null);
            setPreview(null);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            handleFileSelect(droppedFile);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleRemove = () => {
        setFile(null);
        setPreview(null);
        setFileName('');
        setProgress(0);
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {!file && !existingFile ? (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-500 transition-colors"
                >
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">
                        Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                        {accept.toUpperCase()} (Max {maxSizeMB}MB)
                    </p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={accept}
                        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                        className="hidden"
                    />
                </div>
            ) : (
                <div className="border border-gray-300 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                            {preview ? (
                                <img src={preview} alt="Preview" className="w-16 h-16 object-cover rounded" />
                            ) : (
                                <File className="w-8 h-8 text-gray-400" />
                            )}
                            <div className="flex-1 min-w-0 max-w-[280px]">
                                <p className="text-sm font-medium text-gray-900 truncate break-all" title={fileName}>{fileName}</p>
                                {uploading && (
                                    <div className="mt-2">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-primary-600 h-2 rounded-full transition-all"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Uploading... {progress}%</p>
                                    </div>
                                )}
                                {!uploading && progress === 100 && (
                                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                                        <CheckCircle className="w-3 h-3" />
                                        Uploaded successfully
                                    </p>
                                )}
                            </div>
                        </div>
                        {!uploading && (
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="text-red-600 hover:text-red-800 p-1 ml-4 hover:bg-red-50 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {error && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}
