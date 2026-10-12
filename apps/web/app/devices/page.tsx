'use client';

import React, { useState } from 'react';
import { useSentinelStore } from '@/lib/store';
import { DeviceProfile } from '@sentinelforge/shared-types';

export default function DevicesPage() {
  const { openAttestationModal, showToast } = useSentinelStore();
  const [selectedMethod, setSelectedMethod] = useState<'USB' | 'BLE' | 'LAN' | 'UPLOAD'>('UPLOAD');
  const [targetName, setTargetName] = useState('Custom Smart IoT Gateway');
  const [architecture, setArchitecture] = useState<'ARM' | 'MIPS' | 'ARM64' | 'RISCV'>('ARM');
  const [uploadedFile, setUploadedFile] = useState<string | null>('gateway_firmware_v2.4.1.bin');

  const handleStartOnboarding = () => {
    const newDev: DeviceProfile = {
      id: `dev_${Date.now()}`,
      name: targetName,
      manufacturer: 'Target Hardware Lab',
      model: `${architecture}-TESTBED`,
      architecture,
      endianness: 'LITTLE',
      connectionType: selectedMethod === 'USB' ? 'USB_SERIAL' : selectedMethod === 'BLE' ? 'WEB_BLUETOOTH' : 'FIRMWARE_UPLOAD',
      status: 'ONLINE',
      firmwareVersion: 'v2.4.1',
      firmwareHash: 'e8f9a2b4c6d8e0f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9',
      firmwareSize: 17203200,
      riskScore: 65,
      ssvcHighestPriority: 'ACT',
      interfaces: {
        hasUart: true,
        hasJtag: true,
        hasBle: true,
        hasWifi: true,
        hasZigbee: false,
        hasEthernet: true
      }
    };

    // Trigger mandatory attestation gate
    openAttestationModal(newDev);
  };

  return (
    <div className="flex flex-col gap-6 font-mono max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-cyber-border/40 pb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyber-cyan animate-pulse" />
          <h1 className="text-xl font-bold text-white">DEVICE & FIRMWARE ONBOARDING WIZARD</h1>
        </div>
        <p className="text-xs text-cyber-muted">
          Connect physical hardware via WebUSB, WebSerial, Web Bluetooth, or upload a firmware image.
        </p>
      </div>

      {/* Interface Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: 'UPLOAD' as const, label: 'Firmware File Upload', desc: '.bin, .hex, .elf, .squashfs' },
          { id: 'USB' as const, label: 'USB / UART / JTAG', desc: 'WebUSB & WebSerial API' },
          { id: 'BLE' as const, label: 'Bluetooth Low Energy', desc: 'Web Bluetooth GATT Scan' },
          { id: 'LAN' as const, label: 'Network / Wi-Fi', desc: 'mDNS & Subnet Sweep' }
        ].map((method) => (
          <button
            key={method.id}
            onClick={() => setSelectedMethod(method.id)}
            className={`p-4 rounded-xl border text-left flex flex-col justify-between gap-1 transition-all ${
              selectedMethod === method.id
                ? 'bg-cyber-cyan/20 border-cyber-cyan shadow-[0_0_15px_rgba(0,245,212,0.2)]'
                : 'bg-cyber-surface/60 border-cyber-border hover:border-cyber-cyan/40'
            }`}
          >
            <div className="text-xs font-bold text-white">{method.label}</div>
            <div className="text-[10px] text-cyber-muted">{method.desc}</div>
          </button>
        ))}
      </div>

      {/* Form Details */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 border border-cyber-border">
        <h2 className="text-sm font-bold text-cyber-cyan">HARDWARE & IMAGE SPECIFICATIONS</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-cyber-muted block mb-1">DEVICE NAME / IDENTIFIER</label>
            <input
              type="text"
              value={targetName}
              onChange={(e) => setTargetName(e.target.value)}
              className="w-full bg-cyber-surface border border-cyber-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyber-cyan"
            />
          </div>

          <div>
            <label className="text-cyber-muted block mb-1">TARGET ARCHITECTURE</label>
            <select
              value={architecture}
              onChange={(e) => setArchitecture(e.target.value as any)}
              className="w-full bg-cyber-surface border border-cyber-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyber-cyan"
            >
              <option value="ARM">ARM Cortex-A / Cortex-M (32-bit Little Endian)</option>
              <option value="MIPS">MIPS32 / MIPS64 (Big / Little Endian)</option>
              <option value="ARM64">ARM64 / AArch64</option>
              <option value="RISCV">RISC-V (RV32 / RV64)</option>
            </select>
          </div>
        </div>

        {/* Upload Dropzone */}
        {selectedMethod === 'UPLOAD' && (
          <div className="border-2 border-dashed border-cyber-border/60 hover:border-cyber-cyan/50 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-2 bg-cyber-surface/40 transition-colors">
            <svg className="w-8 h-8 text-cyber-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div className="text-xs text-white font-bold">Drag and drop firmware image here</div>
            <div className="text-[10px] text-cyber-muted">Supported: .bin, .hex, .elf, .squashfs, .tar, .img, .uImage (Up to 512 MB)</div>
            {uploadedFile && (
              <div className="mt-2 px-3 py-1 rounded bg-cyber-cyan/20 text-cyber-cyan text-xs font-mono border border-cyber-cyan/40">
                Selected: {uploadedFile} (16.4 MB)
              </div>
            )}
          </div>
        )}

        {/* USB / WebSerial Prompt */}
        {selectedMethod === 'USB' && (
          <div className="p-4 rounded-xl bg-cyber-surface/80 border border-cyber-border text-xs space-y-2">
            <div className="text-white font-bold">WebSerial & WebUSB Hardware Bridge:</div>
            <p className="text-cyber-muted text-[11px]">
              Click below to request direct USB or UART serial permissions from your browser to communicate with FTDI / CP2102 / J-Link debug adapters.
            </p>
            <button
              onClick={() => showToast('Browser WebSerial prompt requested. Searching for FTDI / J-Link USB adapters on host...', 'INFO')}
              className="px-3 py-1.5 rounded bg-cyber-surface hover:bg-cyber-card border border-cyber-cyan/40 text-cyber-cyan text-xs"
            >
              Request Serial Port Device
            </button>
          </div>
        )}

        {/* Action Button: Opens Attestation Modal */}
        <div className="pt-4 border-t border-cyber-border/40 flex items-center justify-between">
          <div className="text-[11px] text-cyber-muted flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyber-rose" />
            Mandatory signed attestation required prior to pipeline ingestion.
          </div>
          <button
            onClick={handleStartOnboarding}
            className="px-6 py-2.5 rounded-xl bg-cyber-cyan text-cyber-bg font-bold text-xs hover:bg-cyber-cyan/90 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(0,245,212,0.3)]"
          >
            Proceed to Authorization Gate &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
