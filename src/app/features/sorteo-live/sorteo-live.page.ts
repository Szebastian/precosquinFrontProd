import {
  Component,
  AfterViewInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  signal,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import confetti from 'canvas-confetti';

interface SorteoParticipant {
  id: string;
  full_name: string;
  city: string;
  province: string | null;
  status: string;
}

interface SubCharacter {
  id: string;
  type: 'whale' | 'sea-lion';
  image: string;
  prizeLabel: string;
  winner: SorteoParticipant | null;
  ticketNum: string;
}

interface CharPos {
  x: number;
  dir: number;
  topBase: number;
  bobPhase: number;
  speed: number;
  width: number;
}

const MOCK: SorteoParticipant[] = [
  { id: 'SBA-0031', full_name: 'Juan Perez', city: 'Trelew', province: 'Chubut', status: 'validado' },
  { id: 'SBA-0042', full_name: 'Maria Gomez', city: 'Puerto Madryn', province: 'Chubut', status: 'validado' },
  { id: 'SBA-0043', full_name: 'Carlos Rodriguez', city: 'Gaiman', province: 'Chubut', status: 'validado' },
  { id: 'SBA-0044', full_name: 'Lucia Fernandez', city: 'Rawson', province: 'Chubut', status: 'validado' },
  { id: 'SBA-0045', full_name: 'Martin Silva', city: 'Comodoro Rivadavia', province: 'Chubut', status: 'validado' },
  { id: 'SBA-0046', full_name: 'Ana Martinez', city: 'Esquel', province: 'Chubut', status: 'validado' },
  { id: 'SBA-0047', full_name: 'Diego Lopez', city: 'Puerto Madryn', province: 'Chubut', status: 'validado' },
  { id: 'SBA-0048', full_name: 'Sofia Garcia', city: 'Trelew', province: 'Chubut', status: 'validado' },
  { id: 'SBA-0049', full_name: 'Pablo Gonzalez', city: 'Puerto Piramides', province: 'Chubut', status: 'validado' },
  { id: 'SBA-0050', full_name: 'Camila Torres', city: 'Puerto Madryn', province: 'Chubut', status: 'validado' },
  { id: 'SBA-0051', full_name: 'Fernando Ruiz', city: 'Trelew', province: 'Chubut', status: 'validado' },
  { id: 'SBA-0052', full_name: 'Valentina Diaz', city: 'Gaiman', province: 'Chubut', status: 'validado' },
  { id: 'SBA-0053', full_name: 'Rodrigo Herrera', city: 'Rawson', province: 'Chubut', status: 'validado' },
  { id: 'SBA-0054', full_name: 'Isabel Romero', city: 'Puerto Madryn', province: 'Chubut', status: 'validado' },
  { id: 'SBA-0055', full_name: 'Mateo Castro', city: 'Puerto Piramides', province: 'Chubut', status: 'validado' },
];

@Component({
  selector: 'app-sorteo-live',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- UNIFIED SCENE -->
    <div class="scene">
      <img class="coral-reef" src="assets/img/coral-reef.svg" alt="" />
      <div class="light-rays">
        <div class="ray ray-1"></div><div class="ray ray-2"></div><div class="ray ray-3"></div><div class="ray ray-4"></div><div class="ray ray-5"></div>
      </div>

      <!-- 3 CHARACTERS: 2 whales + 1 sea lion -->
      @for (char of characters(); track char.id; let i = $index) {
        <div class="sub-character" [attr.data-char-index]="i" [class.sub-sea-lion]="char.type === 'sea-lion'">
          <img class="sub-img" [src]="char.image" alt="" />
          <!-- Spinning propeller -->
          <div class="propeller-wrap">
            <div class="prop-spin-blade"></div>
            <div class="prop-spin-blade"></div>
            <div class="prop-spin-blade"></div>
            <div class="prop-spin-blade"></div>
            <div class="prop-spin-blade"></div>
            <div class="prop-spin-blade"></div>
          </div>
          <!-- Bubble trail -->
          <div class="bubble-trail">
            <div class="prop-bubble"></div>
            <div class="prop-bubble"></div>
            <div class="prop-bubble"></div>
            <div class="prop-bubble"></div>
            <div class="prop-bubble"></div>
            <div class="prop-bubble"></div>
          </div>
          <!-- Ball in mouth — hidden, shown during extraction -->
          <div class="ball-in-mouth" [attr.data-ball]="i">
            <div class="bim-outer">
              <div class="bim-shine"></div>
              <span class="bim-ticket">{{ char.ticketNum || '#SBA' }}</span>
            </div>
            <div class="bim-glow"></div>
          </div>
        </div>
      }

      <div class="chest-zone">
        <div class="chest-badge" [class.shuffling]="!isAnimating()">
          <span class="chest-badge-icon">&#128256;</span>
          <span>MESCLANDO</span>
        </div>
        <div class="chest-chain chest-chain-l"></div>
        <div class="chest-chain chest-chain-r"></div>
        <div class="chest-trim chest-trim-top"></div>
        <div class="chest-trim chest-trim-mid"></div>
        <div class="chest-rivet chest-rivet-tl"></div>
        <div class="chest-rivet chest-rivet-tr"></div>
        <div class="chest-rivet chest-rivet-bl"></div>
        <div class="chest-rivet chest-rivet-br"></div>
        <div class="chest-spotlight"></div>
        <div class="chest-spheres">
          @for (sphere of ticketSpheres(); track sphere.id; let i = $index) {
            <div class="chest-sphere"
                 [style.left.px]="sphere.x" [style.top.px]="sphere.y"
                  [class.cs-highlight]="highlightIds().includes(sphere.participantId)">
              <div class="cs-glow"></div>
              <span class="cs-num">{{ i + 1 }}</span>
            </div>
          }
        </div>
        <img class="chest-img" src="assets/img/treasure-chest.svg" alt="" />
        <div class="chest-reflection"></div>
        <div class="chest-label">EL OC&#201;ANO EN PIR&#193;MIDES</div>
      </div>
      <div class="bubbles">
        @for (b of bubblePositions(); track b.id) {
          <div class="bubble"
               [style.left.%]="b.x" [style.animationDuration.s]="b.dur"
               [style.animationDelay.s]="b.delay" [style.width.px]="b.size"
               [style.height.px]="b.size">
          </div>
        }
      </div>
    </div>

    <!-- UI OVERLAY -->
    <div class="ui-overlay">
      <div class="ui-top-left">
        <div class="brand">
          <div class="brand-title">EL OC&#201;ANO EN PIR&#193;MIDES</div>
          <div class="brand-sub">AVISTAJE DE BALENAS Y SNORKELLING</div>
        </div>
        <div class="stats-row">
          <div class="stat-card">
            <span class="stat-emoji">&#127915;</span>
            <div class="stat-data">
              <span class="stat-label">Tickets</span>
              <span class="stat-val">{{ participants().length }}</span>
            </div>
          </div>
          <div class="stat-card stat-card-prizes">
            <span class="stat-emoji">&#127942;</span>
            <div class="stat-data">
              <span class="stat-label">Premios</span>
              <span class="stat-val">3</span>
            </div>
          </div>
        </div>
      </div>

      <div class="ui-top-right">
        <div class="pill pill-live"><span class="live-dot"></span>Pre-Cosquin Streaming Live</div>
        <div class="pill pill-loc"><span>&#128205;</span> Puerto Pir&#225;mides</div>
      </div>

      <div class="ui-sidebar">
        <div class="sb-head"><span class="sb-title">TOP 10 TICKETS</span></div>
        <div class="sb-list">
          @for (p of participants().slice(0, 10); track p.id; let i = $index) {
            <div class="sb-item" [class.sb-winner]="highlightIds().includes(p.id)">
              <span class="sb-num">TICKET</span>
              <span class="sb-id">#{{ p.id.slice(-4) }}</span>
            </div>
          }
        </div>
      </div>

      @if (winnerRevealed()) {
        <div class="winner-zone" (click)="dismissWinner()">
          <div class="winner-card" (click)="$event.stopPropagation()">
            <div class="wc-badge">&#127942; GANADORES</div>
            <div class="wc-winners">
              @for (char of characters(); track char.id; let i = $index) {
                <div class="wc-winner-row" [class.wc-sea-lion]="char.type === 'sea-lion'">
                  <div class="wc-winner-avatar">
                    <img [src]="char.image" alt="" class="wc-avatar-img" />
                  </div>
                  <div class="wc-winner-info">
                    <div class="wc-winner-prize">{{ char.prizeLabel }}</div>
                    <div class="wc-winner-name">{{ char.winner?.full_name }}</div>
                    <div class="wc-winner-details">
                      <span class="wc-winner-city">&#128205; {{ char.winner?.city }}</span>
                      <span class="wc-winner-ticket">{{ char.ticketNum }}</span>
                    </div>
                  </div>
                </div>
              }
            </div>
            <div class="wc-close">Toca para cerrar</div>
          </div>
        </div>
      }

      @if (statusMessage()) {
        <div class="status-msg">{{ statusMessage() }}</div>
      }

      <div class="ui-cta">
        <button class="cta-btn" (click)="extractWinners()" [disabled]="isAnimating() || participants().length < 3">
          <span class="cta-ring cta-r1"></span>
          <span class="cta-ring cta-r2"></span>
          <span class="cta-inner">EXTRAER<br>GANADORES</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host{display:block;width:100vw;height:100vh;overflow:hidden;position:relative;font-family:'Segoe UI',system-ui,-apple-system,sans-serif;background:#020a14}

    /* ===== SCENE ===== */
    .scene{position:absolute;inset:0;width:100vw;height:100vh;z-index:0;overflow:hidden;
      background:radial-gradient(ellipse 140% 30% at 50% 0%,rgba(56,189,248,.06) 0%,transparent 70%),
      linear-gradient(180deg,#0a2744 0%,#082038 10%,#061a2e 20%,#051625 35%,#041220 50%,#030f1b 65%,#020c16 80%,#010a13 92%,#010810 100%)}
    .coral-reef{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center bottom;z-index:1;pointer-events:none;
      -webkit-mask-image:linear-gradient(to bottom,transparent 0%,transparent 40%,black 65%);mask-image:linear-gradient(to bottom,transparent 0%,transparent 40%,black 65%)}

    /* LIGHT RAYS */
    .light-rays{position:absolute;inset:0;pointer-events:none;z-index:2}
    .ray{position:absolute;top:-5%;width:3px;height:80%;background:linear-gradient(180deg,rgba(56,189,248,.15) 0%,rgba(56,189,248,.06) 40%,transparent 100%);transform-origin:top center;animation:rayPulse 5s ease-in-out infinite}
    .ray-1{left:12%;transform:rotate(-6deg);animation-delay:0s;width:5px}
    .ray-2{left:28%;transform:rotate(3deg);animation-delay:1s;width:4px}
    .ray-3{left:48%;transform:rotate(-2deg);animation-delay:.5s;width:6px}
    .ray-4{left:63%;transform:rotate(5deg);animation-delay:1.5s;width:4px}
    .ray-5{left:80%;transform:rotate(-4deg);animation-delay:.8s;width:5px}
    @keyframes rayPulse{0%,100%{opacity:.3}50%{opacity:.75}}

    /* ===== SUB-CHARACTER — JS-driven via rAF ===== */
    .sub-character{position:absolute;width:380px;height:266px;z-index:5;filter:drop-shadow(0 10px 30px rgba(0,0,0,.5));transform-origin:center center;will-change:transform}
    .sub-character.sub-extracting{transition:left 1.5s ease-in-out, top 1.5s ease-in-out, transform .4s ease, width .4s ease, height .4s ease}
    .sub-img{width:100%;height:100%;object-fit:contain}

    /* PROPELLER — positioned at hub (84.2%, 51%) */
    .propeller-wrap{position:absolute;top:51%;left:84.2%;width:40px;height:40px;margin-left:-20px;margin-top:-20px;z-index:6;pointer-events:none;animation:propSpin .3s linear infinite}
    .sub-extracting .propeller-wrap{animation-duration:.8s}
    .prop-spin-blade{position:absolute;top:50%;left:50%;width:3px;height:18px;margin-left:-1.5px;margin-top:-18px;background:linear-gradient(to top,rgba(156,163,175,.1),rgba(209,213,219,.6));border-radius:2px;transform-origin:bottom center}
    .prop-spin-blade:nth-child(1){transform:rotate(0deg)}
    .prop-spin-blade:nth-child(2){transform:rotate(60deg)}
    .prop-spin-blade:nth-child(3){transform:rotate(120deg)}
    .prop-spin-blade:nth-child(4){transform:rotate(180deg)}
    .prop-spin-blade:nth-child(5){transform:rotate(240deg)}
    .prop-spin-blade:nth-child(6){transform:rotate(300deg)}
    @keyframes propSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}

    /* BUBBLE TRAIL */
    .bubble-trail{position:absolute;top:53%;left:88%;z-index:4;pointer-events:none}
    .prop-bubble{position:absolute;border-radius:50%;background:radial-gradient(circle at 30% 30%,rgba(255,255,255,.3),rgba(56,189,248,.15));border:1px solid rgba(56,189,248,.15);animation:bubbleRise 2.5s ease-out infinite}
    .prop-bubble:nth-child(1){width:6px;height:6px;left:0;animation-delay:0s}
    .prop-bubble:nth-child(2){width:4px;height:4px;left:8px;animation-delay:.4s}
    .prop-bubble:nth-child(3){width:5px;height:5px;left:-5px;animation-delay:.8s}
    .prop-bubble:nth-child(4){width:3px;height:3px;left:12px;animation-delay:1.2s}
    .prop-bubble:nth-child(5){width:5px;height:5px;left:3px;animation-delay:1.6s}
    .prop-bubble:nth-child(6){width:4px;height:4px;left:-8px;animation-delay:2s}
    @keyframes bubbleRise{
      0%{opacity:.6;transform:translate(0,0) scale(1)}
      50%{opacity:.3;transform:translate(-15px,-30px) scale(1.3)}
      100%{opacity:0;transform:translate(-25px,-60px) scale(.5)}
    }

    /* BALL IN MOUTH — hidden by default, appears on extraction */
    .ball-in-mouth{position:absolute;width:54px;height:54px;transform:scale(0);opacity:0;z-index:10;pointer-events:none;
      transition:transform .6s cubic-bezier(.34,1.56,.64,1), opacity .4s ease}
    /* Whale: ball near mouth (front-right) */
    .sub-character .ball-in-mouth{right:2%;top:50%}
    /* Sea lion: ball near snout (extends further) */
    .sub-sea-lion .ball-in-mouth{right:-4%;top:48%}
    .bim-outer{width:100%;height:100%;border-radius:50%;
      background:radial-gradient(circle at 35% 30%,rgba(165,243,252,.6) 0%,rgba(34,211,238,.4) 20%,rgba(6,182,212,.3) 40%,rgba(8,145,178,.2) 60%,rgba(14,116,144,.15) 80%,rgba(14,116,144,.05) 100%);
      border:2px solid rgba(34,211,238,.3);position:relative;overflow:hidden;
      box-shadow:0 0 30px rgba(34,211,238,.3),0 0 60px rgba(34,211,238,.15),inset 0 0 30px rgba(34,211,238,.1)}
    .bim-shine{position:absolute;top:12%;left:18%;width:35%;height:25%;border-radius:50%;background:radial-gradient(ellipse,rgba(255,255,255,.45) 0%,transparent 70%);transform:rotate(-25deg)}
    .bim-ticket{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:.55rem;font-weight:900;color:#22d3ee;letter-spacing:.05em;white-space:nowrap;text-shadow:0 0 8px rgba(34,211,238,.5)}
    .bim-glow{position:absolute;inset:-20px;border-radius:50%;background:radial-gradient(circle,rgba(34,211,238,.15) 0%,transparent 70%);animation:bimGlow 2s ease-in-out infinite;pointer-events:none}
    @keyframes bimGlow{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.05)}}

    /* ===== CHEST ZONE ===== */
    .chest-zone{position:absolute;bottom:6%;left:50%;transform:translateX(-50%);width:300px;height:260px;z-index:4}
    .chest-zone::before{content:'';position:absolute;inset:-20px -10px;border-radius:50%;background:radial-gradient(ellipse 70% 55% at 50% 60%,rgba(251,191,36,.12) 0%,rgba(251,191,36,.04) 40%,transparent 70%);pointer-events:none;animation:chestAura 4s ease-in-out infinite}
    @keyframes chestAura{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:1;transform:scale(1.05)}}
    .chest-reflection{position:absolute;bottom:-35px;left:8%;width:84%;height:35px;background:linear-gradient(180deg,rgba(251,191,36,.06) 0%,transparent 100%);filter:blur(8px);border-radius:50%;pointer-events:none;animation:reflPulse 3s ease-in-out infinite}
    @keyframes reflPulse{0%,100%{opacity:.4}50%{opacity:.7}}
    .chest-chain{position:absolute;top:-18px;width:4px;height:22px;border-radius:2px;background:linear-gradient(180deg,#a16207,#92400e 40%,#78350f);opacity:.6;pointer-events:none}
    .chest-chain-l{left:16%;transform:rotate(-6deg)}
    .chest-chain-r{right:16%;transform:rotate(6deg)}
    .chest-chain::before{content:'';position:absolute;top:0;left:-1.5px;width:7px;height:5px;border:2px solid #a16207;border-radius:2px;background:transparent}
    .chest-chain::after{content:'';position:absolute;bottom:-5px;left:-2.5px;width:9px;height:9px;border:2.5px solid #92400e;border-radius:50%;background:rgba(120,53,15,.3)}
    .chest-trim{position:absolute;left:4%;right:4%;height:3px;background:linear-gradient(90deg,transparent,#d97706 15%,#fbbf24 50%,#d97706 85%,transparent);border-radius:2px;pointer-events:none;z-index:3;opacity:.5}
    .chest-trim-top{top:22%}
    .chest-trim-mid{top:55%;opacity:.3}
    .chest-rivet{position:absolute;width:6px;height:6px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fde68a,#92400e);box-shadow:0 1px 3px rgba(0,0,0,.5);pointer-events:none;z-index:3}
    .chest-rivet-tl{top:24%;left:6%}
    .chest-rivet-tr{top:24%;right:6%}
    .chest-rivet-bl{bottom:28%;left:6%}
    .chest-rivet-br{bottom:28%;right:6%}
    .chest-badge{position:absolute;top:-35px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:6px;padding:5px 14px;background:rgba(15,23,42,.9);border:1px solid rgba(34,211,238,.25);border-radius:999px;backdrop-filter:blur(8px);font-size:.55rem;font-weight:700;letter-spacing:.08em;color:#22d3ee;white-space:nowrap;z-index:5;opacity:0;transition:opacity .4s}
    .chest-badge.shuffling{opacity:1;animation:badgePulse 1.5s ease-in-out infinite}
    .chest-badge-icon{font-size:.7rem;animation:spinBadge 2s linear infinite}
    @keyframes badgePulse{0%,100%{border-color:rgba(34,211,238,.25);box-shadow:0 0 8px rgba(34,211,238,.1)}50%{border-color:rgba(34,211,238,.5);box-shadow:0 0 16px rgba(34,211,238,.25)}}
    @keyframes spinBadge{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    .chest-label{position:absolute;bottom:-20px;left:50%;transform:translateX(-50%);font-size:.45rem;font-weight:700;letter-spacing:.15em;color:rgba(148,163,184,.4);text-transform:uppercase;white-space:nowrap;pointer-events:none}
    .chest-img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:center bottom;z-index:1;filter:drop-shadow(0 8px 20px rgba(0,0,0,.6)) drop-shadow(0 0 20px rgba(251,191,36,.12));pointer-events:none}
    .chest-spheres{position:absolute;top:20%;left:14%;width:72%;height:38%;z-index:2;overflow:hidden;border-radius:8px 8px 4px 4px}
    .chest-spotlight{position:absolute;top:-8px;left:50%;transform:translateX(-50%);width:55%;height:25px;background:radial-gradient(ellipse,rgba(251,191,36,.18) 0%,transparent 70%);filter:blur(6px);pointer-events:none;z-index:3}

    /* CHEST SPHERES */
    .chest-sphere{position:absolute;width:22px;height:22px;border-radius:50%;z-index:3;cursor:default;
      transition:left .7s cubic-bezier(.4,0,.2,1),top .7s cubic-bezier(.4,0,.2,1),transform .35s ease,box-shadow .35s ease;
      animation:sphereFloat 3.5s ease-in-out infinite}
    .chest-sphere:nth-child(3n){animation-delay:0s;transition-duration:.65s,.65s}
    .chest-sphere:nth-child(3n+1){animation-delay:.6s;transition-duration:.75s,.75s}
    .chest-sphere:nth-child(3n+2){animation-delay:1.2s;transition-duration:.85s,.85s}
    .chest-sphere:nth-child(5n){transition-duration:.55s,.55s}
    .chest-sphere:nth-child(7n){transition-duration:.9s,.9s}
    @keyframes sphereFloat{0%,100%{transform:translateY(0) rotate(0deg)}33%{transform:translateY(-4px) rotate(3deg)}66%{transform:translateY(-2px) rotate(-2deg)}}
    .chest-sphere:nth-child(odd){background:radial-gradient(circle at 35% 30%,#fef3c7,#fbbf24 40%,#d97706 75%,#b45309 100%);box-shadow:0 0 10px rgba(251,191,36,.5),0 2px 8px rgba(0,0,0,.3)}
    .chest-sphere:nth-child(even){background:radial-gradient(circle at 35% 30%,#cffafe,#22d3ee 40%,#0891b2 75%,#0e7490 100%);box-shadow:0 0 10px rgba(34,211,238,.5),0 2px 8px rgba(0,0,0,.3)}
    .chest-sphere::before{content:'';position:absolute;top:2px;left:3px;width:7px;height:5px;border-radius:50%;background:rgba(255,255,255,.4);transform:rotate(-20deg);pointer-events:none}
    .chest-sphere:hover{transform:scale(1.15);z-index:4}
    .chest-sphere:hover::after{content:'';position:absolute;inset:-4px;border-radius:50%;border:1.5px solid rgba(255,255,255,.3);animation:shimmerRing .8s ease-out forwards;pointer-events:none}
    @keyframes shimmerRing{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1.5)}}
    .cs-glow{position:absolute;inset:-4px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.2),transparent 65%)}
    .cs-num{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:.45rem;font-weight:800;color:rgba(0,0,0,.5);text-shadow:0 1px 1px rgba(255,255,255,.3)}
    .cs-highlight{transform:scale(1.8)!important;box-shadow:0 0 20px rgba(34,211,238,.9),0 0 40px rgba(34,211,238,.5),0 0 60px rgba(251,191,36,.3)!important;z-index:20!important;animation:hlPulse .8s ease-in-out infinite!important;border:2px solid rgba(255,255,255,.6)!important}
    @keyframes hlPulse{0%,100%{box-shadow:0 0 25px rgba(34,211,238,.8),0 0 50px rgba(34,211,238,.4)}50%{box-shadow:0 0 35px rgba(34,211,238,1),0 0 70px rgba(34,211,238,.5)}}

    /* BUBBLES */
    .bubbles{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:2}
    .bubble{position:absolute;bottom:-20px;border-radius:50%;background:radial-gradient(circle at 30% 30%,rgba(255,255,255,.25),rgba(100,200,255,.1) 60%,transparent);border:1px solid rgba(255,255,255,.1);animation:bubbleFloat linear infinite}
    @keyframes bubbleFloat{0%{transform:translateY(0) translateX(0);opacity:.6}50%{transform:translateY(-50vh) translateX(10px);opacity:.4}100%{transform:translateY(-110vh) translateX(-5px);opacity:0}}

    /* ===== UI OVERLAY ===== */
    .ui-overlay{position:absolute;inset:0;z-index:10;pointer-events:none}
    .ui-overlay>*{pointer-events:auto}

    .ui-top-left{position:absolute;top:1rem;left:1.2rem;display:flex;flex-direction:column;gap:.5rem}
    .brand-title{font-size:1.6rem;font-weight:900;color:#f0f9ff;letter-spacing:.08em;text-shadow:0 0 20px rgba(56,189,248,.5),0 2px 8px rgba(0,0,0,.7);font-family:Georgia,'Times New Roman',serif;line-height:1}
    .brand-sub{font-size:.55rem;font-weight:700;letter-spacing:.25em;color:#38bdf8;text-shadow:0 0 12px rgba(56,189,248,.4)}
    .stats-row{display:flex;gap:.4rem}
    .stat-card{display:flex;align-items:center;gap:.35rem;padding:.35rem .6rem;background:rgba(15,23,42,.75);border:1px solid rgba(56,189,248,.2);border-radius:8px;backdrop-filter:blur(12px)}
    .stat-card-prizes{border-color:rgba(251,191,36,.25)}
    .stat-emoji{font-size:.85rem}
    .stat-data{display:flex;flex-direction:column}
    .stat-label{font-size:.45rem;font-weight:600;letter-spacing:.05em;color:#64748b;text-transform:uppercase}
    .stat-val{font-size:1rem;font-weight:800;color:#38bdf8;line-height:1}

    .ui-top-right{position:absolute;top:1rem;right:280px;display:flex;gap:.4rem}
    .pill{display:flex;align-items:center;gap:.35rem;padding:.35rem .75rem;border-radius:999px;font-size:.6rem;font-weight:700;backdrop-filter:blur(12px)}
    .pill-live{background:rgba(220,38,38,.2);border:1px solid rgba(239,68,68,.35);color:#fca5a5}
    .live-dot{width:6px;height:6px;border-radius:50%;background:#ef4444;animation:livePulse 1.5s ease-in-out infinite}
    @keyframes livePulse{0%,100%{opacity:1;box-shadow:0 0 4px #ef4444}50%{opacity:.4;box-shadow:0 0 10px #ef4444}}
    .pill-loc{background:rgba(15,23,42,.7);border:1px solid rgba(255,255,255,.08);color:#cbd5e1}

    /* SIDEBAR */
    .ui-sidebar{position:absolute;top:1rem;right:1rem;width:250px;background:rgba(15,23,42,.75);border:1px solid rgba(56,189,248,.15);border-radius:12px;backdrop-filter:blur(12px);overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.04);z-index:12}
    .sb-head{padding:.5rem .8rem;border-bottom:1px solid rgba(56,189,248,.12);background:rgba(56,189,248,.05)}
    .sb-title{font-size:.6rem;font-weight:800;letter-spacing:.14em;color:#38bdf8;text-shadow:0 0 8px rgba(56,189,248,.3)}
    .sb-list{max-height:360px;overflow-y:auto}
    .sb-list::-webkit-scrollbar{width:3px}
    .sb-list::-webkit-scrollbar-track{background:transparent}
    .sb-list::-webkit-scrollbar-thumb{background:rgba(56,189,248,.2);border-radius:2px}
    .sb-item{display:flex;align-items:center;justify-content:space-between;padding:.35rem .8rem;font-size:.7rem;color:#cbd5e1;border-bottom:1px solid rgba(255,255,255,.04);transition:background .2s}
    .sb-item:hover{background:rgba(56,189,248,.06)}
    .sb-winner{background:rgba(34,211,238,.12)!important;color:#22d3ee;font-weight:700;border-left:3px solid #22d3ee;padding-left:.5rem}
    .sb-num{font-weight:700;letter-spacing:.06em;font-size:.62rem}
    .sb-id{font-family:'Courier New',monospace;font-size:.72rem;font-weight:800;color:#94a3b8}
    .sb-winner .sb-id{color:#67e8f9}

    /* WINNER CARD — 3 winners */
    .winner-zone{position:absolute;bottom:12%;left:50%;transform:translateX(-50%);z-index:30;animation:winnerIn .6s cubic-bezier(.34,1.56,.64,1)}
    @keyframes winnerIn{from{opacity:0;transform:translateX(-50%) translateY(25px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
    .winner-card{background:rgba(15,23,42,.92);border:2px solid rgba(34,211,238,.5);border-radius:14px;padding:1rem 1.5rem;backdrop-filter:blur(16px);box-shadow:0 0 40px rgba(34,211,238,.15),0 15px 40px rgba(0,0,0,.5);min-width:440px;max-width:560px;text-align:center}
    .wc-badge{display:inline-block;padding:.3rem 1rem;background:linear-gradient(135deg,#22d3ee,#0ea5e9);color:#fff;font-size:.65rem;font-weight:900;letter-spacing:.08em;border-radius:999px;margin-bottom:.6rem;box-shadow:0 0 15px rgba(34,211,238,.4)}
    .wc-winners{display:flex;flex-direction:column;gap:.5rem}
    .wc-winner-row{display:flex;align-items:center;gap:.8rem;padding:.6rem .8rem;background:rgba(34,211,238,.04);border:1px solid rgba(34,211,238,.12);border-radius:10px;transition:border-color .3s}
    .wc-winner-row.wc-sea-lion{background:rgba(16,185,129,.04);border-color:rgba(16,185,129,.15)}
    .wc-winner-avatar{width:48px;height:48px;flex-shrink:0;border-radius:50%;overflow:hidden;background:rgba(0,0,0,.3);border:2px solid rgba(34,211,238,.3)}
    .wc-sea-lion .wc-winner-avatar{border-color:rgba(16,185,129,.3)}
    .wc-avatar-img{width:100%;height:100%;object-fit:contain}
    .wc-winner-info{text-align:left;flex:1;min-width:0}
    .wc-winner-prize{font-size:.5rem;font-weight:700;letter-spacing:.06em;color:#67e8f9;text-transform:uppercase;margin-bottom:.1rem}
    .wc-sea-lion .wc-winner-prize{color:#6ee7b7}
    .wc-winner-name{font-size:.95rem;font-weight:800;color:#f1f5f9;line-height:1.2}
    .wc-winner-details{display:flex;align-items:center;gap:.6rem;margin-top:.15rem}
    .wc-winner-city{font-size:.6rem;color:#94a3b8}
    .wc-winner-ticket{font-family:'Courier New',monospace;font-size:.65rem;font-weight:800;color:#22d3ee;background:rgba(34,211,238,.08);padding:.1rem .4rem;border-radius:4px}
    .wc-sea-lion .wc-winner-ticket{color:#6ee7b7;background:rgba(16,185,129,.08)}
    .wc-close{margin-top:.5rem;font-size:.52rem;color:#475569;cursor:pointer}
    .wc-close:hover{color:#94a3b8}

    /* STATUS */
    .status-msg{position:absolute;top:42%;left:50%;transform:translate(-50%,-50%);padding:.6rem 1.2rem;background:rgba(15,23,42,.9);border:1px solid rgba(56,189,248,.3);border-radius:10px;color:#38bdf8;font-size:.8rem;font-weight:600;letter-spacing:.05em;backdrop-filter:blur(12px);z-index:25;pointer-events:none;animation:statusPulse 1.2s ease-in-out infinite;white-space:nowrap}
    @keyframes statusPulse{0%,100%{opacity:.8}50%{opacity:1}}

    /* CTA BUTTON */
    .ui-cta{position:absolute;bottom:1.5rem;right:1.5rem;z-index:12}
    .cta-btn{position:relative;width:100px;height:100px;border-radius:50%;border:3px solid transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;background:linear-gradient(145deg,#0c4a6e,#075985) padding-box,linear-gradient(135deg,#22d3ee,#0ea5e9 40%,#fbbf24 70%,#f59e0b) border-box;box-shadow:0 0 30px rgba(34,211,238,.35),0 0 60px rgba(34,211,238,.12),inset 0 1px 0 rgba(255,255,255,.1);transition:all .3s;animation:ctaNeonPulse 2s ease-in-out infinite}
    @keyframes ctaNeonPulse{0%,100%{box-shadow:0 0 30px rgba(34,211,238,.35),0 0 60px rgba(34,211,238,.12)}50%{box-shadow:0 0 45px rgba(34,211,238,.55),0 0 80px rgba(34,211,238,.2),0 0 100px rgba(251,191,36,.1)}}
    .cta-btn:hover:not(:disabled){transform:scale(1.08);box-shadow:0 0 55px rgba(34,211,238,.6),0 0 90px rgba(34,211,238,.25)}
    .cta-btn:disabled{opacity:.3;cursor:not-allowed}
    .cta-ring{position:absolute;border-radius:50%;border:2px solid rgba(34,211,238,.3);animation:ringPulse 2s ease-in-out infinite}
    .cta-r1{inset:-8px}
    .cta-r2{inset:-18px;border-color:rgba(251,191,36,.15);animation-delay:.5s}
    @keyframes ringPulse{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:1;transform:scale(1.04)}}
    .cta-inner{color:#e0f2fe;font-size:.62rem;font-weight:900;letter-spacing:.1em;text-align:center;line-height:1.3;pointer-events:none;text-shadow:0 0 10px rgba(56,189,248,.4)}

    /* RESPONSIVE */
    @media(max-width:1024px){
      .ui-sidebar{width:220px}.ui-top-right{right:240px}
      .sub-character{width:300px;height:210px}
      .chest-zone{width:240px;height:210px}
      .winner-card{min-width:360px}
    }
    @media(max-width:768px){
      .ui-sidebar{display:none}
      .ui-top-right{right:1rem;top:auto;bottom:5rem}
      .ui-cta{right:1rem;bottom:1rem}
      .brand-title{font-size:1.1rem}
      .sub-character{width:200px;height:140px}
      .chest-zone{width:200px;height:180px}
      .winner-card{min-width:280px;padding:.8rem}
      .wc-winner-avatar{width:36px;height:36px}
      .wc-winner-name{font-size:.8rem}
      .ball-in-mouth{width:38px;height:38px}
    }
  `]
})
export class SorteoLivePageComponent implements AfterViewInit, OnDestroy {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  participants = signal<SorteoParticipant[]>([]);
  isAnimating = signal(false);
  winnerRevealed = signal(false);
  highlightIds = signal<string[]>([]);
  statusMessage = signal('');
  ticketSpheres = signal<{ id: string; participantId: string; x: number; y: number }[]>([]);
  bubblePositions = signal<{ id: number; x: number; size: number; dur: number; delay: number }[]>([]);

  characters = signal<SubCharacter[]>([
    {
      id: 'whale-1',
      type: 'whale',
      image: 'assets/img/whale.svg',
      prizeLabel: 'Avistaje de Ballenas para 2 personas',
      winner: null,
      ticketNum: '',
    },
    {
      id: 'whale-2',
      type: 'whale',
      image: 'assets/img/whale.svg',
      prizeLabel: 'Avistaje de Ballenas para 2 personas',
      winner: null,
      ticketNum: '',
    },
    {
      id: 'sea-lion-1',
      type: 'sea-lion',
      image: 'assets/img/sea-lion.svg',
      prizeLabel: 'Snorkelling con Lobos Marinos para 2 personas',
      winner: null,
      ticketNum: '',
    },
  ]);

  private disposed = false;
  private shuffleTimer: ReturnType<typeof setTimeout> | null = null;
  private rafId = 0;
  private charPos: CharPos[] = [
    { x: 0, dir: -1, topBase: 8, bobPhase: 0, speed: 0, width: 380 },
    { x: 0, dir: 1, topBase: 14, bobPhase: 2, speed: 0, width: 380 },
    { x: 0, dir: -1, topBase: 18, bobPhase: 4, speed: 0, width: 380 },
  ];

  ngAfterViewInit(): void {
    this.loadParticipants();
    this.generateBubbles();
    this.startShuffle();
    this.initCharacters();
  }

  ngOnDestroy(): void {
    this.disposed = true;
    if (this.shuffleTimer) clearTimeout(this.shuffleTimer);
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }

  /* ── CHARACTER JS ANIMATION ── */
  private initCharacters(): void {
    const vw = window.innerWidth;
    // Different speeds for visual variety
    this.charPos[0].speed = vw / 1200;  // whale 1 — slower
    this.charPos[1].speed = vw / 1000;  // whale 2 — medium
    this.charPos[2].speed = vw / 850;   // sea lion — faster

    // Stagger starting positions
    this.charPos[0].x = vw + 50;
    this.charPos[1].x = -this.charPos[1].width - 50; // starts from left going right
    this.charPos[2].x = vw + 450;

    this.tickAll();
  }

  private tickAll = (): void => {
    if (this.disposed) return;
    if (this.isAnimating() || this.winnerRevealed()) {
      this.rafId = requestAnimationFrame(this.tickAll);
      return;
    }

    const vw = window.innerWidth;
    const els = document.querySelectorAll<HTMLElement>('[data-char-index]');

    els.forEach((el, i) => {
      if (i >= this.charPos.length) return;
      const s = this.charPos[i];
      const subW = el.offsetWidth || s.width;

      s.x += s.speed * s.dir;

      // Wrap when fully off-screen
      if (s.dir === -1 && s.x < -subW - 20) {
        s.x = vw + 20;
        s.topBase = 8 + i * 5 + Math.random() * 3;
      } else if (s.dir === 1 && s.x > vw + 20) {
        s.x = -subW - 20;
        s.topBase = 8 + i * 5 + Math.random() * 3;
      }

      s.bobPhase += 0.008;
      const bob = Math.sin(s.bobPhase) * 2;
      const top = s.topBase + bob;
      const tilt = Math.sin(s.bobPhase * 0.7) * 2;
      const scaleX = s.dir === -1 ? 1 : -1;

      el.style.left = `${s.x}px`;
      el.style.top = `${top}%`;
      el.style.transform = `rotate(${tilt}deg) scaleX(${scaleX})`;
    });

    this.rafId = requestAnimationFrame(this.tickAll);
  };

  loadParticipants(): void {
    this.http.get<{ data: SorteoParticipant[] }>(
      `${environment.apiUrl}/sorteo-avistaje/validados`
    ).subscribe({
      next: (res) => {
        const data = res.data || [];
        this.participants.set(data.length > 0 ? data : MOCK);
        this.cdr.markForCheck();
        this.generateTicketSpheres();
      },
      error: () => {
        this.participants.set(MOCK);
        this.cdr.markForCheck();
        this.generateTicketSpheres();
      },
    });
  }

  private generateTicketSpheres(): void {
    const parts = this.participants();
    const spheres: { id: string; participantId: string; x: number; y: number }[] = [];
    const cols = 5;
    const cellW = 28;
    const cellH = 22;
    const containerW = 150;
    const containerH = 68;
    const offsetX = (containerW - cols * cellW) / 2;

    for (let i = 0; i < Math.min(parts.length, 15); i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      spheres.push({
        id: `sp-${i}`,
        participantId: parts[i].id,
        x: offsetX + col * cellW + (Math.random() - 0.5) * 4,
        y: 4 + row * cellH + (Math.random() - 0.5) * 3,
      });
    }
    this.ticketSpheres.set(spheres);
  }

  private generateBubbles(): void {
    const bubbles: { id: number; x: number; size: number; dur: number; delay: number }[] = [];
    for (let i = 0; i < 40; i++) {
      bubbles.push({
        id: i,
        x: Math.random() * 100,
        size: 3 + Math.random() * 8,
        dur: 6 + Math.random() * 8,
        delay: Math.random() * 10,
      });
    }
    this.bubblePositions.set(bubbles);
  }

  private startShuffle(): void {
    const tick = () => {
      if (this.disposed || this.isAnimating()) {
        this.shuffleTimer = setTimeout(tick, 800);
        return;
      }
      this.shuffleSpheres();
      const next = 1200 + Math.random() * 1000;
      this.shuffleTimer = setTimeout(tick, next);
    };
    this.shuffleTimer = setTimeout(tick, 1500);
  }

  private shuffleSpheres(): void {
    const current = this.ticketSpheres();
    if (current.length < 2) return;

    const roll = Math.random();
    let next: typeof current;

    if (roll < 0.6) {
      next = [...current];
      const swaps = 2 + Math.floor(Math.random() * 3);
      for (let s = 0; s < swaps; s++) {
        const i = Math.floor(Math.random() * next.length);
        let j = Math.floor(Math.random() * (next.length - 1));
        if (j >= i) j++;
        const tmpX = next[i].x, tmpY = next[i].y;
        next[i] = { ...next[i], x: next[j].x, y: next[j].y };
        next[j] = { ...next[j], x: tmpX, y: tmpY };
      }
    } else if (roll < 0.85) {
      const maxW = 150, maxH = 68;
      next = current.map((s) => {
        const dir = Math.random() < 0.5 ? 1 : -1;
        const useX = Math.random() < 0.6;
        const shift = dir * (10 + Math.random() * 15);
        if (useX) {
          let newVal = s.x + shift;
          if (newVal < 0) newVal = maxW - 22;
          if (newVal > maxW - 22) newVal = 2;
          return { ...s, x: newVal };
        } else {
          let newVal = s.y + shift;
          if (newVal < 0) newVal = maxH - 20;
          if (newVal > maxH - 20) newVal = 2;
          return { ...s, y: newVal };
        }
      });
    } else {
      const containerW = 150, containerH = 68;
      next = current.map(s => ({
        ...s,
        x: 5 + Math.random() * (containerW - 27),
        y: 2 + Math.random() * (containerH - 24),
      }));
    }

    this.ticketSpheres.set(next);
    this.cdr.markForCheck();
  }

  /* ── EXTRACTION ── */
  extractWinners(): void {
    if (this.isAnimating() || this.participants().length < 3) return;

    // Pick 3 unique winners
    const pool = [...this.participants()];
    const winners: SorteoParticipant[] = [];
    for (let i = 0; i < 3 && pool.length > 0; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      winners.push(pool.splice(idx, 1)[0]);
    }

    // Assign winners to characters
    this.characters.update(chars =>
      chars.map((c, i) => ({
        ...c,
        winner: winners[i],
        ticketNum: winners[i].id.startsWith('SBA-') ? winners[i].id : `SBA-${winners[i].id}`,
      }))
    );

    this.isAnimating.set(true);
    this.highlightIds.set(winners.map(w => w.id));
    this.statusMessage.set('Preparando extracci\u00f3n...');
    this.cdr.markForCheck();

    /* PHASE 1: All characters sail to extraction positions (CSS transition) */
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const charW = vw < 768 ? 200 : vw < 1024 ? 300 : 380;
    const extractTargets = [
      { leftPx: vw * 0.18, topPct: 18 },   // whale 1 — left
      { leftPx: vw * 0.42 - charW / 2, topPct: 14 }, // whale 2 — center
      { leftPx: vw * 0.65, topPct: 20 },   // sea lion — right
    ];

    const els = document.querySelectorAll<HTMLElement>('[data-char-index]');
    els.forEach((el, i) => {
      if (i >= extractTargets.length) return;
      const t = extractTargets[i];
      el.classList.add('sub-extracting');
      el.style.left = `${t.leftPx}px`;
      el.style.top = `${t.topPct}%`;
      el.style.transform = 'rotate(0deg) scaleX(1)';
      // Update position state so rAF loop picks up correctly on dismiss
      this.charPos[i].x = t.leftPx;
      this.charPos[i].topBase = t.topPct;
    });

    /* PHASE 2: After characters arrive, pick balls sequentially */
    setTimeout(() => {
      this.extractBallsSequentially(0);
    }, 1700);
  }

  private extractBallsSequentially(index: number): void {
    if (this.disposed) return;

    if (index >= 3) {
      /* All balls picked — reveal winners */
      setTimeout(() => {
        this.statusMessage.set('');
        this.isAnimating.set(false);
        this.winnerRevealed.set(true);
        this.cdr.markForCheck();
        this.fireConfetti();
      }, 700);
      return;
    }

    const labels = [
      'Ballena 1 saca su bola...',
      'Ballena 2 saca su bola...',
      'Lobo marino saca su bola...',
    ];
    this.statusMessage.set(labels[index] || '');
    this.cdr.markForCheck();

    // Animate ball appearance in character's mouth
    const ballEl = document.querySelector(`[data-ball="${index}"]`) as HTMLElement | null;
    if (ballEl) {
      ballEl.style.transform = 'scale(1)';
      ballEl.style.opacity = '1';
    }

    setTimeout(() => {
      this.extractBallsSequentially(index + 1);
    }, 1400);
  }

  private fireConfetti(): void {
    const end = Date.now() + 3500;
    const frame = () => {
      confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors: ['#f59e0b', '#fbbf24', '#22d3ee', '#f8fafc'] });
      confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors: ['#f59e0b', '#fbbf24', '#22d3ee', '#f8fafc'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
    confetti({ particleCount: 200, spread: 90, origin: { x: 0.5, y: 0.5 }, colors: ['#f59e0b', '#fbbf24', '#06b6d4', '#22d3ee', '#10b981'] });
  }

  dismissWinner(): void {
    this.winnerRevealed.set(false);
    this.highlightIds.set([]);
    this.statusMessage.set('');

    // Reset all balls
    document.querySelectorAll('.ball-in-mouth').forEach(el => {
      (el as HTMLElement).style.transform = 'scale(0)';
      (el as HTMLElement).style.opacity = '0';
    });

    // Reset characters to off-screen and resume sailing
    const vw = window.innerWidth;
    const els = document.querySelectorAll<HTMLElement>('[data-char-index]');
    els.forEach((el, i) => {
      if (i >= this.charPos.length) return;
      el.classList.remove('sub-extracting');
      el.style.transition = 'none';
      const s = this.charPos[i];
      // whale-1 and sea-lion go left (dir=-1), whale-2 goes right (dir=1)
      s.x = s.dir === -1 ? vw + 50 : -s.width - 50;
      s.topBase = 8 + i * 5 + Math.random() * 3;
      el.style.left = `${s.x}px`;
      el.style.top = `${s.topBase}%`;
      el.style.transform = `scaleX(${s.dir === -1 ? 1 : -1})`;
      requestAnimationFrame(() => {
        el.style.transition = '';
      });
    });

    // Reset winners in characters
    this.characters.update(chars =>
      chars.map(c => ({ ...c, winner: null, ticketNum: '' }))
    );

    this.generateTicketSpheres();
    this.cdr.markForCheck();
  }
}
