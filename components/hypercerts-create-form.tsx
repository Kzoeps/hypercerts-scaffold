import * as HypercertRecord from "@/lexicons/types/org/hypercerts/claim";
import { parseAtUri } from "@/lib/utils";
import { useOAuthContext } from "@/providers/OAuthProviderSSR";
import { BlobRef } from "@atproto/lexicon";
import { useState } from "react";
import { toast } from "sonner";
import HypercertsBaseForm, {
    HypercertRecordForm,
} from "./hypercerts-base-form";

export interface IHypercertsCreateFormProps {
  setHypercertId: (id: string) => void;
  hypercertId?: string;
  nextStepper: () => void;
}

export default function HypercertsCreateForm({
  setHypercertId,
  hypercertId,
  nextStepper,
}: IHypercertsCreateFormProps) {
  const { atProtoAgent, session } = useOAuthContext();
  const [step, setStep] = useState<number>(1);
  const [creating, setCreating] = useState(false);

  const handleCreate = async (
    certInfo: HypercertRecordForm,
    advance?: boolean
  ) => {
    try {
      if (!atProtoAgent || !session) return;
      setCreating(true);
      const {
        title,
        shortDescription,
        workScope,
        workTimeFrameFrom,
        workTimeFrameTo,
      } = certInfo;
      let uploadedBlob: BlobRef | null = null;
      const image = certInfo.image;
      if (image) {
        const blob = new Blob([image!], { type: image?.type });
        const response = await atProtoAgent.com.atproto.repo.uploadBlob(blob);
        uploadedBlob = response.data.blob;
      }
      const record = {
        $type: "org.hypercerts.claim",
        title,
        shortDescription,
        workScope,
        image: uploadedBlob ? { $type: "smallBlob", ...uploadedBlob } : null,
        workTimeFrameFrom,
        workTimeFrameTo,
        createdAt: new Date().toISOString(),
      };
      if (
        HypercertRecord.isRecord(record) &&
        HypercertRecord.validateRecord(record).success
      ) {
        const response = await atProtoAgent.com.atproto.repo.createRecord({
          rkey: new Date().getTime().toString(),
          record,
          collection: "org.hypercerts.claim",
          repo: atProtoAgent.assertDid,
        });
        const uriInfo = parseAtUri(response.data.uri);
        if (uriInfo?.rkey) {
          setHypercertId(uriInfo?.rkey);
        }
        toast.success("Hypercert created successfully!");
        if (advance) {
          nextStepper();
        }
      } else {
        const validation = HypercertRecord.validateRecord(record);
        if (!validation.success) {
          toast.error(validation.error.message);
        } else {
          toast.error("Invalid hypercert data, please check your inputs.");
        }
      }
    } catch (error) {
      console.error("Error creating hypercert:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create hypercert please try again"
      );
    } finally {
      setCreating(false);
    }
  };
  return (
    <HypercertsBaseForm
      updateActions
      isSaving={creating}
      saveDisabled={false}
      onSave={handleCreate}
    />
  );
}
