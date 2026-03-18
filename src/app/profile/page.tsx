import React from "react";
import { ProfileFeature } from "@/features/social-graph";

export const metadata = {
  title: "Profile | XC Z - Biobeats",
  description: "View followers and following for XC Z.",
};

export default function ProfilePage() {
  return (
    <main className="max-w-[1240px] px-4 mx-auto w-full min-h-screen pb-16">
      <ProfileFeature />
    </main>
  );
}
