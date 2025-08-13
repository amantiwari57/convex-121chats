import { useRef, useState } from 'react';
import { Paperclip, Upload } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (mediaUrl: string, mediaType: string, fileName: string) => void;
  disabled?: boolean;
}

export function FileUpload({ onFileUpload, disabled }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Only images, videos, and GIFs are allowed');
      return;
    }

    // Validate file size (100MB)
    if (file.size > 100 * 1024 * 1024) {
      alert('File size must be less than 100MB');
      return;
    }

    setUploading(true);

    try {
      // Get presigned URL
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get upload URL');
      }

      const { uploadUrl, publicUrl } = await response.json();
      
      console.log('Starting upload to:', uploadUrl);
      console.log('File details:', { name: file.name, type: file.type, size: file.size });

      // Upload file to S3/R2
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('Upload failed:', {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          error: errorText,
          url: uploadUrl
        });
        throw new Error(`Upload failed (${uploadResponse.status}): ${uploadResponse.statusText}`);
      }

      console.log('Upload successful! File uploaded to:', publicUrl);

      // Determine media type
      const mediaType = file.type.startsWith('image/') ? 'image' : 'video';

      // Call the callback with the public URL
      onFileUpload(publicUrl, mediaType, file.name);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*,.gif"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || uploading}
      />
      
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || uploading}
        className={`
          p-2 rounded-lg transition-colors
          ${disabled || uploading 
            ? 'text-gray-400 cursor-not-allowed' 
            : 'text-gray-600 hover:text-black hover:bg-gray-100'
          }
        `}
        title="Upload image, video, or GIF"
      >
        {uploading ? (
          <div className="animate-spin">
            <Upload className="h-5 w-5" />
          </div>
        ) : (
          <Paperclip className="h-5 w-5" />
        )}
      </button>

      {/* Drag and drop overlay */}
      {dragOver && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="bg-white rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-600" />
            <p className="text-lg font-medium text-gray-900">Drop your file here</p>
            <p className="text-sm text-gray-600">Images, videos, and GIFs only</p>
          </div>
        </div>
      )}
    </>
  );
}
