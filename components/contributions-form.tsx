import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addContribution } from "@/lib/create-actions";
import { BaseHypercertFormProps } from "@/lib/types";
import { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import { Trash } from "lucide-react";
import { FormEventHandler, useState } from "react";
import { toast } from "sonner";
import { DatePicker } from "./date-range-picker";
import FormFooter from "./form-footer";
import FormInfo from "./form-info";
import UserAvatar from "./user-avatar";
import UserSelection from "./user-selection";

export default function HypercertContributionForm({
  hypercertInfo,
  onBack,
  onNext,
}: BaseHypercertFormProps & {
  onBack?: () => void;
  onNext?: () => void;
}) {
  const [role, setRole] = useState("");
  const [contributors, setContributors] = useState<ProfileView[]>([]);
  const [description, setDescription] = useState("");
  const [workTimeframeFrom, setWorkTimeframeFrom] = useState<Date>();
  const [workTimeframeTo, setWorkTimeframeTo] = useState<Date>();
  const [saving, setSaving] = useState(false);

  const addContributor = (user: ProfileView) => {
    const isAdded = contributors.find(
      (contributor) => contributor.did === user.did
    );
    if (!isAdded) {
      setContributors((prev) => [...prev, user]);
    }
  };

  const removeContributor = (user: ProfileView) => {
    const filtered = contributors.filter(
      (contributor) => contributor.did !== user.did
    );
    setContributors(filtered);
  };

  const handleContributionCreation = async () => {
    const mappedContributors = contributors
      .filter((contributor) => !!contributor)
      .map(({ did }) => did);
    if (!mappedContributors.length) return;
    const contributionRecord = {
      hypercertUri: hypercertInfo?.hypercertUri,
      role,
      contributors: mappedContributors,
      description: description || undefined,
      startDate: workTimeframeFrom?.toISOString(),
      endDate: workTimeframeTo?.toISOString(),
    };

    const res = await addContribution(contributionRecord);

    return res;
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!hypercertInfo?.hypercertUri) {
      return;
    }
    setSaving(true);
    try {
      const contributionData = await handleContributionCreation();
      console.log(contributionData);
      toast.success("Contribution created!");
      onNext?.();
    } catch (error) {
      console.error("Error saving contribution:", error);
      toast.error("Failed to update contribution");
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormInfo
      stepLabel="Step 2 of 5 . Evidence"
      title="Add Hypercert Contribution"
      description="Link roles,contributors and timeframes"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="role">Role / Title *</Label>
          <Input
            id="role"
            placeholder="e.g., Developer, Designer, Researcher"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            maxLength={100}
            required
          />
        </div>
        <div className="space-y-2"></div>

        <div className="space-y-2">
          <Label>Contributors (DIDs) *</Label>
          <div className="space-y-2">
            <UserSelection onUserSelect={addContributor} />
            <div className="flex flex-col gap-2">
              {contributors.map((contributor) => (
                <div
                  key={contributor.did}
                  className="flex justify-between gap-4 border p-2 rounded-md"
                >
                  <UserAvatar user={contributor} />
                  <Button
                    onClick={() => removeContributor(contributor)}
                    variant={"outline"}
                    size={"icon"}
                    aria-label="delete"
                    type="button"
                  >
                    <Trash />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            placeholder="What the contribution concretely achieved..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={2000}
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            {description.length} / 2000 characters
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <DatePicker
              label="Work Started"
              initDate={workTimeframeFrom}
              onChange={setWorkTimeframeFrom}
            />
          </div>
          <div className="space-y-2">
            <DatePicker
              label="Work Finished"
              initDate={workTimeframeTo}
              onChange={setWorkTimeframeTo}
            />
          </div>
        </div>

        <FormFooter
          onBack={onBack}
          onSkip={onNext}
          submitLabel="Save & Next"
          savingLabel="Saving…"
          saving={saving}
        />
      </form>
    </FormInfo>
  );
}
