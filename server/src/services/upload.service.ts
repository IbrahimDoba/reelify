import { UTApi, UTFile } from "uploadthing/server";
import { v4 as uuidv4 } from 'uuid';
import fsPromises from 'node:fs/promises';
import path from 'node:path';

// Initialize UploadThing API
const utapi = new UTApi();

// Upload a file from a path
export const uploadFileFromPath = async (filePath: string, fileName?: string) => {
  try {
    const fileBuffer = await fsPromises.readFile(filePath);
    const actualFileName = fileName || path.basename(filePath);
    
    // Create UTFile from the buffer
    const file = new UTFile([fileBuffer], actualFileName, {
      customId: uuidv4()
    });
    
    // Upload to UploadThing
    const response = await utapi.uploadFiles([file]);
    return response;
  } catch (error) {
    console.error('UploadThing upload error:', error);
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`UploadThing upload failed: ${message}`);
  }
};

export default {
  uploadFileFromPath,
  utapi
};