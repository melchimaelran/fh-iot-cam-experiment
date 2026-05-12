import { Info, CircleCheckBig } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { useStepStore } from "~/stores/step/stepStore";
import { useEffect } from "react";

export const Step3: React.FC = () => {
  const { setCanChangeStep } = useStepStore();

  useEffect(() => {
    setCanChangeStep(true);
  }, [setCanChangeStep]);
  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Step 3
        </p>
        <h3 className="mt-1 text-lg font-semibold">
          Camera reboot and Wi-Fi Join
        </h3>
      </div>

      <div className="rounded-md border border-border bg-muted/30 p-4">
        <p className="text-sm font-semibold">Manual reboot step</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Unplug and plug your camera power cable to force a reboot.
        </p>

        <div className="mt-3 grid grid-cols-1 gap-2 text-center sm:grid-cols-3 sm:items-center">
          <div className="rounded-md border border-border bg-background p-3 text-sm font-medium">
            1. Unplug camera
          </div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            then wait 3 seconds
          </div>
          <div className="rounded-md border border-green-500/40 bg-green-50 p-3 text-sm font-medium text-green-700">
            2. Plug camera back in
          </div>
        </div>
      </div>

      <Alert className="rounded-md border border-green-500/40 bg-green-50 text-green-700">
        <CircleCheckBig className="h-4 w-4" />
        <AlertTitle>Success confirmation</AlertTitle>
        <AlertDescription className="text-green-700/90">
          When the camera is connected, you should hear the voice prompt:
          "Connection successful". Then you can continue to the next step.
        </AlertDescription>
      </Alert>

      <div className="rounded-md border border-amber-500/40 bg-amber-50 p-3 text-sm text-amber-800">
        If it does not connect to the Wi-Fi, reconnect to the camera Wi-Fi and
        restart the setup from the beginning. If the camera Wi-Fi does not
        appear, press and hold the reset button on the camera for 15 seconds
        until you hear “reset successful”, then unplug and replug the camera.
      </div>
    </div>
  );
};
