"use client";

import { DatePicker } from "@/components/date-range-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { Record } from "@/lexicons/types/org/hypercerts/claim/record";
import { useOAuthContext } from "@/providers/OAuthProviderSSR";
import { Label } from "@radix-ui/react-label";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function EditHypercertIdPage() {
  const params = useParams<{ hypercertId: string }>();
  const hypercertId = params.hypercertId;
  const router = useRouter();

  const { atProtoAgent, session } = useOAuthContext();

  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [workScope, setWorkScope] = useState("");
  const [workTimeframeFrom, setWorkTimeframeFrom] = useState<Date | null>(null);
  const [workTimeframeTo, setWorkTimeframeTo] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHypercert() {
      try {
        const response = await atProtoAgent?.com.atproto.repo.getRecord({
          repo: atProtoAgent.assertDid,
          collection: "org.hypercerts.claim.record",
          rkey: hypercertId,
        });
        console.log(response);
        const record = response?.data?.value as Record;

        if (record) {
          setTitle(record.title || "");
          setShortDescription(record.shortDescription || "");
          setWorkScope(record.workScope || "");
          setWorkTimeframeFrom(
            record.workTimeframeFrom ? new Date(record.workTimeframeFrom) : null
          );
          setWorkTimeframeTo(
            record.workTimeFrameTo ? new Date(record.workTimeFrameTo) : null
          );
        }
      } catch (error) {
        console.error("Error fetching hypercert:", error);
        toast.error("Failed to load hypercert");
      } finally {
        setLoading(false);
      }
    }
    fetchHypercert();
  }, [atProtoAgent, hypercertId]);

  if (!atProtoAgent || !session || !hypercertId) {
    router.push("/");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!atProtoAgent || !session) return;
      setSaving(true);

      const record = {
        $type: "org.hypercerts.claim.record",
        title,
        shortDescription,
        workScope,
        workTimeframeFrom: workTimeframeFrom?.toISOString() || null,
        workTimeFrameTo: workTimeframeTo?.toISOString() || null,
        createdAt: new Date().toISOString(),
      };

      await atProtoAgent.com.atproto.repo.putRecord({
        repo: atProtoAgent.assertDid,
        collection: "org.hypercerts.claim.record",
        rkey: hypercertId,
        record,
      });

      toast.success("Hypercert updated successfully!");
    } catch (error) {
      console.error("Error updating hypercert:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update hypercert"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 max-w-md mx-auto py-10"
    >
      <div className="flex flex-col gap-1">
        <Label htmlFor="title">Hypercert Name</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter the hypercert name"
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="description">Short Description</Label>
        <Textarea
          id="description"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          placeholder="Enter a short description"
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="workScope">Work Scope Tags</Label>
        <Textarea
          id="workScope"
          value={workScope}
          onChange={(e) => setWorkScope(e.target.value)}
          placeholder="Enter tags that describe the work"
          required
        />
      </div>

      <div className="flex justify-between w-full">
        <DatePicker
          initDate={workTimeframeFrom || undefined}
          onChange={setWorkTimeframeFrom}
          label="Work Time Frame From"
        />
        <DatePicker
          onChange={setWorkTimeframeTo}
          initDate={workTimeframeTo || undefined}
          label="Work Time Frame To"
        />
      </div>

      <Button disabled={saving} type="submit">
        {saving && <Spinner />}
        {saving ? "Saving Changes" : "Save Changes"}
      </Button>
    </form>
  );
}
