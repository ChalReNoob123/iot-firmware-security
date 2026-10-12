import { create } from 'zustand';
import { DeviceProfile, ScanSession, Finding, CopilotChatMessage } from '@sentinelforge/shared-types';

export interface ToastNotification {
  id: string;
  message: string;
  type: 'SUCCESS' | 'INFO' | 'ALERT';
}

interface SentinelForgeState {
  devices: DeviceProfile[];
  activeDevice: DeviceProfile | null;
  activeScan: ScanSession | null;
  selectedFinding: Finding | null;
  attestationModalOpen: boolean;
  attestationTargetDevice: DeviceProfile | null;
  uploadModalOpen: boolean;
  copilotMessages: CopilotChatMessage[];
  isScanning: boolean;
  toasts: ToastNotification[];

  setDevices: (devices: DeviceProfile[]) => void;
  setActiveDevice: (device: DeviceProfile | null) => void;
  setActiveScan: (scan: ScanSession | null) => void;
  setSelectedFinding: (finding: Finding | null) => void;
  openAttestationModal: (device: DeviceProfile) => void;
  closeAttestationModal: () => void;
  openUploadModal: () => void;
  closeUploadModal: () => void;
  addCopilotMessage: (msg: CopilotChatMessage) => void;
  setIsScanning: (isScanning: boolean) => void;
  showToast: (message: string, type?: 'SUCCESS' | 'INFO' | 'ALERT') => void;
  removeToast: (id: string) => void;
}

export const useSentinelStore = create<SentinelForgeState>((set) => ({
  devices: [],
  activeDevice: null,
  activeScan: null,
  selectedFinding: null,
  attestationModalOpen: false,
  attestationTargetDevice: null,
  uploadModalOpen: false,
  copilotMessages: [
    {
      id: 'msg_welcome',
      sender: 'COPILOT',
      timestamp: new Date().toISOString(),
      content:
        "Welcome to SentinelForge Copilot. I'm connected to the live analysis engines via MCP. You can ask me to analyze decompiled Ghidra snippets, trace symbolic taint paths, calculate CISA SSVC trees, or explain attack chain paths."
    }
  ],
  isScanning: false,
  toasts: [],

  setDevices: (devices) => set({ devices }),
  setActiveDevice: (activeDevice) => set({ activeDevice }),
  setActiveScan: (activeScan) => set({ activeScan }),
  setSelectedFinding: (selectedFinding) => set({ selectedFinding }),
  openAttestationModal: (device) => set({ attestationModalOpen: true, attestationTargetDevice: device }),
  closeAttestationModal: () => set({ attestationModalOpen: false, attestationTargetDevice: null }),
  openUploadModal: () => set({ uploadModalOpen: true }),
  closeUploadModal: () => set({ uploadModalOpen: false }),
  addCopilotMessage: (msg) => set((state) => ({ copilotMessages: [...state.copilotMessages, msg] })),
  setIsScanning: (isScanning) => set({ isScanning }),
  showToast: (message, type = 'INFO') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
}));
