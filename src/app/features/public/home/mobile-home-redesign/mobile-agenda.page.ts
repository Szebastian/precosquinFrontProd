import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

interface AgendaEvent {
  id: number;
  title: string;
  time: string;
  date: string;
  category: string;
  location: string;
  artist?: string;
}

@Component({
  selector: 'app-mobile-agenda',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="compact-header">
      <button class="back-btn" (click)="goBack()" aria-label="Volver">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h1 class="header-title">Agenda</h1>
      <div class="header-spacer"></div>
    </header>

    <!-- Date selector pills -->
    <div class="date-bar">
      @for (day of days; track day.key) {
        <button
          class="date-pill"
          [class.date-pill-active]="activeDay() === day.key"
          (click)="selectDay(day.key)">
          <span class="date-pill-day">{{ day.day }}</span>
          <span class="date-pill-num">{{ day.num }}</span>
        </button>
      }
    </div>

    <main class="agenda-content">
      @if (groupedEvents().length > 0) {
        @for (group of groupedEvents(); track group.time) {
          <section class="time-group">
            <div class="time-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>{{ group.time }}</span>
            </div>
            <div class="time-events">
              @for (ev of group.events; track ev.id) {
                <article class="agenda-card">
                  <div class="agenda-card-accent" [style.background]="getCategoryColor(ev.category)"></div>
                  <div class="agenda-card-body">
                    <div class="agenda-card-top">
                      <h3 class="agenda-title">{{ ev.title }}</h3>
                      <span class="agenda-badge" [style.background]="getCategoryBg(ev.category)" [style.color]="getCategoryColor(ev.category)">
                        {{ ev.category }}
                      </span>
                    </div>
                    @if (ev.artist) {
                      <span class="agenda-artist">{{ ev.artist }}</span>
                    }
                    <div class="agenda-meta">
                      <span class="agenda-location">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {{ ev.location }}
                      </span>
                    </div>
                  </div>
                </article>
              }
            </div>
          </section>
        }
      } @else {
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <p class="empty-title">Sin eventos</p>
          <p class="empty-desc">No hay eventos programados para este día</p>
        </div>
      }

      <div class="bottom-spacer"></div>
    </main>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100dvh;
      background: #0E0F12;
      color: #FFFFFF;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      overflow-x: hidden;
    }

    /* ---- Compact Header ---- */
    .compact-header {
      position: sticky;
      top: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      height: 56px;
      padding: 0 16px;
      padding-top: env(safe-area-inset-top, 0px);
      background: rgba(14, 15, 18, 0.88);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .back-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border: none;
      background: none;
      color: #FFFFFF;
      cursor: pointer;
      border-radius: 9999px;
      transition: background 150ms cubic-bezier(0.4, 0, 0.2, 1);
      margin-left: -8px;
    }

    .back-btn:active {
      background: rgba(255, 255, 255, 0.08);
    }

    .header-title {
      flex: 1;
      text-align: center;
      font-size: 17px;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin: 0;
    }

    .header-spacer {
      width: 40px;
    }

    /* ---- Date selector ---- */
    .date-bar {
      display: flex;
      gap: 10px;
      padding: 14px 20px;
      overflow-x: auto;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }

    .date-bar::-webkit-scrollbar {
      display: none;
    }

    .date-pill {
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      padding: 10px 22px;
      border: 1px solid rgba(255, 255, 255, 0.10);
      border-radius: 16px;
      background: #181A1F;
      color: #B0B5C0;
      font-family: inherit;
      cursor: pointer;
      transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
      min-width: 72px;
    }

    .date-pill:active {
      transform: scale(0.96);
    }

    .date-pill-active {
      background: linear-gradient(135deg, #C9A84C, #A08030);
      border-color: transparent;
    }

    .date-pill-day {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .date-pill-active .date-pill-day {
      color: #0E0F12;
    }

    .date-pill-num {
      font-size: 20px;
      font-weight: 700;
      line-height: 1;
    }

    .date-pill-active .date-pill-num {
      color: #0E0F12;
    }

    /* ---- Agenda content ---- */
    .agenda-content {
      flex: 1;
      padding: 0 20px;
      padding-bottom: calc(64px + env(safe-area-inset-bottom, 0px) + 20px);
    }

    .time-group {
      margin-bottom: 24px;
    }

    .time-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 15px;
      font-weight: 700;
      color: #C9A84C;
      margin-bottom: 12px;
      letter-spacing: -0.01em;
    }

    .time-label svg {
      color: #C9A84C;
    }

    .time-events {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .agenda-card {
      display: flex;
      background: #181A1F;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 18px;
      overflow: hidden;
    }

    .agenda-card-accent {
      width: 4px;
      flex-shrink: 0;
    }

    .agenda-card-body {
      flex: 1;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 0;
    }

    .agenda-card-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 10px;
    }

    .agenda-title {
      font-size: 15px;
      font-weight: 600;
      color: #FFFFFF;
      margin: 0;
      line-height: 1.35;
    }

    .agenda-badge {
      flex-shrink: 0;
      padding: 3px 10px;
      border-radius: 9999px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .agenda-artist {
      font-size: 13px;
      font-weight: 500;
      color: #B0B5C0;
    }

    .agenda-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 2px;
    }

    .agenda-location {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 12px;
      color: #6B7280;
    }

    .agenda-location svg {
      flex-shrink: 0;
      color: #6B7280;
    }

    /* ---- Empty state ---- */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 60px 20px;
      color: #6B7280;
      text-align: center;
    }

    .empty-title {
      font-size: 16px;
      font-weight: 600;
      color: #B0B5C0;
      margin: 0;
    }

    .empty-desc {
      font-size: 13px;
      margin: 0;
    }

    .bottom-spacer {
      height: 20px;
    }
  `],
})
export class MobileAgendaPageComponent implements OnInit {
  private readonly http = inject(HttpClient);

  readonly days = [
    { key: 'sab5', day: 'Sáb', num: '5' },
    { key: 'dom6', day: 'Dom', num: '6' },
  ];

  readonly activeDay = signal('sab5');
  readonly events = signal<AgendaEvent[]>([]);

  readonly groupedEvents = computed(() => {
    const day = this.activeDay();
    const dateMap: Record<string, string> = {
      sab5: '2026-09-05',
      dom6: '2026-09-06',
    };
    const targetDate = dateMap[day] ?? '';
    const filtered = this.events().filter(e => e.date === targetDate);

    const groups = new Map<string, AgendaEvent[]>();
    for (const ev of filtered) {
      const time = ev.time || '00:00';
      if (!groups.has(time)) {
        groups.set(time, []);
      }
      groups.get(time)!.push(ev);
    }

    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([time, events]) => ({ time, events }));
  });

  ngOnInit(): void {
    this.loadEvents();
  }

  selectDay(key: string): void {
    this.activeDay.set(key);
  }

  goBack(): void {
    window.history.back();
  }

  getCategoryColor(category: string): string {
    const map: Record<string, string> = {
      Danza: '#60A5FA',
      Música: '#C9A84C',
      Folclore: '#F59E0B',
      Canto: '#A78BFA',
      Instrumental: '#34D399',
      Literatura: '#FB923C',
    };
    return map[category] ?? '#B0B5C0';
  }

  getCategoryBg(category: string): string {
    const color = this.getCategoryColor(category);
    return `${color}18`;
  }

  private loadEvents(): void {
    this.http.get<{ data: AgendaEvent[] }>(`${environment.apiUrl}/agenda/`).subscribe({
      next: (res) => {
        const items = (res.data || res || []) as AgendaEvent[];
        this.events.set(items);
      },
      error: () => {
        this.events.set([]);
      },
    });
  }
}
