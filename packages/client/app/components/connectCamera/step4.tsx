import { Search, Wifi, ArrowBigRight, Video } from "lucide-react";
import { Button } from "../ui/button";
import { useStepStore } from "~/stores/step/stepStore";
import { useEffect } from "react";
import { Spinner } from "../ui/spinner";
import { trpc } from "~/utils/trpc";

export const Step4: React.FC = () => {
  const { setCanChangeStep } = useStepStore();
  const searchCameras = trpc.searchCameras.useQuery();

  useEffect(() => {
    setCanChangeStep(true);
  }, [setCanChangeStep]);
  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Final Step
          </p>
          <h3 className="mt-1 text-lg font-semibold">
            Discover and Save Camera
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Searching the local network for the camera, review results, then
            save it to your camera list.
          </p>
        </div>
        <span className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
          Step 4
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-1">
        <div className="rounded-lg border border-border bg-background p-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" />
            <p className="font-medium">Search for cameras</p>
            {searchCameras.isLoading && <Spinner className="size-5" />}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Scans your current network. This can take a few seconds.
          </p>
          {/* LIST OF CAMERAS */}
          <div className="mt-4 space-y-2">
            {searchCameras.data?.reachableIps.length === 0 && (
              <p className="text-sm text-muted-foreground">No cameras found.</p>
            )}
            <h1 className="text-shadow-2xs font-medium">Reachable Cameras :</h1>
            {searchCameras.data?.reachableIps.map((ip) => (
              <div
                key={ip}
                className="flex items-center justify-between rounded-md border border-border bg-card p-3"
              >
                {/* chip */}
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  <div className="text-sm">{ip}</div>
                  <Wifi className="h-4 w-4 text-green-500" />
                </div>
              </div>
            ))}
            <div className="flex items-center">
              <div className="text-sm text-muted-foreground">
                <span className="font-bold text-gray-950">
                  Local IPs on your network :
                </span>{" "}
                {searchCameras.data?.localIps.join(", ") ||
                  "No local IPs found."}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-dashed border-border p-4">
          <p className="text-sm font-medium">Troubleshooting</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Confirm you are still connected to the camera Wi-Fi.</li>
            <li>Make sure the camera is powered on.</li>
            <li>If not found, run refresh and repeat the previous steps.</li>
          </ul>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button type="button" variant="default">
            Go to camera list <ArrowBigRight />
          </Button>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
          <Wifi className="h-3.5 w-3.5" />
          Network scan works only when your device is on the same network as the
          camera.
        </div>
      </div>
    </div>
  );
};
