# DRISHTI // Privacy-Preserving Browser Vision Agent
> **Team Aurelis &bull; Smart India Hackathon 2026 Prototype**

Drishti is a privacy-preserving browser vision agent designed to understand and interact with web applications while guaranteeing that sensitive or private information visible on the user's screen is filtered and masked **before** visual information reaches the AI/vision reasoning layer.

---

## The Core Privacy Invariant
```
RAW BROWSER FRAME
       ↓
  PRIVACY GUARD
       ↓
 SENSITIVE REGION DETECTION
       ↓
  MASKING / REDACTION
       ↓
  SANITIZED FRAME  ◄─── [Type-Branded & Cryptographically Signed]
       ↓
   VISION / AI     ◄─── [Zero Access to Raw Browser Pixels]
       ↓
  ACTION & AUDIT
```

The AI/vision layer is **never** directly coupled to the raw browser viewport. All frames consumed by the vision reasoning engine are nominal branded `SanitizedFrame` payloads backed by SHA-256 cryptographic proofs recorded to a tamper-evident audit ledger.

---

## Architectural Maturity Matrix

| Component | Status | Description |
| :--- | :--- | :--- |
| `@drishti/core` | **REAL** | Branded types, privacy contracts, domain interfaces |
| `@drishti/privacy-guard` | **REAL** | PII & benchmark detector, redactor, cryptographic hasher |
| `@drishti/audit-logger` | **REAL** | Hash-chained event stream and privacy proof storage |
| `apps/api` | **REAL** | Express backend with health monitoring, audit endpoints, and live verification |
| `apps/web` | **REAL** | React + Vite Command Center with dark security console aesthetic |
| `@drishti/vision-engine` | **SIMULATED** | `DemoVisionEngine`: Validates and consumes only `SanitizedFrame` |
| `services/browser-agent` | **PLANNED** | Playwright browser automation (Phase 2) |
| `services/task-planner` | **PLANNED** | Goal decomposition & verification state machine (Phase 4) |
| `python/` | **PLANNED** | Presidio + OCR ML microservice configuration (Phase 3) |

---

## Quickstart & Verification

### Prerequisites
- Node.js >= 20.0.0 (tested on Node.js 24.19.0)
- npm >= 10.0.0 (tested on npm 11.17.0)
- Python >= 3.11 (tested on Python 3.13.14)

### 1. Install Dependencies
```bash
npm install
```

### 2. Build TypeScript Packages
```bash
npm run build
```

### 3. Run Automated Tests
```bash
npm test
```
Executes:
- Privacy boundary leakage and type branding tests
- Audit logger hash-chaining and proof ledger tests
- API gateway integration and health check tests

### 4. Launch Development Environment
```bash
# Starts both Backend API (port 3001) and Frontend Command Center (port 3000)
npm run dev

# Or start services individually:
npm run dev:api    # http://localhost:3001
npm run dev:web    # http://localhost:3000
```

---

## Live Verification Demo (SIH Synthetic Benchmark)

Once the API and Web servers are running:
1. Navigate to `http://localhost:3000`.
2. Inspect the **Core Architecture & Strict Privacy Perimeter** diagram.
3. Click **RUN SYNTHETIC PRIVACY PROOF**.
4. Observe the side-by-side quarantine readout:
   - **Raw State (Quarantined)**: Displays synthetic test data (`AURELIS_TEST_NAME`, `test@example.local`, `+91 9000000000`, `AURELIS-ID-12345`).
   - **Sanitized Representation (Exposed to AI)**: All synthetic PII entities are replaced by solid tokens (`[REDACTED:NAME]`, etc.).
   - **Proof of Privacy**: Confirms `directRawFrameToAiBlocked: true`, displays the SHA-256 verification digest and guard execution latency.
   - **Vision Engine Inference**: Confirms the simulated reasoning engine received and processed only the sanitized payload.
   - **Audit Stream**: Displays the tamper-evident cryptographic hash chain entry.

---

## Primary API Endpoints

- `GET /api/health` &bull; System health and component status ledger
- `GET /api/privacy/status` &bull; Active privacy detectors and boundary invariants
- `POST /api/privacy/verify-sample` &bull; Executes synthetic PII sanitization and vision verification
- `GET /api/audit/logs` &bull; Retrieves recent audit events with SHA-256 event hashes
- `GET /api/audit/proofs` &bull; Retrieves stored privacy proof records

---

## Documentation
For complete technical details, sequence diagrams, and security specifications, see [ARCHITECTURE.md](ARCHITECTURE.md).
