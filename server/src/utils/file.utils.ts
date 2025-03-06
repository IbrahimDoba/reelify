import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { v4 as uuidv4 } from 'uuid';
import { Readable } from 'node:stream';
import type { ReadableStream } from 'web-streams-polyfill';

// Create a custom temporary directory 
export const createTempDir = (): string => {
  const uniqueFolder = path.join(tmpdir(), uuidv4());
  fs.mkdirSync(uniqueFolder, { recursive: true });
  return uniqueFolder;
};

// Download a file from a URL to a local path
export const downloadFile = async (url: string, filePath: string): Promise<void> => {
  try {
    console.log(`Downloading from: ${url} to ${filePath}`);
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
    if (!response.body) throw new Error('Response body is empty');
    
    // Convert web streams to Node.js streams
    const webStream = response.body as unknown as ReadableStream<Uint8Array>;
    const nodeStream = Readable.fromWeb(webStream);
    
    // Ensure directory exists
    await fsPromises.mkdir(path.dirname(filePath), { recursive: true });
    
    // Write file using regular fs
    const writeStream = fs.createWriteStream(filePath);
    nodeStream.pipe(writeStream);
    
    return new Promise<void>((resolve, reject) => {
      writeStream.on('finish', () => resolve());
      writeStream.on('error', reject);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Download failed for ${url}: ${message}`);
  }
};

// Clean up a directory
export const cleanupDir = async (dirPath: string): Promise<void> => {
  try {
    await fsPromises.rm(dirPath, { recursive: true, force: true });
  } catch (error) {
    console.warn('Cleanup error (non-fatal):', error);
  }
};