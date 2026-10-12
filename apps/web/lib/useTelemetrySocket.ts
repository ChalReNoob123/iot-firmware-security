'use client';

import { useState, useEffect, useRef } from 'react';

export interface LiveTelemetryState {
  execSpeed: number;
  totalExecs: number;
  uniquePaths: number;
  activeCrashes: number;
  bitmapDensity: number;
  isLive: boolean;
}

export function useTelemetrySocket(initialSeed?: Partial<LiveTelemetryState>) {
  const [telemetry, setTelemetry] = useState<LiveTelemetryState>({
    execSpeed: initialSeed?.execSpeed ?? 1840,
    totalExecs: initialSeed?.totalExecs ?? 2481902,
    uniquePaths: initialSeed?.uniquePaths ?? 738,
    activeCrashes: initialSeed?.activeCrashes ?? 4,
    bitmapDensity: initialSeed?.bitmapDensity ?? 0.059,
    isLive: false
  });

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let fallbackInterval: NodeJS.Timeout | null = null;
    let isSubscribed = true;

    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://127.0.0.1:8000/ws/telemetry';
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isSubscribed) return;
        setTelemetry((prev) => ({ ...prev, isLive: true }));
      };

      ws.onmessage = (event) => {
        if (!isSubscribed) return;
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'FUZZ_TELEMETRY_UPDATE') {
            setTelemetry((prev) => ({
              ...prev,
              execSpeed: data.execSpeed || prev.execSpeed,
              totalExecs: data.totalExecs || prev.totalExecs + Math.floor(prev.execSpeed),
              uniquePaths: data.uniquePaths || prev.uniquePaths,
              activeCrashes: data.activeCrashes ?? prev.activeCrashes,
              isLive: true
            }));
          }
        } catch (err) {
          console.warn('Failed parsing websocket telemetry message:', err);
        }
      };

      ws.onerror = () => {
        if (!isSubscribed) return;
        setTelemetry((prev) => ({ ...prev, isLive: false }));
      };

      ws.onclose = () => {
        if (!isSubscribed) return;
        setTelemetry((prev) => ({ ...prev, isLive: false }));
      };
    } catch (e) {
      console.warn('WebSocket connection attempt failed:', e);
    }

    // Fallback ticker if WebSocket is offline or disconnected
    fallbackInterval = setInterval(() => {
      if (!isSubscribed) return;
      setTelemetry((prev) => {
        if (prev.isLive) return prev; // WebSocket is active, no need for simulated ticker
        const delta = Math.floor(1800 + Math.random() * 80);
        return {
          ...prev,
          execSpeed: delta,
          totalExecs: prev.totalExecs + delta,
          bitmapDensity: Math.min(0.095, prev.bitmapDensity + 0.00002)
        };
      });
    }, 1000);

    return () => {
      isSubscribed = false;
      if (fallbackInterval) clearInterval(fallbackInterval);
      if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
        ws.close();
      }
    };
  }, []);

  return telemetry;
}
