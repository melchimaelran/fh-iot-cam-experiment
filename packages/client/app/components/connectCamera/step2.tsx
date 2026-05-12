import { useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Field, FieldLabel } from "../ui/field";
import { useStepStore } from "~/stores/step/stepStore";
import { Spinner } from "../ui/spinner";
import { trpc } from "~/utils/trpc";

type SetupStep = {
  id: number;
  title: string;
  description: string;
};

const setupSteps: SetupStep[] = [
  {
    id: 1,
    title: "Finding the camera IP address",
    description:
      "Find the gateway IP while connected to the camera hotspot network.",
  },
  {
    id: 2,
    title: "Telnet the gateway",
    description: "Open a Telnet session and execute the bypass scripts.",
  },
  {
    id: 3,
    title: "Send Wi-Fi credentials",
    description:
      "Configure SSID, password, and auth type for your home/office network.",
  },
  {
    id: 4,
    title: "Reconnect to your Wi-Fi",
    description:
      "Join the Wi-Fi network configured in step 3 and validate camera access.",
  },
];

export const Step2: React.FC = () => {
  const { setCanChangeStep } = useStepStore();
  const [activeStepId, setActiveStepId] = useState<number>(1);
  const [ssid, setSsid] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authType, setAuthType] = useState<string>("WPA2-PSK");
  const activeIndex = activeStepId - 1;
  const activeStep = setupSteps[activeIndex];
  const {
    data: dataCameraIp,
    isLoading: isLoadingCameraIp,
    error: cameraIpError,
  } = trpc.getCameraIp.useQuery(undefined, {
    enabled: activeStepId === 1,
  });

  const {
    data: dataVulnCheck,
    isLoading: isLoadingVulnCheck,
    error: vulnCheckError,
  } = trpc.checkVulnByIp.useQuery(
    { ip: dataCameraIp?.ip || "" },
    {
      enabled: activeStepId === 2 && !!dataCameraIp?.ip,
    },
  );

  const {
    data: wifiData,
    mutate: mutateWifi,
    isPending: isPendingWifi,
    error: wifiError,
  } = trpc.setWifiCredentials.useMutation({
    onSuccess: () => {
      goNext();
    },
  });

  const isLoading = useMemo(() => {
    return isLoadingCameraIp || isLoadingVulnCheck || isPendingWifi;
  }, [isLoadingCameraIp, isLoadingVulnCheck, isPendingWifi]);

  const errors = useMemo(() => {
    const errs = [];
    if (cameraIpError) {
      errs.push(cameraIpError.message);
    }
    if (vulnCheckError) {
      errs.push(vulnCheckError.message);
    }
    if (wifiError) {
      errs.push(wifiError.message);
    }
    return errs;
  }, [cameraIpError, vulnCheckError, wifiError]);

  const progressValue = useMemo(() => {
    return (activeStepId / setupSteps.length) * 100;
  }, [activeStepId]);

  const goNext = () => {
    setActiveStepId((current) => Math.min(current + 1, setupSteps.length));
  };

  const goPrev = () => {
    setActiveStepId((current) => Math.max(current - 1, 1));
  };

  useEffect(() => {
    if (activeStepId === setupSteps.length) {
      setCanChangeStep(true);
    } else {
      setCanChangeStep(false);
    }
  }, [setCanChangeStep, activeStepId]);

  useEffect(() => {
    setActiveStepId(1);
  }, []);

  useEffect(() => {
    if (
      activeStepId === 1 &&
      dataCameraIp?.ip &&
      !isLoadingCameraIp &&
      !cameraIpError
    ) {
      goNext();
    }
  }, [dataCameraIp, activeStepId, isLoadingCameraIp, cameraIpError]);

  useEffect(() => {
    if (
      activeStepId === 2 &&
      dataVulnCheck?.success &&
      !isLoadingVulnCheck &&
      !vulnCheckError
    ) {
      goNext();
    }
  }, [dataVulnCheck, activeStepId, isLoadingVulnCheck, vulnCheckError]);

  useEffect(() => {
    if (activeStepId === 3 && wifiData && !isPendingWifi && !wifiError) {
      goNext();
    }
  }, [wifiData, activeStepId, isPendingWifi, wifiError]);

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold">Camera Connection Flow</h3>
        <span className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
          Step {activeStepId} of {setupSteps.length}
        </span>
      </div>

      <div className="p-2">
        {isLoading && (
          <Button>
            <Spinner className="size-5" />
            Processing...
          </Button>
        )}
      </div>

      {errors.length > 0 && (
        <div className="mb-4 rounded-md border border-red-500 bg-red-50 p-4">
          {errors.map((err, idx) => (
            <p key={idx} className="text-sm text-red-700">
              {err}
            </p>
          ))}
        </div>
      )}

      <div className="mt-4 grid grid-cols-4 gap-2">
        {setupSteps.map((step) => {
          const isDone = step.id < activeStepId;
          const isActive = step.id === activeStepId;

          return (
            <button
              key={step.id}
              type="button"
              className={[
                "flex h-10 items-center justify-center rounded-md border text-sm transition-colors",
                isDone
                  ? "border-green-500 bg-green-50 text-green-600 hover:bg-green-100"
                  : isActive
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:bg-muted",
              ].join(" ")}
              aria-current={isActive ? "step" : undefined}
            >
              {isDone ? <Check className="h-4 w-4" /> : step.id}
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        <Progress value={progressValue} />
      </div>

      <div className="mt-4 rounded-lg border border-border bg-background p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Current action
        </p>
        <p className="mt-1 text-lg font-semibold">{activeStep.title}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {activeStep.description}
        </p>

        {activeStepId === 1 && !isLoadingCameraIp && !cameraIpError && (
          <div className="mt-4 rounded-md border border-green-500 bg-green-50 p-4">
            <p className="text-sm text-green-700">
              Camera IP found:{" "}
              <span className="font-mono">{dataCameraIp?.ip}</span>
            </p>
          </div>
        )}

        {activeStepId === 2 && !isLoadingVulnCheck && !vulnCheckError && (
          <div
            className={[
              "mt-4 rounded-md border",
              dataVulnCheck?.success
                ? "border-green-500 bg-green-50"
                : "border-red-500 bg-red-50",
              "p-4",
            ].join(" ")}
          >
            <p
              className={[
                "text-sm",
                dataVulnCheck?.success ? "text-green-700" : "text-red-700",
                "whitespace-pre-wrap",
              ].join(" ")}
            >
              {dataVulnCheck?.output || "No output from vuln check"}
            </p>
          </div>
        )}

        {activeStepId === 3 && !isPendingWifi && !wifiError && wifiData && (
          <p
            className={[
              "text-sm",
              "text-green-700",
              "whitespace-pre-wrap",
            ].join(" ")}
          >
            {dataVulnCheck?.output || "No output from vuln check"}
          </p>
        )}

        {activeStepId === 3 && (
          <div className="mt-4 space-y-4 border-t border-border pt-4">
            <Field className="w-full">
              <FieldLabel htmlFor="ssid">Network Name (SSID)</FieldLabel>
              <input
                id="ssid"
                type="text"
                placeholder="Your Wi-Fi network name"
                value={ssid}
                onChange={(e) => setSsid(e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder-muted-foreground focus:border-primary focus:outline-none"
              />
            </Field>

            <Field className="w-full">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Your Wi-Fi password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 pr-10 text-sm placeholder-muted-foreground focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </Field>

            <Field className="w-full">
              <FieldLabel htmlFor="authType">Security Type</FieldLabel>
              <select
                id="authType"
                value={authType}
                onChange={(e) => setAuthType(e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              >
                <option value="Open">Open (No Security)</option>
                <option value="WEP">WEP</option>
                <option value="WPA">WPA</option>
                <option value="WPA2">WPA2</option>
                <option value="WPA2-PSK">WPA2-PSK</option>
                <option value="WPA3">WPA3</option>
              </select>
            </Field>
            {!dataCameraIp?.ip && (
              <div className="rounded-md border border-yellow-500 bg-yellow-50 p-4">
                <p className="text-sm text-yellow-700">
                  Camera IP not found. Please complete step 1 successfully to
                  enable Wi-Fi configuration.
                </p>
              </div>
            )}
            <Button
              type="button"
              onClick={() =>
                mutateWifi({
                  authType: authType,
                  password: password,
                  ssid: ssid,
                  ip: dataCameraIp?.ip || "",
                })
              }
              disabled={
                !ssid ||
                !password ||
                !authType ||
                isPendingWifi ||
                !dataCameraIp?.ip
              }
              variant="default"
            >
              Confirm Wi-Fi Credentials
            </Button>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={goPrev}
          disabled={activeStepId === 1}
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </Button>
        <Button
          type="button"
          variant="default"
          onClick={goNext}
          disabled={activeStepId === setupSteps.length}
        >
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
