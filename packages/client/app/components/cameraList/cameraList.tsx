import { useEffect, useMemo, useState } from "react";
import {
  Camera,
  FileVideo,
  LoaderCircle,
  Play,
  RefreshCw,
  Settings2,
  Trash2,
  Wifi,
  X,
  Eye,
} from "lucide-react";
import { Button } from "../ui/button";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Skeleton } from "../ui/skeleton";
import { trpc } from "~/utils/trpc";
import type { RouterOutputs } from "~/types/globalTypes";
import AllCamerasLiveView from "./allCamerasLiveView";

const VideoPreview: React.FC<{
  streamUrl: string;
  height?: string;
}> = ({ streamUrl, height = "h-40" }) => {
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

const CameraPreviewImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  maxRetries?: number;
}> = ({ src, alt, className = "", maxRetries = 6 }) => {
  const [retryCount, setRetryCount] = useState(0);
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    // Reset retry state when source changes.
    setRetryCount(0);
    setHasFailed(false);
  }, [src]);

  const separator = src.includes("?") ? "&" : "?";
  const previewSrc = `${src}${separator}t=${retryCount}`;

  const handleError = () => {
    if (retryCount >= maxRetries) {
      setHasFailed(true);
      return;
    }

    const nextRetry = retryCount + 1;
    const delayMs = Math.min(300 * 2 ** retryCount, 3000);
    window.setTimeout(() => {
      setRetryCount(nextRetry);
    }, delayMs);
  };

  return (
    <div className="relative h-40 w-full bg-muted/30">
      <img
        src={previewSrc}
        alt={alt}
        className={className}
        onLoad={() => setHasFailed(false)}
        onError={handleError}
      />
      {hasFailed && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/70 px-3 text-center text-xs text-muted-foreground">
          Apercu indisponible
        </div>
      )}
    </div>
  );
};

const CameraList: React.FC = () => {
  const [selectedStreamCamera, setSelectedStreamCamera] = useState<
    RouterOutputs["getCameraList"][0] | null
  >(null);
  const [showAllCamerasLive, setShowAllCamerasLive] = useState(false);

  const cameraList = trpc.getCameraList.useQuery();

  const onlineCount = useMemo(() => cameraList.data?.length, [cameraList.data]);

  const refreshCameraList = () => {
    cameraList.refetch();
  };

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Surveillance
          </p>
          <h2 className="mt-1 flex items-center gap-2 text-lg font-semibold">
            <Camera className="h-5 w-5" /> Camera List
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your cameras, access RTSP streams, and navigate to ONVIF or
            file pages.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={refreshCameraList}
            disabled={cameraList.isLoading}
          >
            {cameraList.isLoading ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" /> Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" /> Refresh camera list
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setShowAllCamerasLive(true)}
            disabled={!cameraList.data || cameraList.data.length === 0}
          >
            <Eye className="h-4 w-4" /> View All Cameras Live
          </Button>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-md border border-border bg-background p-3 text-sm">
          <p className="text-muted-foreground">Total cameras</p>
          <p className="mt-1 text-lg font-semibold">
            {cameraList.data?.length}
          </p>
        </div>
        <div className="rounded-md border border-border bg-background p-3 text-sm">
          <p className="text-muted-foreground">Online</p>
          <p className="mt-1 text-lg font-semibold text-green-600">
            {onlineCount}
          </p>
        </div>
        <div className="rounded-md border border-border bg-background p-3 text-sm">
          <p className="text-muted-foreground">Offline</p>
          <p className="mt-1 text-lg font-semibold text-muted-foreground">
            {0}
          </p>
        </div>
      </div>

      {cameraList.isLoading && (
        <div className="grid gap-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      )}

      {cameraList.data?.length === 0 ? (
        <Alert>
          <Camera className="h-4 w-4" />
          <AlertTitle>No cameras found</AlertTitle>
          <AlertDescription>
            Use refresh to scan again or add a new camera from Connect Camera.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 sm:grid-cols-1 lg:grid-cols-3">
          {cameraList?.data?.map((camera) => (
            <div
              key={camera.ip}
              className="overflow-hidden rounded-md border border-border bg-background"
            >
              {/* Video Preview */}
              {/*  */}
              <CameraPreviewImage
                src={camera.imagePreviewUrl}
                alt={`${camera.name} preview`}
                className="h-40 w-full object-cover"
              />

              {/* Camera Info and Actions */}
              <div className="space-y-3 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{camera.name}</p>
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
                    <p className="text-xs text-muted-foreground">
                      {camera.name} - {camera.ip}
                    </p>
                    <p className="break-all text-xs text-muted-foreground">
                      {camera.streamUrl}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    type="button"
                    onClick={() => setSelectedStreamCamera(camera)}
                  >
                    <Play className="h-4 w-4" /> View Stream
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => {
                      window.location.href = `/cameras/${camera.ip}/files`;
                    }}
                  >
                    <FileVideo className="h-4 w-4" /> Voir les fichiers
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => {
                      window.location.href = `/cameras/${camera.ip}/onvif`;
                    }}
                  >
                    <Settings2 className="h-4 w-4" /> Parametre ONVIF
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stream Modal */}
      {selectedStreamCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-auto rounded-lg border border-border bg-card shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border bg-background p-4">
              <h2 className="text-lg font-semibold">
                {selectedStreamCamera.name} - RTSP Stream
              </h2>
              <button
                onClick={() => setSelectedStreamCamera(null)}
                className="rounded-md hover:bg-muted p-1 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4 p-4">
              <div className="rounded-lg overflow-hidden border border-border bg-black">
                <VideoPreview
                  streamUrl={selectedStreamCamera.streamUrl}
                  height="h-80"
                />
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">
                    Stream URL
                  </p>
                  <p className="break-all font-mono text-xs bg-muted p-2 rounded mt-1">
                    {selectedStreamCamera.streamUrl}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-muted-foreground">
                      IP Address
                    </p>
                    <p className="text-sm mt-1">{selectedStreamCamera.ip}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Cameras Live View Modal */}
      {showAllCamerasLive && cameraList.data && (
        <AllCamerasLiveView
          cameras={cameraList.data}
          onClose={() => setShowAllCamerasLive(false)}
        />
      )}
    </div>
  );
};

export default CameraList;
