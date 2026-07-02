import { useState } from "react";

type Toast = { title: string; description?: string; variant?: "default" | "destructive" };

let toastFn: (t: Toast) => void = () => {};

export function useToast() {
  return { toast: toastFn };
}

export function setToastFn(fn: (t: Toast) => void) {
  toastFn = fn;
}
