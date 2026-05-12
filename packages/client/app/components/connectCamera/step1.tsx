import { useEffect } from "react";
import { useStepStore } from "~/stores/step/stepStore";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

export const Step1: React.FC = () => {
  const { setCanChangeStep } = useStepStore();

  useEffect(() => {
    setCanChangeStep(true);
  }, [setCanChangeStep]);

  return (
    <div className="rounded-lg border border-border bg-card p-4 text-sm">
      <p className="text-muted-foreground">
        The camera broadcasts its own temporary Wi-Fi network. Open your phone
        or computer Wi-Fi settings and connect to that network before
        continuing.
      </p>

      <div className="mt-3 rounded-md bg-muted p-3">
        <p className="font-medium">Expected network name format</p>
        <p className="mt-1 text-muted-foreground">CFEO-3468789-UMMF</p>
      </div>

      <ul className="mt-3 list-disc space-y-1 pl-5 text-muted-foreground">
        <li>Disable mobile data temporarily to avoid auto-switching.</li>
        <li>Stay near the camera during setup.</li>
        <li>
          If several camera networks appear, use the one that starts with
          <span className="ml-1 font-medium">CFEO-</span>.
        </li>
      </ul>

      <Alert variant="destructive" className="mt-4">
        <AlertTitle>Note</AlertTitle>
        <AlertDescription>
          Please reset the camera if you have previously attempted to connect it
          to a network. This ensures a smooth setup process.
        </AlertDescription>
      </Alert>
    </div>
  );
};
