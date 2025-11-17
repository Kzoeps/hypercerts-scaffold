"use client";

import HypercertContributionForm from "@/components/contributions-form";
import { StepperHeader } from "@/components/edit-cert-stepper";
import HypercertEvidenceForm from "@/components/evidence-form";
import HypercertsCreateForm from "@/components/hypercerts-create-form";
import HypercertLocationForm from "@/components/locations-form";
import HypercertRightsForm from "@/components/rights-form";
import { useState } from "react";

export default function Home() {
  const [step, setStep] = useState<number>(1);
  const [hypercertId, setHypercertId] = useState<string>();

  const nextStepper = () => {
    setStep((step) => step + 1);
  };
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <StepperHeader step={step} />
      {step === 1 && (
        <HypercertsCreateForm
          setHypercertId={setHypercertId}
          hypercertId={hypercertId}
          nextStepper={nextStepper}
        />
      )}
      {step === 2 && hypercertId && (
        <div className="mt-6">
          <HypercertContributionForm
            hypercertId={hypercertId}
            onSkip={() => setStep((step) => step + 1)}
            onBack={() => setStep(1)}
          />
        </div>
      )}
      {step === 3 && hypercertId && (
        <div className="mt-6">
          <HypercertEvidenceForm
            hypercertId={hypercertId}
            onNext={nextStepper}
            onBack={() => setStep(2)}
          />
        </div>
      )}
      {step === 4 && hypercertId && (
        <div className="mt-6">
          <HypercertLocationForm
            onNext={nextStepper}
            hypercertId={hypercertId}
          />
        </div>
      )}
      {step === 5 && hypercertId && (
        <div className="mt-6">
          <HypercertRightsForm onNext={nextStepper} hypercertId={hypercertId} />
        </div>
      )}
    </div>
  );
}
