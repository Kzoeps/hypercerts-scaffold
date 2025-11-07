"use client";

import { DatePicker } from "@/components/date-range-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useOAuthContext } from "@/providers/OAuthProviderSSR";
import { Label } from "@radix-ui/react-label";
import { FormEventHandler, useState } from "react";

export default function Home() {
  const { atProtoAgent } = useOAuthContext();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [workScope, setWorkScope] = useState("");
  const [workTimeframeFrom, setWorkTimeframeFrom] = useState<Date | null>(null);
  const [workTimeframeTo, setWorkTimeframeTo] = useState<Date | null>(null);

  const handleSubmit: FormEventHandler = (e) => {
    if (!atProtoAgent) return;
    e.preventDefault();
    console.log({
      title,
      description,
      workScope,
      workTimeframeFrom,
      workTimeframeTo,
    });
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 max-w-md mx-auto py-10"
    >
      <div className="flex flex-col gap-1">
        <Label htmlFor="title">Hypercert Name</Label>
        <Input
          id="title"
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter the hypercert name"
          required
        ></Input>
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="description">Short Description</Label>
        <Textarea
          onChange={(e) => setDescription(e.target.value)}
          id="description"
          placeholder="Enter a short description"
          required
        ></Textarea>
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="short-description">Background Image</Label>
        <Input type="file" placeholder="Add Background Image" required></Input>
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="workScope">Work Scope Tags</Label>
        <Textarea
          onChange={(e) => setWorkScope(e.target.value)}
          id="workScope"
          placeholder="Enter tags that describe the work"
          required
        ></Textarea>
      </div>
      <div className="flex justify-between w-full">
        <DatePicker
          onChange={setWorkTimeframeFrom}
          label="Work Time Frame From"
        />
        <DatePicker onChange={setWorkTimeframeTo} label="Work Time Frame To" />
      </div>
      <Button type="submit">Create Hypercert</Button>
    </form>
  );
}
