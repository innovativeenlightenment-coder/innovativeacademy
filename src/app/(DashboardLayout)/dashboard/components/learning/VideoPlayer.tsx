interface VideoPlayerProps {
  videoId: string;
  title: string;
}

function getYouTubeEmbedUrl(videoIdOrUrl: string) {
  try {
    // Full YouTube URL
    if (videoIdOrUrl.startsWith("http")) {
      const url = new URL(videoIdOrUrl);

      // youtube.com/watch?v=XXXX
      if (url.hostname.includes("youtube.com")) {
        const id = url.searchParams.get("v");

        if (id) {
          return `https://www.youtube.com/embed/${id}`;
        }
      }

      // youtu.be/XXXX
      if (url.hostname === "youtu.be") {
        const id = url.pathname.substring(1);

        if (id) {
          return `https://www.youtube.com/embed/${id}`;
        }
      }
    }

    // Only video ID
    return `https://www.youtube.com/embed/${videoIdOrUrl}`;
  } catch {
    return `https://www.youtube.com/embed/${videoIdOrUrl}`;
  }
}

export default function VideoPlayer({
  videoId,
  title,
}: VideoPlayerProps) {
  const embedUrl = getYouTubeEmbedUrl(videoId);

  return (
    <div
      className="
        overflow-hidden
        rounded-2xl
        border border-slate-200
        bg-black
        shadow-[0_20px_60px_rgba(15,23,42,0.14)]
      "
    >
      <div className="aspect-video w-full">
        <iframe
          className="h-full w-full"
          src={embedUrl}
          title={title}
          frameBorder="0"
          allow="
            accelerometer;
            autoplay;
            clipboard-write;
            encrypted-media;
            gyroscope;
            picture-in-picture;
            web-share
          "
          allowFullScreen
        />
      </div>
    </div>
  );
}