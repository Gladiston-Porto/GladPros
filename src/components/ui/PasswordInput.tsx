"use client";
import React, { useState } from "react";

export interface PasswordInputProps {
  label?: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export default function PasswordInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  className = "",
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  return (
    <div className={`mb-3 ${className}`}>
      {label && <label htmlFor={name} className="block text-sm mb-1">{label}</label>}
      <div className="relative">
        <input
          id={name}
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full px-3 py-2 rounded border bg-white text-slate-900 outline-none"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-slate-600"
        >
          {visible ? "Ocultar" : "Mostrar"}
        </button>
      </div>
    </div>
  );
}
