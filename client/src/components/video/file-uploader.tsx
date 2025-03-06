"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthingClient";

interface FileUploadProps {
  onUploadComplete: (videoUrl: string) => void;
  onUploadError: (error: string) => void;
  maxSizeMB?: number;
}

export function FileUpload({
  onUploadComplete,
  onUploadError,
  maxSizeMB = 10,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize the uploadthing client
  const { startUpload, permittedFileInfo } = useUploadThing("videoUploader", {
    onClientUploadComplete: (res) => {
      if (res?.[0]) {
        onUploadComplete(res[0].ufsUrl);
      }
    },
    onUploadError: (error) => {
      onUploadError(error.message);
    },
  });

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = async (file: File) => {
    // Check file type
    if (!file.type.startsWith("video/")) {
      onUploadError("Please select a video file");
      return;
    }

    // Check file size
    if (file.size > maxSizeBytes) {
      onUploadError(`File size exceeds the ${maxSizeMB}MB limit`);
      return;
    }

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSelectedFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);

    try {
      // Upload using uploadthing
      await startUpload([selectedFile]);

      // Note: No need to manually set upload complete here
      // The onClientUploadComplete callback handles this
    } catch (error) {
      onUploadError("An unexpected error occurred during upload");
    } finally {
      setIsUploading(false);
    }
  };

  const clearSelection = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="video/*"
        onChange={handleFileInputChange}
      />

      {!selectedFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            isDragging ? "border-primary bg-primary/5" : "border-gray-300"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-8 w-8 mx-auto text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">
            Drag and drop your video file here, or click to browse
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Maximum file size: {maxSizeMB}MB
          </p>
          <Button variant="secondary" size="sm" className="mt-4">
            Select File
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium truncate">{selectedFile.name}</div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={clearSelection}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {previewUrl && (
            <div className="flex justify-center items-center mt-4">
              <video
                src={previewUrl}
                className=" w-[600px] h-[400px] rounded-md mb-3"
                controls
              />
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={handleUpload} disabled={isUploading}>
              {isUploading ? "Uploading..." : "Upload Video"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
