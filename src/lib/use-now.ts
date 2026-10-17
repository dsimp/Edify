"use client";

import { useSyncExternalStore } from "react";

/**
 * A shared 1-second clock. Keeps `Date.now()` out of render so components
 * stay pure, and drives countdowns (72h cap, 7-day hold).
 */
let now = Date.now();
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

function subscribe(cb: () => void) {
  listeners.add(cb);
  if (!timer) {
    now = Date.now();
    timer = setInterval(() => {
      now = Date.now();
      listeners.forEach((l) => l());
    }, 1000);
  }
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

const getSnapshot = () => now;

export function useNow() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
