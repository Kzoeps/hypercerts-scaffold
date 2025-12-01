"use client";

import { useOAuthContext } from "@/providers/OAuthProviderSSR";
import { useRouter } from "next/navigation";
import { useEffect, useState, FormEvent } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import Image from "next/image";

import type { AppBskyActorDefs } from "@atproto/api"; // if you have the typed client
import ImageUploader from "@/components/image-uploader";

export default function ProfilePage() {
  const { atProtoAgent, session } = useOAuthContext();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] =
    useState<AppBskyActorDefs.ProfileViewDetailed | null>(null);

  // Local editable fields
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [avatarImage, setAvatarImage] = useState<File>();
  const [bannerImage, setBannerImage] = useState<File>();
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");

  useEffect(() => {
    if (!atProtoAgent || !session) {
      router.push("/");
      return;
    }

    async function getProfile() {
      if (!atProtoAgent || !session) return;
      try {
        setLoading(true);
        const userProfile = await atProtoAgent.app.bsky.actor.getProfile({
          actor: atProtoAgent.assertDid,
        });

        const value = userProfile?.data;
        console.log(value);
        if (value) {
          setProfile(value as AppBskyActorDefs.ProfileViewDetailed);

          setDisplayName(value.displayName ?? "");
          setDescription(value.description ?? "");
          setWebsite(value.website || ""); // TODO: hydrate from facets/links if you use them
          setPronouns(value.pronouns || ""); // TODO: hydrate from custom storage if you have one
          setAvatarUrl(value.avatar ?? "");
          setBannerUrl(value.banner ?? "");
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile");
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }

    getProfile();
  }, [atProtoAgent, session, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!atProtoAgent) return;

    try {
      setSaving(true);
      console.log("Saving profile payload:", {
        displayName,
        description,
        website,
        pronouns,
        avatarUrl,
        bannerUrl,
      });

      toast.success("Profile saved");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <h1 className="text-2xl font-semibold">Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Banner */}
        <div className="space-y-2">
          <ImageUploader
            label="Banner"
            aspect="banner"
            imageUrl={bannerUrl}
            onFileSelect={(file) => {
              const localUrl = URL.createObjectURL(file);
              setBannerUrl(localUrl);
              setBannerImage(file);
            }}
          />
        </div>

        {/* Avatar */}
        <div className="space-y-2">
          <ImageUploader
            label="Avatar"
            aspect="square"
            imageUrl={avatarUrl}
            onFileSelect={(file) => {
              const localUrl = URL.createObjectURL(file);
              setAvatarUrl(localUrl);
              setAvatarImage(file);
            }}
          />
        </div>

        {/* Display Name */}
        <div className="space-y-2">
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            id="displayName"
            placeholder="Your display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        {/* Bio / Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Bio</Label>
          <Textarea
            id="description"
            placeholder="Tell the world about yourself…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>

        {/* Website */}
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            placeholder="https://example.com"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        {/* Pronouns */}
        <div className="space-y-2">
          <Label htmlFor="pronouns">Pronouns</Label>
          <Input
            id="pronouns"
            placeholder="e.g., she/her, he/him, they/them"
            value={pronouns}
            onChange={(e) => setPronouns(e.target.value)}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
}
