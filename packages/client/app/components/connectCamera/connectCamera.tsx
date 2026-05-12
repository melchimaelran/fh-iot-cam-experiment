import { useEffect, useMemo, useState } from "react";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "../ui/item";
import {
  ArrowBigLeft,
  ArrowBigRight,
  CircleCheckBig,
  RotateCcw,
} from "lucide-react";
import { Button } from "../ui/button";
import { Field, FieldLabel } from "../ui/field";
import { Progress } from "../ui/progress";
import { Step1 } from "./step1";
import { Step2 } from "./step2";
import { Step3 } from "./step3";
import { Step4 } from "./step4";
import { steps, useStepStore, type Step } from "~/stores/step/stepStore";

export const ConnectCamera: React.FC = () => {
  const {
    currentStep,
    nextStep,
    prevStep,
    canChangeStep,
    setCanChangeStep,
    resetStep,
    setCurrentStep,
  } = useStepStore();

  const progressValue = useMemo(() => {
    return (currentStep.number / steps.length) * 100 - 5;
  }, [currentStep]);

  const currentStepLabel = useMemo(() => {
    if (currentStep.number === 3) {
      return "Configure Wi-Fi credentials";
    }
    if (currentStep.number === 4) {
      return "Discover and save camera";
    }
    return currentStep.label;
  }, [currentStep]);

  useEffect(() => {
    // Reset to step 1 when component mounts
    resetStep();
  }, [resetStep]);

  return (
    <div>
      <div className="flex justify-between w-full">
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded border border-border px-2 py-0.5 text-xl font-medium">
            Step {currentStep.number} of {steps.length}
          </span>
        </div>
        <Button onClick={resetStep} className="mb-3">
          <RotateCcw></RotateCcw>
          Reset setup
        </Button>
      </div>
      <Item>
        <ItemMedia variant="icon">
          <CircleCheckBig />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{currentStepLabel}</ItemTitle>
          <ItemDescription>{currentStep.tooltip}</ItemDescription>
        </ItemContent>
      </Item>
      {currentStep.number === 1 && <Step1 />}
      {currentStep.number === 2 && <Step2 />}
      {currentStep.number === 3 && <Step3 />}
      {currentStep.number === 4 && <Step4 />}
      <div className="p-4 flex w-full  flex-col gap-4">
        <Field className="w-full">
          <FieldLabel htmlFor="progress-upload">
            <span>Progress</span>
            <span className="ml-auto">{progressValue.toFixed(0)}%</span>
          </FieldLabel>
          <Progress value={progressValue} id="progress-upload" />
        </Field>
        <div className="flex w-full gap-2">
          <Button onClick={prevStep} variant="default">
            <ArrowBigLeft /> Previous
          </Button>
          {currentStep.number < steps.length && (
            <Button
              disabled={!canChangeStep}
              onClick={nextStep}
              variant="default"
            >
              <ArrowBigRight /> Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
