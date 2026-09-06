import { X } from "lucide-react";
import type { RouterOutputs } from "~/types/globalTypes";

const VideoPreview: React.FC<{
  streamUrl: string;
  height?: string;
}> = ({ streamUrl, height = "h-80" }) => {
  return (
    <div
      className={`relative w-full overflow-hidden border border-border bg-black ${height}`}
    >
      <iframe
        src={streamUrl}
        className="h-full w-full border-0"
        allow="autoplay"
        title={`Stream ${streamUrl}`}
      />
    </div>
  );
};

interface AllCamerasLiveViewProps {
  cameras: RouterOutputs["getCameraList"];
  onClose: () => void;
}

const AllCamerasLiveView: React.FC<AllCamerasLiveViewProps> = ({
  cameras,
  onClose,
}) => {
  if (cameras.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-6xl rounded-lg border border-border bg-card shadow-xl">
          <div className="flex items-center justify-between border-b border-border bg-background p-4">
            <h2 className="text-lg font-semibold">All Live Streams</h2>
            <button
              onClick={onClose}
              className="rounded-md hover:bg-muted p-1 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-4 text-center text-muted-foreground">
            No cameras available
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-6xl max-h-[90vh] overflow-auto rounded-lg border border-border bg-card shadow-xl">
        {/* Modal Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-background p-4 z-10">
          <div>
            <h2 className="text-lg font-semibold">All Live Streams</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {cameras.length} camera{cameras.length > 1 ? "s" : ""} displayed
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md hover:bg-muted p-1 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Grid of cameras */}
        <div className="p-4 space-y-6">
          {cameras.map((camera) => (
            <div key={camera.ip} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{camera.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {camera.ip}
                  </p>
                </div>
                <span
                  className={[
                    "rounded border px-1.5 py-0.5 text-xs",
                    camera.status === "online"
                      ? "border-green-500/50 bg-green-50 text-green-700"
                      : "border-border bg-muted text-muted-foreground",
                  ].join(" ")}
                >
                  {camera.status}
                </span>
              </div>
              <VideoPreview streamUrl={camera.streamUrl} height="h-72" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllCamerasLiveView;
