"use client";

import { useState, FormEventHandler } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import * as Evidence from "@/lexicons/types/org/hypercerts/claim/evidence";
import { HypercertRecordData } from "@/lib/types";
import { validateHypercert } from "@/lib/utils";
import { useOAuthContext } from "@/providers/OAuthProviderSSR";
import { ArrowLeft, Upload, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { getHypercert } from "@/lib/queries";

type ContentMode = "link" | "file";

export default function HypercertEvidenceForm({
  hypercertId,
  hypercertData,
  onNext,
  onBack,
}: {
  hypercertId: string;
  hypercertData?: HypercertRecordData;
  onNext?: () => void;
  onBack?: () => void;
}) {
  const { atProtoAgent } = useOAuthContext();
  const hypercertRecord = hypercertData?.value;

  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [contentMode, setContentMode] = useState<ContentMode>("link");
  const [contentUrl, setContentUrl] = useState("");
  const [contentFile, setContentFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    setContentFile(file ?? null);
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!atProtoAgent) return;
    if (!hypercertRecord) {
      toast.error("Hypercert data not loaded");
      return;
    }

    try {
      setSaving(true);
      let content: Evidence.Record["content"];
      if (contentMode === "link") {
        if (!contentUrl.trim()) {
          toast.error("Please provide a link to the evidence.");
          setSaving(false);
          return;
        }
        content = { $type: "app.certified.defs#uri", value: contentUrl.trim() };
      } else {
        if (!contentFile) {
          toast.error("Please upload an evidence file.");
          setSaving(false);
          return;
        }
        const blob = new Blob([contentFile], { type: contentFile.type });
        const response = await atProtoAgent.com.atproto.repo.uploadBlob(blob);
        const uploadedBlob = response.data.blob;
        content = { $type: "smallBlob", ...uploadedBlob };
      }

      const evidenceRecord = {
        $type: "org.hypercerts.claim.evidence",
        content,
        title: title || undefined,
        shortDescription,
        description: description || undefined,
        createdAt: new Date().toISOString(),
      };

      const validation = Evidence.validateRecord(evidenceRecord);
      if (!validation.success) {
        toast.error(validation.error?.message || "Invalid evidence record");
        setSaving(false);
        return;
      }

      const createResponse = await atProtoAgent.com.atproto.repo.createRecord({
        rkey: String(Date.now()),
        record: evidenceRecord,
        collection: "org.hypercerts.claim.evidence",
        repo: atProtoAgent.assertDid,
      });

      const evidenceCid = createResponse?.data?.cid;
      const evidenceURI = createResponse?.data?.uri;

      if (!evidenceCid || !evidenceURI) {
        toast.error("Failed to create evidence record");
        setSaving(false);
        return;
      }

      const hypercertData = await getHypercert(hypercertId, atProtoAgent);
      const updatedHypercert = {
        ...hypercertData.data.value,
        evidence: [
          {
            $type: "com.atproto.repo.strongRef",
            cid: evidenceCid,
            uri: evidenceURI,
          },
        ],
      };

      const hypercertValidation = validateHypercert(updatedHypercert);
      if (!hypercertValidation.success) {
        toast.error(
          hypercertValidation.error || "Invalid updated hypercert record"
        );
        setSaving(false);
        return;
      }

      await atProtoAgent.com.atproto.repo.putRecord({
        rkey: hypercertId,
        repo: atProtoAgent.assertDid,
        collection: "org.hypercerts.claim",
        record: updatedHypercert,
      });

      toast.success("Evidence created and linked to hypercert!");
      onNext?.();
    } catch (error) {
      console.error("Error saving evidence:", error);
      toast.error("Failed to create evidence");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Step 3 of 3 · Evidence
                </p>
                <CardTitle className="text-2xl mt-1">
                  Add Hypercert Evidence
                </CardTitle>
                <CardDescription className="mt-1">
                  Attach a link or file that backs up this hypercert claim.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title (Optional)</Label>
                <Input
                  id="title"
                  placeholder="e.g., Audit report, Research paper, Demo video"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={256}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">
                  Short Description (Required)
                </Label>
                <Textarea
                  id="shortDescription"
                  placeholder="Summarize what this evidence demonstrates..."
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  maxLength={3000}
                  rows={3}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {shortDescription.length} / 3000 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Detailed Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  placeholder="Provide more context on the evidence and how it supports the claim..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={30000}
                  rows={5}
                />
                <p className="text-xs text-muted-foreground">
                  {description.length} / 30000 characters
                </p>
              </div>

              <div className="space-y-3">
                <Label>Evidence Content *</Label>

                <div className="inline-flex rounded-md border divide-x overflow-hidden">
                  <button
                    type="button"
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm ${
                      contentMode === "link"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background"
                    }`}
                    onClick={() => setContentMode("link")}
                  >
                    <LinkIcon className="h-4 w-4" />
                    Link
                  </button>
                  <button
                    type="button"
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm ${
                      contentMode === "file"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background"
                    }`}
                    onClick={() => setContentMode("file")}
                  >
                    <Upload className="h-4 w-4" />
                    File
                  </button>
                </div>

                {contentMode === "link" ? (
                  <div className="space-y-2">
                    <Input
                      type="url"
                      placeholder="https://example.com/report"
                      onChange={(e) => setContentUrl(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Paste a URL to a public resource (report, article, repo,
                      video, etc.).
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Input type="file" onChange={handleFileChange} required />
                    <p className="text-xs text-muted-foreground">
                      Upload a supporting file (PDF, image, etc.). It will be
                      stored as a blob.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-4 pt-2">
                {onBack ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                ) : (
                  <div />
                )}
                {!!onNext && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onNext}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                    Skip
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={saving}
                  className="min-w-[180px]"
                >
                  {saving ? "Saving…" : "Save Evidence"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
