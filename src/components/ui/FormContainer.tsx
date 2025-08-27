"use client";
import React from "react";

export default function FormContainer({
  title,
  children,
  onSubmit,
}: {
  title?: string;
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="max-w-md w-full bg-white p-6 rounded shadow">
      {title && <h2 className="text-lg font-semibold mb-4">{title}</h2>}
      {children}
    </form>
  );
}
