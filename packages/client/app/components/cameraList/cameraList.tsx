import { useMemo, useState } from "react";
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
} from "lucide-react";
import { Button } from "../ui/button";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Skeleton } from "../ui/skeleton";

type CameraItem = {
  id: string;
  name: string;
  model: string;
  ip: string;
  rtspUrl: string;
  status: "online" | "offline";
};

const initialCameras: CameraItem[] = [
  {
    id: "cam-1",
    name: "Front Door",
    model: "FH8616",
    ip: "192.168.88.235",
    rtspUrl: "rtsp://admin:admin123456@192.168.88.235:8554/profile1",
    status: "online",
  },
  {
    id: "cam-2",
    name: "Backyard",
    model: "FH8626V200",
    ip: "192.168.88.236",
    rtspUrl: "rtsp://admin:admin123456@192.168.88.236:8554/profile1",
    status: "online",
  },
  {
    id: "cam-3",
    name: "Garage",
    model: "FH8636",
    ip: "192.168.88.240",
    rtspUrl: "rtsp://admin:admin123456@192.168.88.240:8554/profile1",
    status: "offline",
  },
];

/**
 * VideoPreview component for displaying RTSP/MJPEG stream
 * Attempts to display live video preview, falls back to placeholder
 */
const VideoPreview: React.FC<{
  rtspUrl: string;
  cameraName: string;
  isOnline: boolean;
}> = ({ rtspUrl, cameraName, isOnline }) => {
  const [imgError, setImgError] = useState<boolean>(false);
  const [isImgLoaded, setIsImgLoaded] = useState<boolean>(false);

  // Convert RTSP URL to MJPEG stream endpoint (common fallback)
  // Most IP cameras support MJPEG at :8080 or /stream endpoint
  const getMjpegUrl = (rtsp: string) => {
    const ipMatch = rtsp.match(/rtsp:\/\/[^@]*@([^:/]+)/);
    if (ipMatch) {
      const ip = ipMatch[1];
      // Try common MJPEG endpoints
      return `http://${ip}:8080/stream?user=admin&pwd=admin123456`;
    }
    return "";
  };

  const mjpegUrl = getMjpegUrl(rtspUrl);

  return (
    <div className="relative flex h-40 w-full items-center justify-center overflow-hidden  border border-border bg-muted">
      {!isOnline ? (
        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <Camera className="h-8 w-8 opacity-50" />
          <span className="text-xs font-medium">Camera Offline</span>
        </div>
      ) : !imgError && mjpegUrl ? (
        <>
          {!isImgLoaded && (
            <Skeleton className="absolute inset-0 h-full w-full" />
          )}
          <img
            src={mjpegUrl}
            alt={cameraName}
            className={`h-full w-full object-cover transition-opacity ${
              isImgLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setIsImgLoaded(true)}
            onError={() => setImgError(true)}
            crossOrigin="anonymous"
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="rounded-full bg-primary/10 p-3">
            <Play className="h-6 w-6 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-xs font-medium text-muted-foreground">
              Stream Preview
            </p>
            <p className="text-xs text-muted-foreground">
              {isImgLoaded ? "Stream unavailable" : "Click to view RTSP stream"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const CameraList: React.FC = () => {
  const [cameras, setCameras] = useState<CameraItem[]>(initialCameras);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [showLoaders, setShowLoaders] = useState<boolean>(false);
  const [selectedStreamCamera, setSelectedStreamCamera] = useState<CameraItem | null>(null);

  const onlineCount = useMemo(
    () => cameras.filter((camera) => camera.status === "online").length,
    [cameras],
  );

  const refreshCameraList = () => {
    setIsRefreshing(true);

    // UI-only mock refresh simulation
    setTimeout(() => {
      setCameras((current) =>
        current.map((camera, index) => {
          if (index === 2) {
            return {
              ...camera,
              status: camera.status === "online" ? "offline" : "online",
            };
          }
          return camera;
        }),
      );
      setIsRefreshing(false);
    }, 1200);
  };

  const deleteCamera = (cameraId: string) => {
    setCameras((current) => current.filter((camera) => camera.id !== cameraId));
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
            variant="outline"
            size="sm"
            onClick={() => setShowLoaders((v) => !v)}
          >
            {showLoaders ? "Hide loaders" : "Show loaders"}
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={refreshCameraList}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" /> Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" /> Refresh camera list
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-md border border-border bg-background p-3 text-sm">
          <p className="text-muted-foreground">Total cameras</p>
          <p className="mt-1 text-lg font-semibold">{cameras.length}</p>
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
            {cameras.length - onlineCount}
          </p>
        </div>
      </div>

      {showLoaders && (
        <div className="grid gap-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      )}

      {cameras.length === 0 ? (
        <Alert>
          <Camera className="h-4 w-4" />
          <AlertTitle>No cameras found</AlertTitle>
          <AlertDescription>
            Use refresh to scan again or add a new camera from Connect Camera.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-3 grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
          {cameras.map((camera) => (
            <div
              key={camera.id}
              className="overflow-hidden rounded-md border border-border bg-background"
            >
              {/* Video Preview */}
              <VideoPreview
                rtspUrl={camera.rtspUrl}
                cameraName={camera.name}
                isOnline={camera.status === "online"}
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
                      {camera.model} - {camera.ip}
                    </p>
                    <p className="break-all text-xs text-muted-foreground">
                      {camera.rtspUrl}
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
                      window.location.href = `/cameras/${camera.id}/files`;
                    }}
                  >
                    <FileVideo className="h-4 w-4" /> Voir les fichiers
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => {
                      window.location.href = `/cameras/${camera.id}/onvif`;
                    }}
                  >
                    <Settings2 className="h-4 w-4" /> Parametre ONVIF
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    type="button"
                    onClick={() => deleteCamera(camera.id)}
                  >
                    <Trash2 className="h-4 w-4" /> Supprimer la cam
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-md border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground">
        <p className="flex items-center gap-1">
          <Wifi className="h-3.5 w-3.5" />
          Menu links point to future pages. The pages are intentionally not
          implemented yet.
        </p>
      </div>

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
                  rtspUrl={selectedStreamCamera.rtspUrl}
                  cameraName={selectedStreamCamera.name}
                  isOnline={selectedStreamCamera.status === "online"}
                />
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">RTSP URL</p>
                  <p className="break-all font-mono text-xs bg-muted p-2 rounded mt-1">
                    {selectedStreamCamera.rtspUrl}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-muted-foreground">Model</p>
                    <p className="text-sm mt-1">{selectedStreamCamera.model}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">IP Address</p>
                    <p className="text-sm mt-1">{selectedStreamCamera.ip}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraList;
