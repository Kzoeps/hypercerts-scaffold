"use client";

import HypercertsBaseForm, {
  HypercertRecordForm,
} from "@/components/hypercerts-base-form";
import * as HypercertRecord from "@/lexicons/types/org/hypercerts/claim";
import { useOAuthContext } from "@/providers/OAuthProviderSSR";
import { BlobRef } from "@atproto/lexicon";
import { useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const { atProtoAgent, session } = useOAuthContext();
  const [creating, setCreating] = useState(false);

  const handleCreate = async (certInfo: HypercertRecordForm) => {
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
        await atProtoAgent.com.atproto.repo.createRecord({
          rkey: new Date().getTime().toString(),
          record,
          collection: "org.hypercerts.claim",
          repo: atProtoAgent.assertDid,
        });
        toast.success("Hypercert created successfully!");
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
      isSaving={creating}
      saveDisabled={false}
      onCreate={handleCreate}
    />
  );
}
