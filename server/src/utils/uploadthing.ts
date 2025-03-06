import { createUploadthing, type FileRouter } from "uploadthing/express";

const f = createUploadthing();

export const uploadRouter = {
  videoUploader: f({
    video: {
      maxFileSize: "64MB",
      maxFileCount: 1,
      contentDisposition: "inline",
    }
  })
  .onUploadComplete(({ file }) => {
    console.log("Video upload completed:", file.url);
    return { url: file.url };
  }),

  audioUploader: f({
    audio: {
      maxFileSize: "16MB",
      maxFileCount: 1,
    }
  })
  .onUploadComplete(({ file }) => {
    console.log("Audio upload completed:", file.url);
    return { url: file.url };
  })

} satisfies FileRouter;

export type AppFileRouter = typeof uploadRouter;