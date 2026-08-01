import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-mobile-home-header',
  standalone: true,
  imports: [NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="mobile-header">
      <div class="mobile-header-left">
        <img
          ngSrc="/assets/img/logo.svg"
          alt="Pre Cosquín"
          width="120"
          height="32"
          priority
        />
      </div>

      <div class="mobile-header-center">
        <span class="mobile-location">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              d="M21 10c0 6-9 13-9 13s-9-7-9-13a9 9 0 0 1 18 0z"
            />
            <circle cx="12" cy="10" r="3" />
          </svg>
          Puerto Pirámides
        </span>
      </div>

      <div class="mobile-header-right">
        <button
          class="mobile-header-btn"
          aria-label="Notificaciones"
          (click)="$event.stopPropagation()"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
            />
            <path d="M13.73 22a2 2 0 0 1-3.46 0" />
          </svg>
        </button>

        <button
          class="mobile-header-btn"
          aria-label="Perfil"
          (click)="$event.stopPropagation()"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>
      </div>
    </header>
  `,
  styles: [`
    .mobile-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px 12px;
      background: #0e0f12;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .mobile-header-left {
      flex: 0 0 auto;
    }

    .mobile-header-center {
      flex: 1;
      display: flex;
      justify-content: center;
    }

    .mobile-location {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
      font-weight: 500;
      color: #b0b5c0;
    }

    .mobile-header-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .mobile-header-btn {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      border: none;
      background: transparent;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.15s ease;
    }

    .mobile-header-btn:hover {
      background-color: rgba(255, 255, 255, 0.08);
    }
  `],
})
export class MobileHomeHeaderComponent {}