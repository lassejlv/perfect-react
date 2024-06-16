import React from "react";

export default function Container({ children }: { children: React.ReactNode }) {
  return <main className="container mx-auto py-12">{children}</main>;
}
