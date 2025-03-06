"use client";

export function PreviewVideoPlayer({
  src,
  controls = true,
  className,
}: {
  src: string;
  controls?: boolean;
  className?: string;
}) {
  return (
    <video
      controls={controls}
      className={className}
      style={{ maxHeight: "600px" }}
    >
      {src && (
        <>
          <source src={src} type="video/mp4" />
          <track kind="captions" src={`${src}.vtt`} srcLang="en" label="English" />
        </>
      )}
      Your browser does not support the video tag.
    </video>
  );
}