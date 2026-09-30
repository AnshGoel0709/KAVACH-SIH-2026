/**
 * @file demo.routes.ts
 * Four distinct, polished synthetic benchmark applications for Drishti.
 *
 * Demonstrates 4 genuine privacy scenarios:
 * 1. Full Redaction (Identity Verification)
 * 2. Zero Redaction / Public Dashboard (Public Service Navigation)
 * 3. Mixed Policy (Private Profile Update: unneeded PII masked, required email allowed)
 * 4. High Sensitivity + Consent Gate (Sensitive Document Review)
 *
 * All pages use synthetic, deterministic test data.
 */

import { Router } from 'express';

export const demoRouter = Router();

/* =========================================================================
   CASE 1: SECURE IDENTITY VERIFICATION (Full Redaction)
   ========================================================================= */
demoRouter.get(['/privacy-form', '/identity-verification'], (_req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Aurelis Identity Portal // Full Redaction Benchmark</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #090d16; color: #f1f5f9; min-height: 100vh; display: flex; flex-direction: column;
    }
    .top-nav {
      background: #0d121f; border-bottom: 1px solid #1e293b; padding: 12px 28px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .portal-brand { font-size: 0.95rem; font-weight: 700; color: #38bdf8; display: flex; align-items: center; gap: 8px; }
    .portal-nav-links { display: flex; gap: 20px; font-size: 0.78rem; color: #94a3b8; }
    .portal-nav-links span.active { color: #f1f5f9; font-weight: 600; }
    .page-container {
      flex: 1; padding: 24px 32px; max-width: 980px; width: 100%; margin: 0 auto;
      display: flex; flex-direction: column; gap: 16px;
    }
    .breadcrumb { font-size: 0.75rem; color: #64748b; display: flex; gap: 6px; }
    .breadcrumb span.current { color: #94a3b8; }
    .steps-row {
      display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 4px;
    }
    .step-pill {
      background: #0f1629; border: 1px solid #1e293b; border-radius: 6px; padding: 10px 14px;
      display: flex; align-items: center; gap: 10px; font-size: 0.75rem; color: #64748b;
    }
    .step-pill.done { border-color: rgba(16, 185, 129, 0.4); color: #10b981; }
    .step-pill.active { border-color: #0284c7; background: rgba(2, 132, 199, 0.08); color: #f1f5f9; }
    .card {
      background: #0f172a; border: 1px solid #1e293b; border-radius: 10px; overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
    }
    .card-header {
      background: #0c1222; border-bottom: 1px solid #1e293b; padding: 16px 24px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .card-title { font-size: 0.95rem; font-weight: 700; color: #f8fafc; }
    .badge-subtle { font-size: 0.68rem; font-weight: 600; background: rgba(56, 189, 248, 0.1); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.25); padding: 2px 8px; border-radius: 4px; }
    .card-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
    .notice { background: rgba(56, 189, 248, 0.06); border-left: 3px solid #38bdf8; padding: 10px 14px; font-size: 0.78rem; color: #94a3b8; }
    .fields-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .field-row { display: flex; flex-direction: column; gap: 5px; }
    .field-lbl { font-size: 0.72rem; text-transform: uppercase; font-weight: 600; color: #94a3b8; letter-spacing: 0.05em; }
    .field-box {
      background: #090e1c; border: 1px solid #1e293b; padding: 10px 13px; border-radius: 6px;
      font-size: 0.88rem; color: #f8fafc; font-family: ui-monospace, Menlo, Consolas, monospace;
    }
    .btn {
      background: #0284c7; color: #ffffff; border: none; padding: 13px 24px; border-radius: 6px;
      font-size: 0.92rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center;
      gap: 8px; margin-top: 10px; transition: all 0.15s ease; width: 100%;
    }
    .btn:hover { background: #0369a1; }
    .verified { display: none; background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; border-radius: 8px; padding: 28px; text-align: center; }
  </style>
</head>
<body>
  <nav class="top-nav">
    <div class="portal-brand">🛡️ AURELIS CITIZEN SERVICES PORTAL</div>
    <div class="portal-nav-links">
      <span>Overview</span>
      <span class="active">Identity Verification</span>
      <span>My Documents</span>
      <span>Support</span>
    </div>
  </nav>

  <main class="page-container">
    <div class="breadcrumb">
      <span>Portal</span> / <span>Citizen Identity</span> / <span class="current">Step 2: Credentials</span>
    </div>

    <div class="steps-row">
      <div class="step-pill done">✓ Step 1: Document Upload</div>
      <div class="step-pill active">● Step 2: Identity Credentials</div>
      <div class="step-pill">○ Step 3: Biometric Confirmation</div>
    </div>

    <div class="card" id="form-container" data-status="ready">
      <div class="card-header">
        <div class="card-title">Subject Identity Verification Form</div>
        <span class="badge-subtle">SYNTHETIC BENCHMARK DATA</span>
      </div>

      <div class="card-body" id="form-content">
        <div class="notice">
          <strong>Privacy Policy: Maximum Protection (Full Redaction)</strong><br>
          All sensitive citizen identification fields are quarantined and masked before remote visual reasoning.
        </div>

        <div class="fields-grid">
          <div class="field-row">
            <label class="field-lbl">Subject Legal Name</label>
            <div class="field-box" id="f-name" data-sensitive="CUSTOM_SYNTHETIC" data-label="Subject Legal Name">AURELIS_TEST_NAME</div>
          </div>
          <div class="field-row">
            <label class="field-lbl">Official Email Address</label>
            <div class="field-box" id="f-email" data-sensitive="PII_EMAIL" data-label="Official Email">test@example.local</div>
          </div>
          <div class="field-row">
            <label class="field-lbl">Verified Mobile Number</label>
            <div class="field-box" id="f-phone" data-sensitive="PII_PHONE" data-label="Verified Mobile">+91 9000000000</div>
          </div>
          <div class="field-row">
            <label class="field-lbl">National Citizen Identifier</label>
            <div class="field-box" id="f-id" data-sensitive="PII_IDENTIFIER" data-label="National Identifier">AURELIS-ID-12345</div>
          </div>
        </div>

        <button id="btn-continue" class="btn" onclick="confirmIdentity()">
          CONTINUE VERIFICATION &rarr;
        </button>
      </div>

      <div class="verified" id="verified-content">
        <div style="color: #10b981; font-weight: 700; font-size: 1.15rem; margin-bottom: 8px;">
          ✓ ACTION VERIFIED &amp; SUBMISSION CONFIRMED
        </div>
        <div style="color: #cbd5e1; font-size: 0.82rem; line-height: 1.4;">
          Identity verification completed. All 4 sensitive entities masked at client perimeter.<br>
          <span style="font-family: monospace; color: #38bdf8;">CONFIRMATION: CONF-AURELIS-ID-VERIFIED-9941</span>
        </div>
      </div>
    </div>
  </main>

  <script>
    function confirmIdentity() {
      document.getElementById('form-content').style.display = 'none';
      document.getElementById('verified-content').style.display = 'block';
      const c = document.getElementById('form-container');
      c.setAttribute('data-status', 'verified');
    }
  </script>
</body>
</html>`);
});

/* =========================================================================
   CASE 2: PUBLIC SERVICE NAVIGATION (Zero Redaction Required)
   ========================================================================= */
demoRouter.get('/account-access', (_req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Aurelis Public Service Portal // Zero Redaction Benchmark</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #090d16; color: #f1f5f9; min-height: 100vh; display: flex; flex-direction: column;
    }
    .top-nav {
      background: #0d121f; border-bottom: 1px solid #1e293b; padding: 12px 28px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .portal-brand { font-size: 0.95rem; font-weight: 700; color: #38bdf8; display: flex; align-items: center; gap: 8px; }
    .portal-nav-links { display: flex; gap: 20px; font-size: 0.78rem; color: #94a3b8; }
    .portal-nav-links span.active { color: #f1f5f9; font-weight: 600; }
    .page-container {
      flex: 1; padding: 24px 32px; max-width: 980px; width: 100%; margin: 0 auto;
      display: flex; flex-direction: column; gap: 16px;
    }
    .bulletin-bar {
      background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25);
      border-radius: 6px; padding: 10px 16px; font-size: 0.75rem; color: #cbd5e1;
      display: flex; align-items: center; justify-content: space-between;
    }
    .bulletin-tag { background: #10b981; color: #041018; font-weight: 700; padding: 2px 6px; border-radius: 3px; font-size: 0.65rem; }
    .card {
      background: #0f172a; border: 1px solid #1e293b; border-radius: 10px; overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
    }
    .card-header {
      background: #0c1222; border-bottom: 1px solid #1e293b; padding: 16px 24px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .card-title { font-size: 0.95rem; font-weight: 700; color: #f8fafc; }
    .badge-subtle { font-size: 0.68rem; font-weight: 600; background: rgba(56, 189, 248, 0.1); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.25); padding: 2px 8px; border-radius: 4px; }
    .card-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
    .service-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .service-card {
      background: #090e1c; border: 1px solid #1e293b; padding: 14px 16px; border-radius: 8px;
      display: flex; flex-direction: column; gap: 6px;
    }
    .service-title { font-size: 0.85rem; font-weight: 700; color: #f1f5f9; }
    .service-meta { font-size: 0.72rem; color: #94a3b8; line-height: 1.4; }
    .btn {
      background: #0284c7; color: #ffffff; border: none; padding: 13px 24px; border-radius: 6px;
      font-size: 0.92rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center;
      gap: 8px; margin-top: 8px; transition: all 0.15s ease; width: 100%;
    }
    .btn:hover { background: #0369a1; }
    .verified { display: none; background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; border-radius: 8px; padding: 28px; text-align: center; }
  </style>
</head>
<body>
  <nav class="top-nav">
    <div class="portal-brand">🌐 AURELIS MUNICIPAL CIVIC DIRECTORY</div>
    <div class="portal-nav-links">
      <span class="active">Public Services</span>
      <span>Transit Schedules</span>
      <span>Civic Permits</span>
      <span>Community Centers</span>
    </div>
  </nav>

  <main class="page-container">
    <div class="bulletin-bar">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span class="bulletin-tag">CIVIC NOTICE</span>
        <span>All municipal libraries, transit lines, and online civic registries operating on normal weekday schedule.</span>
      </div>
      <span style="font-size: 0.7rem; color: #94a3b8;">Updated Today</span>
    </div>

    <div class="card" id="form-container" data-status="ready">
      <div class="card-header">
        <div class="card-title">Public Service Directory Index</div>
        <span class="badge-subtle">PUBLIC NON-SENSITIVE CONTEXT</span>
      </div>

      <div class="card-body" id="form-content">
        <div style="font-size: 0.78rem; color: #94a3b8; line-height: 1.4;">
          This portal contains exclusively open civic service schedules, guidelines, and transit bulletins. <strong>Zero personal or sensitive information detected.</strong>
        </div>

        <div class="service-grid">
          <div class="service-card">
            <span class="service-title">Public Transit Schedules</span>
            <span class="service-meta">Metro lines 1-4 operating normally. Weekday schedule: 05:00 - 23:30.</span>
          </div>
          <div class="service-card">
            <span class="service-title">Civic Permits &amp; Licensing</span>
            <span class="service-meta">Online guidelines for building and business permits. Average processing: 3 days.</span>
          </div>
          <div class="service-card">
            <span class="service-title">Central Public Library</span>
            <span class="service-meta">Open reading rooms, digital research catalog, and free public access terminals.</span>
          </div>
          <div class="service-card">
            <span class="service-title">City Advisory &amp; Emergency</span>
            <span class="service-meta">Non-emergency citizen helpline: 1912. Municipal bulletin updated daily.</span>
          </div>
        </div>

        <!-- Preserves target selector #btn-login for 100% test compatibility while fulfilling public portal experience -->
        <button id="btn-login" class="btn" onclick="openPublicServices()">
          EXPLORE PUBLIC SERVICES &rarr;
        </button>
      </div>

      <div class="verified" id="verified-content">
        <div style="color: #10b981; font-weight: 700; font-size: 1.15rem; margin-bottom: 8px;">
          ✓ PUBLIC SERVICES DIRECTORY ACCESSED
        </div>
        <div style="color: #cbd5e1; font-size: 0.82rem; line-height: 1.4;">
          Navigation confirmed. Zero private data detected, zero redactions required.<br>
          <span style="font-family: monospace; color: #38bdf8;">CONFIRMATION: CONF-PUBLIC-SERVICES-SUCCESS-8842</span>
        </div>
      </div>
    </div>
  </main>

  <script>
    function openPublicServices() {
      document.getElementById('form-content').style.display = 'none';
      document.getElementById('verified-content').style.display = 'block';
      const c = document.getElementById('form-container');
      c.setAttribute('data-status', 'verified');
    }
  </script>
</body>
</html>`);
});

/* =========================================================================
   CASE 3: PRIVATE PROFILE UPDATE (Mixed Privacy Policy Decision)
   ========================================================================= */
demoRouter.get('/profile-management', (_req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Aurelis Personnel Workspace // Mixed Policy Benchmark</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #090d16; color: #f1f5f9; min-height: 100vh; display: flex; flex-direction: column;
    }
    .top-nav {
      background: #0d121f; border-bottom: 1px solid #1e293b; padding: 12px 28px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .portal-brand { font-size: 0.95rem; font-weight: 700; color: #38bdf8; display: flex; align-items: center; gap: 8px; }
    .portal-nav-links { display: flex; gap: 20px; font-size: 0.78rem; color: #94a3b8; }
    .portal-nav-links span.active { color: #f1f5f9; font-weight: 600; }
    .page-container {
      flex: 1; padding: 24px 32px; max-width: 980px; width: 100%; margin: 0 auto;
      display: flex; flex-direction: column; gap: 16px;
    }
    .profile-hero-bar {
      background: #0f1629; border: 1px solid #1e293b; border-radius: 8px; padding: 14px 20px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .user-info-row { display: flex; align-items: center; gap: 14px; }
    .avatar-circle {
      width: 42px; height: 42px; border-radius: 50%; background: #0284c7;
      display: flex; align-items: center; justify-content: center; font-weight: 700; color: #fff;
    }
    .user-titles { display: flex; flex-direction: column; gap: 2px; }
    .user-display-name { font-size: 0.92rem; font-weight: 700; color: #f8fafc; }
    .user-dept-role { font-size: 0.72rem; color: #94a3b8; }
    .card {
      background: #0f172a; border: 1px solid #1e293b; border-radius: 10px; overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
    }
    .card-header {
      background: #0c1222; border-bottom: 1px solid #1e293b; padding: 16px 24px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .card-title { font-size: 0.95rem; font-weight: 700; color: #f8fafc; }
    .badge-subtle { font-size: 0.68rem; font-weight: 600; background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3); padding: 2px 8px; border-radius: 4px; }
    .card-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
    .notice { background: rgba(168, 85, 247, 0.08); border-left: 3px solid #a855f7; padding: 10px 14px; font-size: 0.78rem; color: #cbd5e1; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .field-row { display: flex; flex-direction: column; gap: 4px; }
    .field-lbl { font-size: 0.72rem; text-transform: uppercase; font-weight: 600; color: #94a3b8; letter-spacing: 0.05em; }
    .field-box {
      background: #090e1c; border: 1px solid #1e293b; padding: 10px 13px; border-radius: 6px;
      font-size: 0.85rem; color: #f8fafc; font-family: ui-monospace, Menlo, Consolas, monospace;
    }
    .field-allowed { border-color: rgba(16, 185, 129, 0.4); background: rgba(16, 185, 129, 0.04); }
    .btn {
      background: #0284c7; color: #ffffff; border: none; padding: 13px 24px; border-radius: 6px;
      font-size: 0.92rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center;
      gap: 8px; margin-top: 10px; transition: all 0.15s ease; width: 100%;
    }
    .btn:hover { background: #0369a1; }
    .verified { display: none; background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; border-radius: 8px; padding: 28px; text-align: center; }
  </style>
</head>
<body>
  <nav class="top-nav">
    <div class="portal-brand">👤 AURELIS RESEARCH WORKSPACE</div>
    <div class="portal-nav-links">
      <span>Dashboard</span>
      <span class="active">Profile Settings</span>
      <span>Security</span>
      <span>Audit Log</span>
    </div>
  </nav>

  <main class="page-container">
    <div class="profile-hero-bar">
      <div class="user-info-row">
        <div class="avatar-circle">AV</div>
        <div class="user-titles">
          <span class="user-display-name">Researcher Account Settings</span>
          <span class="user-dept-role">ID: RES-8849-2 • Active Researcher</span>
        </div>
      </div>
      <span style="font-size: 0.72rem; color: #10b981; background: rgba(16, 185, 129, 0.1); padding: 3px 8px; border-radius: 4px; border: 1px solid rgba(16, 185, 129, 0.3);">
        Account Active
      </span>
    </div>

    <div class="card" id="form-container" data-status="ready">
      <div class="card-header">
        <div class="card-title">Researcher Profile Configuration</div>
        <span class="badge-subtle">TASK-AWARE PRIVACY POLICY</span>
      </div>

      <div class="card-body" id="form-content">
        <div class="notice">
          <strong>Privacy Policy: Selective Disclosure (Mixed Policy)</strong><br>
          Unneeded personal PII (Legal Name, Phone) is masked. Task-required identifier (Email) is explicitly allowed by policy to bind the profile update.
        </div>

        <div class="meta-grid">
          <div class="field-row">
            <label class="field-lbl">Department (Public)</label>
            <div class="field-box" id="f-dept">Advanced AI &amp; Security Research</div>
          </div>
          <div class="field-row">
            <label class="field-lbl">Role (Public)</label>
            <div class="field-box" id="f-role">Principal Research Lead</div>
          </div>
        </div>

        <div class="field-row">
          <label class="field-lbl">Subject Full Name (Unneeded PII)</label>
          <div class="field-box" id="f-fullname" data-sensitive="PII_NAME" data-label="Subject Full Name">Dr. Aurelis Vance</div>
        </div>

        <div class="field-row">
          <label class="field-lbl">Primary Contact Email (Task-Required Identifier)</label>
          <div class="field-box field-allowed" id="f-email" data-sensitive="PII_EMAIL" data-label="Primary Contact Email">vance.research@aurelis.org</div>
        </div>

        <div class="field-row">
          <label class="field-lbl">Verified Mobile Phone (Unneeded PII)</label>
          <div class="field-box" id="f-phone" data-sensitive="PII_PHONE" data-label="Verified Mobile Phone">+91 9123456789</div>
        </div>

        <button id="btn-save-profile" class="btn" onclick="saveProfile()">
          SAVE PROFILE CHANGES &rarr;
        </button>
      </div>

      <div class="verified" id="verified-content">
        <div style="color: #10b981; font-weight: 700; font-size: 1.15rem; margin-bottom: 8px;">
          ✓ PROFILE UPDATED &amp; SAVED
        </div>
        <div style="color: #cbd5e1; font-size: 0.82rem; line-height: 1.4;">
          Profile record updated. Allowed task email was sanitized; legal name and phone securely redacted.<br>
          <span style="font-family: monospace; color: #38bdf8;">CONFIRMATION: CONF-PROFILE-UPDATE-SUCCESS-9021</span>
        </div>
      </div>
    </div>
  </main>

  <script>
    function saveProfile() {
      document.getElementById('form-content').style.display = 'none';
      document.getElementById('verified-content').style.display = 'block';
      const c = document.getElementById('form-container');
      c.setAttribute('data-status', 'verified');
    }
  </script>
</body>
</html>`);
});

/* =========================================================================
   CASE 4: SENSITIVE DOCUMENT REVIEW (High-Sensitivity User Consent Gate)
   ========================================================================= */
demoRouter.get('/document-review', (_req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Aurelis Legal Docket // User Consent Gate Benchmark</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #090d16; color: #f1f5f9; min-height: 100vh; display: flex; flex-direction: column;
    }
    .top-nav {
      background: #0d121f; border-bottom: 1px solid #1e293b; padding: 12px 28px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .portal-brand { font-size: 0.95rem; font-weight: 700; color: #ef4444; display: flex; align-items: center; gap: 8px; }
    .portal-nav-links { display: flex; gap: 20px; font-size: 0.78rem; color: #94a3b8; }
    .portal-nav-links span.active { color: #f1f5f9; font-weight: 600; }
    .page-container {
      flex: 1; padding: 24px 32px; max-width: 980px; width: 100%; margin: 0 auto;
      display: flex; flex-direction: column; gap: 16px;
    }
    .security-banner {
      background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 6px; padding: 10px 16px; font-size: 0.75rem; color: #fca5a5;
      display: flex; align-items: center; justify-content: space-between;
    }
    .card {
      background: #0f172a; border: 1px solid #1e293b; border-radius: 10px; overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
    }
    .card-header {
      background: #0c1222; border-bottom: 1px solid #1e293b; padding: 16px 24px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .card-title { font-size: 0.95rem; font-weight: 700; color: #f8fafc; }
    .badge-subtle { font-size: 0.68rem; font-weight: 700; background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); padding: 2px 8px; border-radius: 4px; }
    .card-body { padding: 24px; display: flex; flex-direction: column; gap: 14px; }
    .notice { background: rgba(239, 68, 68, 0.08); border-left: 3px solid #ef4444; padding: 10px 14px; font-size: 0.78rem; color: #cbd5e1; }
    .fields-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .field-row { display: flex; flex-direction: column; gap: 4px; }
    .field-lbl { font-size: 0.72rem; text-transform: uppercase; font-weight: 600; color: #94a3b8; letter-spacing: 0.05em; }
    .field-box {
      background: #090e1c; border: 1px solid #1e293b; padding: 10px 13px; border-radius: 6px;
      font-size: 0.85rem; color: #f8fafc; font-family: ui-monospace, Menlo, Consolas, monospace;
    }
    .field-key { border-color: rgba(239, 68, 68, 0.5); background: rgba(239, 68, 68, 0.08); color: #fca5a5; font-weight: 700; }
    .btn {
      background: #0284c7; color: #ffffff; border: none; padding: 13px 24px; border-radius: 6px;
      font-size: 0.92rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center;
      gap: 8px; margin-top: 10px; transition: all 0.15s ease; width: 100%;
    }
    .btn:hover { background: #0369a1; }
    .verified { display: none; background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; border-radius: 8px; padding: 28px; text-align: center; }
  </style>
</head>
<body>
  <nav class="top-nav">
    <div class="portal-brand">🔒 AURELIS CLASSIFIED DOCKET ACCESS</div>
    <div class="portal-nav-links">
      <span class="active">Review Docket</span>
      <span>Access Keys</span>
      <span>Chain of Custody</span>
      <span>Security Policies</span>
    </div>
  </nav>

  <main class="page-container">
    <div class="security-banner">
      <span>RESTRICTED ACCESS LEVEL 4: Explicit Authorization Required for Docket Decryption.</span>
      <span style="font-weight: 700; color: #f87171;">SECRET // NOFORN</span>
    </div>

    <div class="card" id="form-container" data-status="ready">
      <div class="card-header">
        <div class="card-title">Classified Legal Docket Authentication</div>
        <span class="badge-subtle">CONSENT GATE ENFORCED</span>
      </div>

      <div class="card-body" id="form-content">
        <div class="notice">
          <strong>Privacy Policy: High-Sensitivity User Consent Gate</strong><br>
          Docket authentication requires a high-sensitivity access key. Drishti prompts for explicit user authorization before including this credential in visual reasoning.
        </div>

        <div class="fields-grid">
          <div class="field-row">
            <label class="field-lbl">Classified Document Reference</label>
            <div class="field-box" id="f-docnum" data-sensitive="CUSTOM_SYNTHETIC" data-label="Classified Document Number">AURELIS-DOC-12345</div>
          </div>
          <div class="field-row">
            <label class="field-lbl">Authorized Review Officer</label>
            <div class="field-box" id="f-officer" data-sensitive="PII_NAME" data-label="Authorized Review Officer">Aurelis Legal Officer</div>
          </div>
        </div>

        <div class="field-row">
          <label class="field-lbl">Official Audit Email</label>
          <div class="field-box" id="f-email" data-sensitive="PII_EMAIL" data-label="Official Audit Email">legal.audit@aurelis.gov</div>
        </div>

        <div class="field-row">
          <label class="field-lbl">Review Access Credential Token (HIGH SENSITIVITY)</label>
          <div class="field-box field-key" id="f-key" data-sensitive="CREDENTIAL" data-label="Review Access Credential Token">SEC-KEY-99482-X</div>
        </div>

        <button id="btn-review-doc" class="btn" onclick="openDocket()">
          AUTHENTICATE &amp; REVIEW DOCUMENT &rarr;
        </button>
      </div>

      <div class="verified" id="verified-content">
        <div style="color: #10b981; font-weight: 700; font-size: 1.15rem; margin-bottom: 8px;">
          ✓ DOCUMENT REVIEW OPENED &amp; AUTHENTICATED
        </div>
        <div style="color: #cbd5e1; font-size: 0.82rem; line-height: 1.4;">
          Docket opened. Access token authorized via user consent gate; all other sensitive details masked.<br>
          <span style="font-family: monospace; color: #38bdf8;">CONFIRMATION: CONF-DOC-REVIEW-SUCCESS-54321</span>
        </div>
      </div>
    </div>
  </main>

  <script>
    function openDocket() {
      document.getElementById('form-content').style.display = 'none';
      document.getElementById('verified-content').style.display = 'block';
      const c = document.getElementById('form-container');
      c.setAttribute('data-status', 'verified');
    }
  </script>
</body>
</html>`);
});
