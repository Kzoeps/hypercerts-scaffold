"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import OrganizationForm, {
  OrganizationFormParams,
} from "@/components/organization-form";
import FormInfo from "@/components/form-info";
import { createOrganization } from "@/lib/create-actions";

export default function CreateOrganizationPage() {
  const mutation = useMutation({
    mutationFn: (params: OrganizationFormParams) => createOrganization(params),
    onSuccess: () => {
      toast.success("Organization created successfully!");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to create organization");
    },
  });

  const handleSubmit = (params: OrganizationFormParams) => {
    mutation.mutate(params);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <FormInfo
        title="Create Organization"
        description="Fill out the form to create a new organization."
      >
        <OrganizationForm
          isCreating={mutation.isPending}
          onSubmit={handleSubmit}
        />
      </FormInfo>
    </div>
  );
}