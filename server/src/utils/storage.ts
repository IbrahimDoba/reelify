import { UTApi } from 'uploadthing/server';
import fs from 'node:fs';


// Correct initialization of UTApi
const utapi = new UTApi({ });

export const uploadFile = async (filePath: string) => {
  try {
    // Read the file
    const file = await fs.promises.readFile(filePath);
    
    // Generate a filename with path components stripped
    const filename = `merged-${Date.now()}.mp4`;
    
    // Upload using UploadThing
    const response = await utapi.uploadFiles([
      new File([file], filename, { type: 'video/mp4' })
    ]);
    
    if (response?.[0]?.data) {
      return response[0].data.url;
    }
      throw new Error('Upload failed: Invalid response from UploadThing');
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error(`Upload failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};