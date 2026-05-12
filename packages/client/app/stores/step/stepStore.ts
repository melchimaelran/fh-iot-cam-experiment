import { create } from "zustand";

export type Step = {
  number: number;
  label: string;
  tooltip: string;
};

type CameraInfos = {
  ip: string | null;
  id: string | null;
};

export interface StepState {
  canChangeStep: boolean;
  currentStep: Step;
  cameraInfos?: CameraInfos;
  setCanChangeStep: (canChange: boolean) => void;
  setCurrentStep: (step: Step) => void;
  resetStep: () => void;
  nextStep: () => void;
  prevStep: () => void;
  setCameraIp: (ip: string | null) => void;
  setCameraId: (id: string | null) => void;
}

export const steps: Step[] = [
  {
    number: 1,
    label: "Connect to the wifi of the camera",
    tooltip:
      "The camera creates its own wifi network. Connect to it to proceed, the wifi is like CFEO-3468789-UMMF",
  },
  {
    number: 2,
    label: "Setup camera and configure Wi-Fi credentials",
    tooltip:
      "Follow the instructions to setup the camera and connect it to your wifi network. Enter SSID, password, and authentication type to connect the camera to your network.",
  },
  {
    number: 3,
    label: "Reboot camera and wait for Wi-Fi join",
    tooltip:
      "Unplug and plug the camera power cable to force a reboot. The camera should connect to the Wi-Fi network you set in the previous step.",
  },
  {
    number: 4,
    label: "Discover and save camera",
    tooltip:
      "Scan your network, find the camera, and save it to your camera list.",
  },
];

export const useStepStore = create<StepState>((set) => ({
  canChangeStep: true,
  currentStep: steps[0],
  setCanChangeStep: (canChange) => set({ canChangeStep: canChange }),
  setCurrentStep: (step) => set({ currentStep: step }),
  nextStep: () =>
    set((state) => {
      const nextStep = steps.find(
        (step) => step.number === state.currentStep.number + 1,
      );
      if (nextStep) {
        return { currentStep: nextStep };
      }
      return {};
    }),
  prevStep: () =>
    set((state) => {
      const prevStep = steps.find(
        (step) => step.number === state.currentStep.number - 1,
      );
      if (prevStep) {
        return { currentStep: prevStep };
      }
      return {};
    }),
  resetStep: () => set({ currentStep: steps[0] }),
  setCameraIp: (ip) =>
    set((state) => {
      const cameraInfos = state.cameraInfos
        ? { ...state.cameraInfos, ip }
        : { ip, id: null };
      return { cameraInfos };
    }),
  setCameraId: (id) =>
    set((state) => {
      const cameraInfos = state.cameraInfos
        ? { ...state.cameraInfos, id }
        : { ip: null, id };
      return { cameraInfos };
    }),
}));
