import {
  Component,
  ChangeDetectionStrategy,
  input,
} from '@angular/core';

interface EventData {
  date: string;
  time: string;
  venue: string;
  title: string;
}

@Component({
  selector: 'app-mobile-event-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="event-card">
      <div class="event-content">
        <div class="event-date-badge">
          {{ event().date }}
        </div>

        <p class="event-time-venue">
          {{ event().time }} · {{ event().venue }}
        </p>

        <h3 class="event-title">
          {{ event().title }}
        </h3>

        <button class="event-calendar-btn">
          Agregar al calendario
        </button>
      </div>
    </div>
  `,
  styles: [`
    .event-card {
      background: #181a1f;
      border-radius: 20px;
      margin: 20px 16px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .event-content {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .event-date-badge {
      display: inline-block;
      background: rgba(76, 180, 98, 0.15);
      border: 1px solid rgba(76, 180, 98, 0.4);
      border-radius: 8px;
      padding: 4px 10px;
      font-size: 12px;
      font-weight: 600;
      color: #4cb461;
      width: fit-content;
    }

    .event-time-venue {
      font-size: 13px;
      color: #7b8395;
      margin: 0;
    }

    .event-title {
      font-size: 18px;
      font-weight: 600;
      color: #ffffff;
      margin: 0;
      line-height: 1.3;
    }

    .event-calendar-btn {
      align-self: flex-start;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 500;
      color: #b0b5c0;
      background: transparent;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .event-calendar-btn:hover {
      border-color: rgba(255, 255, 255, 0.24);
      color: #e0e3ec;
    }
  `],
})
export class MobileEventCardComponent {
  event = input<EventData>({
    date: 'Sábado 15 de Noviembre',
    time: '20:00',
    venue: 'Estadio Municipal',
    title: 'Gran Final del Certamen Folclórico',
  });
}