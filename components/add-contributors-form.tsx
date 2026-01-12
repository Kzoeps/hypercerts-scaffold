"use client";

import {
  addCollaboratorToOrganization,
  GrantAccessParams,
} from "@/lib/create-actions";
import { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import { OrganizationInfo, RepositoryRole } from "@hypercerts-org/sdk-core";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import FormInfo from "./form-info";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import UserAvatar from "./user-avatar";
import UserSelection from "./user-selection";

interface AddContributorsFormProps {
  orgInfo: OrganizationInfo;
}

export default function AddContributorsForm({
  orgInfo,
}: AddContributorsFormProps) {
  const [selectedUser, setSelectedUser] = useState<ProfileView | null>(null);
  const [selectedRole, setSelectedRole] = useState<RepositoryRole>("editor");

  const mutation = useMutation({
    mutationFn: (params: GrantAccessParams) =>
      addCollaboratorToOrganization(params),
    onSuccess: () => {
      toast.success("Contributor added successfully!");
      setSelectedUser(null);
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to add contributor");
    },
  });

  const handleUserSelect = (user: ProfileView) => setSelectedUser(user);

  const handleSubmit = () => {
    if (!selectedUser) {
      toast.error("Please select a user");
      return;
    }

    mutation.mutate({
      userDid: selectedUser.did,
      role: selectedRole,
      repoDid: orgInfo.did,
    });
  };

  return (
    <FormInfo
      title="Add Contributors"
      description={`Add members to your organization: ${orgInfo.name}`}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>User</Label>
          <UserSelection onUserSelect={handleUserSelect} />

          {selectedUser && (
            <div className="pt-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Selected user:
              </p>
              <div className="flex items-center space-x-2 border rounded-md p-2 mt-1">
                <UserAvatar user={selectedUser} />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Role</Label>
          <RadioGroup
            value={selectedRole}
            onValueChange={(role) => setSelectedRole(role as RepositoryRole)}
            className="space-y-2"
          >
            <div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="viewer" id="viewer" />
                <Label htmlFor="viewer">Viewer</Label>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 ml-6">
                Can view the organization&apos;s hypercerts.
              </p>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="editor" id="contributor" />
                <Label htmlFor="contributor">Contributor</Label>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 ml-6">
                Can create and manage hypercerts for the organization.
              </p>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="admin" id="admin" />
                <Label htmlFor="admin">Admin</Label>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 ml-6">
                Can manage organization settings and members.
              </p>
            </div>
          </RadioGroup>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={!selectedUser || mutation.isPending}
          >
            {mutation.isPending ? "Adding..." : "Add Contributor"}
          </Button>
        </div>
      </div>
    </FormInfo>
  );
}
