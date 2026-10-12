# SentinelForge 🛡️⚡
> **Autonomous IoT Firmware Security & Zero-Day Discovery Platform**

SentinelForge is an enterprise-grade platform for automated IoT firmware security analysis, zero-day vulnerability identification, symbolic execution, and multi-hop exploit chaining.

---

## 🌟 Key Architecture & Capabilities

1. **Neo4j Attack-Chain Knowledge Graph & Dijkstra Solver** (`/attack-graph`)
   - Automated multi-hop exploit chaining from wireless (BLE), web (HTTP), physical (UART), and cloud (MQTT) ingress perimeters down to root shell, hardware SPI bus, and ASPEED BMC flash.
   - Dynamic Dijkstra shortest-path calculations weighted by mathematical resistance:
     $$\text{Cost}(e) = \max\left(0.5, \frac{10.0}{\text{CVSS}} \times (1.05 - \text{EPSS}) \times \frac{1.0}{\text{ExploitConfidence}}\right)$$
   - Interactive virtual patch simulation with real-time defense effectiveness recalculation.
   - Live Neo4j Cypher Traversal Console and automated `.cypher` export.

2. **Automated Binary Hotpatching Studio** (`/patch-studio`)
   - Synthesizes assembly-level byte patches for critical zero-days without full firmware recompilation.
   - Verifies patch integrity in QEMU system emulation.

3. **Symbolic Execution & Taint Tracing Engine**
   - Discovers buffer overflows and arbitrary memory corruptions in compiled ARM/MIPS/RISC-V binaries.

4. **Hardware-in-the-Loop & Peripheral Sandboxing** (`/terminal`)
   - Interactive QEMU emulation terminal sandbox for live debugging.

5. **Supply Chain & SBOM VEX Intelligence** (`/sbom-vex`)
   - CycloneDX 1.5 JSON SBOM generator with Post-Quantum Cryptography (PQC) readiness auditing.

---

## 🏗️ Repository Structure

This repository is organized as a modern monorepo powered by **Turborepo**:

```
sentinelforge/
├── apps/
│   ├── api/          # FastAPI Python backend (Neo4j graph engine, Dijkstra solver, QEMU emulator)
│   └── web/          # Next.js 14 web application (TailwindCSS, interactive SVG graph, Cyber UI)
├── packages/
│   └── shared-types/ # Shared TypeScript types for API contracts and graph models
├── docker-compose.yml
└── turbo.json
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** >= 18.0.0
- **Python** >= 3.11
- **npm** or **pnpm**

### Installation

1. Install frontend and monorepo dependencies:
   ```bash
   npm install
   ```

2. Build shared packages:
   ```bash
   npm run build --workspace=@sentinelforge/shared-types
   ```

3. Install Python dependencies:
   ```bash
   cd apps/api
   py -3.11 -m pip install -r requirements.txt
   cd ../..
   ```

### Running Locally

1. Start FastAPI backend (port 8000):
   ```bash
   npm run dev --workspace=@sentinelforge/api
   # Or directly:
   py -3.11 -m uvicorn apps.api.app.main:app --reload --port 8000
   ```

2. Start Next.js frontend (port 3000):
   ```bash
   npm run dev --workspace=@sentinelforge/web
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

Run pytest backend test suite:
```bash
cd apps/api
py -3.11 -m pytest
```

---

## 📜 License
Apache-2.0
