import { NextResponse } from "next/server";
import { getAgent } from "@/lib/atproto-session";
import { revalidatePath } from "next/cache";
import { convertBlobUrlToCdn } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const repoPromise = getAgent();
    const formData = await req.formData();
    const repo = await repoPromise;
    if (!repo) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const displayName = formData.get("displayName")?.toString() || "";
    const description = formData.get("description")?.toString() || "";
    const pronouns = formData.get("pronouns")?.toString() || "";
    const website = formData.get("website")?.toString() || "";

    const avatar = formData.get("avatar") as File | null;
    const banner = formData.get("banner") as File | null;

    if (avatar && avatar.size > 1_000_000) {
      return NextResponse.json(
        { error: "Avatar must be less than 1MB" },
        { status: 400 },
      );
    }
    if (banner && banner.size > 1_000_000) {
      return NextResponse.json(
        { error: "Banner must be less than 1MB" },
        { status: 400 },
      );
    }
    if (pronouns && pronouns.length > 20) {
      return NextResponse.json(
        { error: "Pronouns must be 20 characters or less" },
        { status: 400 },
      );
    }

    // Check if profile exists by fetching it first
    const existingResult = await repo.com.atproto.repo
      .getRecord({
        repo: repo.assertDid,
        collection: "app.certified.actor.profile",
        rkey: "self",
      })
      .catch(() => null);
    const existingProfile =
      (existingResult?.data?.value as Record<string, unknown> | null) ?? null;

    // If no displayName, assume no profile record exists yet
    if (!existingProfile?.displayName) {
      // For create: use undefined for empty fields (no null)
      const createParams: {
        displayName?: string;
        description?: string;
        pronouns?: string;
        website?: string;
        avatar?: File;
        banner?: File;
      } = {};

      if (displayName) createParams.displayName = displayName;
      if (description) createParams.description = description;
      if (pronouns) createParams.pronouns = pronouns;
      if (website) createParams.website = website;
      if (avatar) createParams.avatar = avatar;
      if (banner) createParams.banner = banner;

      // @ts-expect-error -- Phase 2-4 migration: repo is Agent, not Repository
      await repo.profile.createCertifiedProfile(createParams);
    } else {
      // For update: use null to remove fields, undefined to preserve
      const updateParams: {
        displayName?: string | null;
        description?: string | null;
        pronouns?: string | null;
        website?: string | null;
        avatar?: File | null;
        banner?: File | null;
      } = {
        displayName: displayName || null,
        description: description || null,
        pronouns: pronouns || null,
        website: website || null,
      };

      // Only include avatar/banner if user uploaded new files
      // Omitting them (undefined) tells SDK to preserve existing values
      if (avatar) {
        updateParams.avatar = avatar;
      }
      if (banner) {
        updateParams.banner = banner;
      }

      // @ts-expect-error -- Phase 2-4 migration: repo is Agent, not Repository
      await repo.profile.updateCertifiedProfile(updateParams);
    }
    revalidatePath("/profile");

    const updatedResult = await repo.com.atproto.repo
      .getRecord({
        repo: repo.assertDid,
        collection: "app.certified.actor.profile",
        rkey: "self",
      })
      .catch(() => null);
    const updated =
      (updatedResult?.data?.value as Record<string, unknown> | null) ?? null;

    // Convert blob URLs to CDN URLs so Next.js remotePatterns allow them
    const avatarUrl =
      convertBlobUrlToCdn(updated?.avatar as string | null | undefined) || "";
    const bannerUrl =
      convertBlobUrlToCdn(updated?.banner as string | null | undefined) || "";

    return NextResponse.json({
      ok: true,
      profile: {
        displayName: (updated?.displayName as string | undefined) || "",
        description: (updated?.description as string | undefined) || "",
        pronouns: (updated?.pronouns as string | undefined) || "",
        website: (updated?.website as string | undefined) || "",
        avatar: avatarUrl,
        banner: bannerUrl,
      },
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error("Profile update error:", detail);
    return NextResponse.json(
      {
        error: `Failed to update profile: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    );
  }
}
