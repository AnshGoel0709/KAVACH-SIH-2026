import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
}

interface DataParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  type: 'raw_sensitive' | 'raw_public' | 'sanitized' | 'dust';
  opacity: number;
  baseOpacity: number;
  age: number;
  maxAge: number;
  isRedacted?: boolean;
  redactionTimer?: number;
}

interface PerceptionScan {
  x: number;
  vx: number;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hoverStateRef = useRef(false);
  const exitStateRef = useRef(false);

  useEffect(() => {
    hoverStateRef.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    exitStateRef.current = isExiting;
  }, [isExiting]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = {
      x: width / 2,
      y: height / 2,
      smoothX: width / 2,
      smoothY: height / 2,
      intensity: 0, // 0 = normal, 1 = hover on CTA
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // Particle System (Representing: Screen → Perception → Privacy Boundary → Sanitized AI Stream)
    const particleCount = Math.min(130, Math.max(70, Math.floor((width * height) / 12000)));
    const particles: DataParticle[] = [];

    const spawnParticle = (forceLeft: boolean = false): DataParticle => {
      const isSensitive = Math.random() < 0.35;
      const startLeft = forceLeft || Math.random() < 0.7;
      const x = startLeft ? Math.random() * (width * 0.35) : Math.random() * width;
      const y = Math.random() * height;
      const speed = Math.random() * 0.8 + 0.35;

      return {
        x,
        y,
        vx: speed * (0.8 + Math.random() * 0.4),
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2.2 + 1.2,
        type: isSensitive ? 'raw_sensitive' : Math.random() < 0.6 ? 'raw_public' : 'dust',
        opacity: 0,
        baseOpacity: Math.random() * 0.5 + 0.35,
        age: 0,
        maxAge: Math.random() * 260 + 180,
      };
    };

    for (let i = 0; i < particleCount; i++) {
      const p = spawnParticle(false);
      p.age = Math.random() * p.maxAge;
      p.x = Math.random() * width;
      particles.push(p);
    }

    // Horizontal Perception Scan Beam
    const scan: PerceptionScan = {
      x: -100,
      vx: 1.8,
    };

    let time = 0;
    let activationProgress = 0;

    const render = () => {
      time += 0.016;

      // Smooth mouse & hover intensity interpolation
      mouse.smoothX += (mouse.x - mouse.smoothX) * 0.05;
      mouse.smoothY += (mouse.y - mouse.smoothY) * 0.05;

      const targetHoverIntensity = hoverStateRef.current ? 1 : 0;
      mouse.intensity += (targetHoverIntensity - mouse.intensity) * 0.06;

      if (exitStateRef.current) {
        activationProgress = Math.min(1, activationProgress + 0.035);
      }

      const centerX = width / 2;
      const centerY = height / 2;
      const boundaryRadius = Math.min(width, height) * (0.28 + mouse.intensity * 0.04);

      // 1. Deep Midnight Background
      const bgGrad = ctx.createRadialGradient(
        centerX + (mouse.smoothX - centerX) * 0.08,
        centerY + (mouse.smoothY - centerY) * 0.08,
        20,
        centerX,
        centerY,
        Math.max(width, height) * 0.85
      );
      bgGrad.addColorStop(0, '#060e1d');
      bgGrad.addColorStop(0.35, '#030813');
      bgGrad.addColorStop(0.7, '#01040a');
      bgGrad.addColorStop(1, '#000205');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Abstract 3D Screen Perspective Grid (Atmospheric floor)
      const gridY = height * 0.68;
      ctx.save();
      const gridAlpha = 0.03 + mouse.intensity * 0.025;
      ctx.strokeStyle = `rgba(56, 189, 248, ${gridAlpha})`;
      ctx.lineWidth = 1;

      // Perspective horizon lines
      for (let i = 0; i < 7; i++) {
        const factor = Math.pow((i + 1) / 7, 2.2);
        const y = gridY + factor * (height - gridY);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Converging perspective rays to center vanishing point
      const vanishingX = centerX + (mouse.smoothX - centerX) * 0.05;
      const vCount = 16;
      for (let i = 0; i <= vCount; i++) {
        const xPos = (width / vCount) * i;
        ctx.beginPath();
        ctx.moveTo(vanishingX, gridY * 0.95);
        ctx.lineTo(xPos, height);
        ctx.stroke();
      }
      ctx.restore();

      // 3. Floating Abstract Browser Screen Plane (Subtle wireframe glass rect behind center)
      ctx.save();
      const planeW = Math.min(width * 0.72, 860);
      const planeH = planeW * 0.52;
      const planeX = centerX - planeW / 2 + (mouse.smoothX - centerX) * 0.02;
      const planeY = centerY - planeH / 2 + (mouse.smoothY - centerY) * 0.02;

      // Soft ambient screen border glow
      ctx.strokeStyle = `rgba(56, 189, 248, ${0.06 + mouse.intensity * 0.06})`;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(planeX, planeY, planeW, planeH);

      // Corner perception bracket accents on abstract screen
      const cornerLen = 14;
      ctx.strokeStyle = `rgba(56, 189, 248, ${0.25 + mouse.intensity * 0.2})`;
      ctx.lineWidth = 1.5;

      // Top-Left
      ctx.beginPath();
      ctx.moveTo(planeX, planeY + cornerLen);
      ctx.lineTo(planeX, planeY);
      ctx.lineTo(planeX + cornerLen, planeY);
      ctx.stroke();
      // Top-Right
      ctx.beginPath();
      ctx.moveTo(planeX + planeW - cornerLen, planeY);
      ctx.lineTo(planeX + planeW, planeY);
      ctx.lineTo(planeX + planeW, planeY + cornerLen);
      ctx.stroke();
      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(planeX, planeY + planeH - cornerLen);
      ctx.lineTo(planeX, planeY + planeH);
      ctx.lineTo(planeX + cornerLen, planeY + planeH);
      ctx.stroke();
      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(planeX + planeW - cornerLen, planeY + planeH);
      ctx.lineTo(planeX + planeW, planeY + planeH);
      ctx.lineTo(planeX + planeW, planeY + planeH - cornerLen);
      ctx.stroke();

      ctx.restore();

      // 4. Moving Perception Scan Beam
      scan.x += scan.vx * (1 + mouse.intensity * 0.5);
      if (scan.x > width + 150) {
        scan.x = -150;
      }
      const scanGrad = ctx.createLinearGradient(scan.x - 80, 0, scan.x + 80, 0);
      scanGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
      scanGrad.addColorStop(0.5, `rgba(56, 189, 248, ${0.05 + mouse.intensity * 0.05})`);
      scanGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = scanGrad;
      ctx.fillRect(scan.x - 80, 0, 160, height);

      // 5. LIVING PRIVACY BOUNDARY (Concentric Shield Rings & Holographic Arcs)
      ctx.save();
      ctx.translate(centerX, centerY);

      // Ambient radial core glow
      const coreGlow = ctx.createRadialGradient(
        0,
        0,
        10,
        0,
        0,
        boundaryRadius * 1.3
      );
      coreGlow.addColorStop(0, `rgba(14, 165, 233, ${0.14 + mouse.intensity * 0.12})`);
      coreGlow.addColorStop(0.4, `rgba(56, 189, 248, ${0.05 + mouse.intensity * 0.06})`);
      coreGlow.addColorStop(0.8, 'rgba(99, 102, 241, 0.02)');
      coreGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = coreGlow;
      ctx.beginPath();
      ctx.arc(0, 0, boundaryRadius * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // Outer Segmented Holographic Perimeter Ring
      const outerRingAlpha = 0.15 + mouse.intensity * 0.25;
      ctx.strokeStyle = `rgba(56, 189, 248, ${outerRingAlpha})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 12, 16, 12]);
      ctx.beginPath();
      ctx.arc(0, 0, boundaryRadius, time * 0.1, time * 0.1 + Math.PI * 2);
      ctx.stroke();

      // Middle Counter-rotating Perimeter Ring
      ctx.setLineDash([2, 8]);
      ctx.strokeStyle = `rgba(16, 185, 129, ${0.1 + mouse.intensity * 0.2})`;
      ctx.beginPath();
      ctx.arc(0, 0, boundaryRadius * 0.82, -time * 0.15, -time * 0.15 + Math.PI * 2);
      ctx.stroke();

      // Inner Solid Restrained Barrier
      ctx.setLineDash([]);
      ctx.strokeStyle = `rgba(56, 189, 248, ${0.08 + mouse.intensity * 0.15})`;
      ctx.beginPath();
      ctx.arc(0, 0, boundaryRadius * 0.65, 0, Math.PI * 2);
      ctx.stroke();

      // Subtle Shield Boundary Tick Points
      const tickCount = 12;
      for (let i = 0; i < tickCount; i++) {
        const angle = (Math.PI * 2 / tickCount) * i + time * 0.05;
        const tx = Math.cos(angle) * boundaryRadius;
        const ty = Math.sin(angle) * boundaryRadius;
        ctx.fillStyle = `rgba(56, 189, 248, ${0.3 + mouse.intensity * 0.4})`;
        ctx.beginPath();
        ctx.arc(tx, ty, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // 6. PARTICLE FLOW (SCREEN → PERCEPTION → PRIVACY → SANITIZED CONTEXT)
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.age++;

        // Calculate distance from center privacy boundary
        const dx = p.x - centerX;
        const dy = p.y - centerY;
        const distToCenter = Math.sqrt(dx * dx + dy * dy);

        // When hover active: subtle attraction towards center axis
        if (mouse.intensity > 0) {
          const attractY = (centerY - p.y) * 0.003 * mouse.intensity;
          p.vy += attractY;
        }

        // Particle lifecycle & boundary interaction
        if (p.type === 'raw_sensitive') {
          // Sensitive node reaches boundary: triggers gentle quarantine redaction
          if (distToCenter < boundaryRadius && !p.isRedacted) {
            p.isRedacted = true;
            p.redactionTimer = 30; // 30 frames of soft redacting ionization
          }

          if (p.isRedacted && p.redactionTimer !== undefined) {
            p.redactionTimer--;
            p.vx *= 0.94; // slows down as it's quarantined at perimeter
            p.vy *= 0.94;
            p.opacity *= 0.93; // fades away safely into privacy quarantine
            if (p.redactionTimer <= 0 || p.opacity < 0.02) {
              // Recycle particle back to entry
              Object.assign(p, spawnParticle(true));
              continue;
            }
          }
        } else if (p.type === 'raw_public') {
          // Public/task-required node passes boundary: transforms into verified sanitized node
          if (distToCenter < boundaryRadius) {
            p.type = 'sanitized';
            p.vx *= 1.15; // gains momentum into the intelligence core
          }
        }

        // Normal movement
        p.x += p.vx * (1 + mouse.intensity * 0.4);
        p.y += p.vy;

        // Fade in/out
        if (p.age < 30) {
          p.opacity = (p.age / 30) * p.baseOpacity;
        } else if (p.age > p.maxAge - 30) {
          p.opacity = ((p.maxAge - p.age) / 30) * p.baseOpacity;
        }

        // Wrap around
        if (p.x > width + 40 || p.y < -40 || p.y > height + 40 || p.age >= p.maxAge) {
          Object.assign(p, spawnParticle(true));
          continue;
        }

        // DRAW PARTICLE BASED ON STATE
        ctx.save();
        if (p.type === 'raw_sensitive') {
          if (p.isRedacted) {
            // Quarantined/Masked: delicate amber-red protective ionization
            ctx.fillStyle = `rgba(245, 158, 11, ${p.opacity * 0.9})`;
            ctx.shadowColor = 'rgba(239, 68, 68, 0.8)';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 1.3, 0, Math.PI * 2);
            ctx.fill();

            // Tiny redaction box marker around it
            ctx.strokeStyle = `rgba(245, 158, 11, ${p.opacity * 0.7})`;
            ctx.lineWidth = 0.8;
            ctx.strokeRect(p.x - 4, p.y - 4, 8, 8);
          } else {
            // Raw sensitive incoming: faint amber data token
            ctx.fillStyle = `rgba(251, 191, 36, ${p.opacity * 0.7})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (p.type === 'sanitized') {
          // Permitted & Sanitized AI stream: luminous emerald-cyan photon with trail
          ctx.fillStyle = `rgba(52, 211, 153, ${p.opacity * 0.95})`;
          ctx.shadowColor = 'rgba(16, 185, 129, 0.8)';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 1.1, 0, Math.PI * 2);
          ctx.fill();

          // Subtle tail
          ctx.strokeStyle = `rgba(52, 211, 153, ${p.opacity * 0.35})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 6, p.y - p.vy * 6);
          ctx.stroke();
        } else {
          // Default data node: cool cyan/blue
          ctx.fillStyle = `rgba(125, 211, 252, ${p.opacity * 0.6})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.9, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // Connect nearby nodes with delicate lines
        for (let j = i + 1; j < Math.min(i + 8, particles.length); j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 85) {
            const lineAlpha = (1 - dist / 85) * 0.12 * p.opacity;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${lineAlpha})`;
            ctx.lineWidth = 0.65;
            ctx.stroke();
          }
        }
      }

      // 7. System Activation Effect on Exit Click
      if (activationProgress > 0) {
        ctx.save();
        const flashAlpha = Math.sin(activationProgress * Math.PI) * 0.3;
        ctx.fillStyle = `rgba(14, 165, 233, ${flashAlpha})`;
        ctx.fillRect(0, 0, width, height);

        // Illuminating shockwave ring expanding outward
        const waveRadius = activationProgress * Math.max(width, height) * 0.9;
        ctx.strokeStyle = `rgba(56, 189, 248, ${1 - activationProgress})`;
        ctx.lineWidth = (1 - activationProgress) * 4;
        ctx.beginPath();
        ctx.arc(centerX, centerY, waveRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleStart = () => {
    setIsExiting(true);
    setTimeout(() => {
      onEnter();
    }, 450);
  };

  return (
    <div className={`kavach-landing-wrapper ${isExiting ? 'landing-exiting' : ''}`}>
      <canvas ref={canvasRef} className="kavach-landing-canvas" />

      {/* Subtle Peripheral Geometric Reticles */}
      <div className="landing-corner corner-tl">
        <span className="reticle-bracket">+</span>
        <span className="reticle-label">PERCEPTION: ACTIVE</span>
      </div>
      <div className="landing-corner corner-tr">
        <span className="reticle-label">ISOLATION: 100%</span>
        <span className="reticle-bracket">+</span>
      </div>
      <div className="landing-corner corner-bl">
        <span className="reticle-bracket">+</span>
        <span className="reticle-label">ZERO-RAW INVARIANT</span>
      </div>
      <div className="landing-corner corner-br">
        <span className="reticle-label">AUTONOMOUS AGENT</span>
        <span className="reticle-bracket">+</span>
      </div>

      <div className="kavach-landing-content">
        {/* Living Privacy Boundary Emblem */}
        <div
          className={`landing-emblem-wrap ${isHovered ? 'emblem-hovered' : ''}`}
        >
          <div className="landing-emblem-glow" />
          <div className="landing-emblem-ring ring-outer" />
          <div className="landing-emblem-ring ring-inner" />
          <div className="landing-emblem-icon">
            <ShieldCheck size={30} className="landing-shield" />
          </div>
        </div>

        {/* Hero Title */}
        <h1 className="landing-hero-title">KAVACH</h1>

        {/* Tagline */}
        <p className="landing-hero-subtitle">Privacy-aware browser agents.</p>

        {/* Single Prominent CTA */}
        <div className="landing-btn-container">
          <button
            type="button"
            className={`landing-start-btn ${isHovered ? 'btn-hovered' : ''}`}
            onClick={handleStart}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            aria-label="Activate KAVACH System"
          >
            <span className="btn-glow-layer" />
            <span className="btn-border-gradient" />
            <span className="btn-inner-content">
              <span className="btn-text">LET’S START</span>
              <ArrowRight size={19} className="btn-arrow-icon" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
