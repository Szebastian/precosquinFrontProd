import { Component, HostListener, signal } from '@angular/core';

@Component({
  selector: 'app-back-to-top',
  standalone: true,
  template: `
    @if (visible()) {
      <button class="back-to-top" (click)="scrollToTop()" aria-label="Volver arriba">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="m18 15-6-6-6 6"/>
        </svg>
      </button>
    }
  `,
  styles: [`
    .back-to-top {
      position: fixed;
      bottom: 24px;
      left: 24px;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: none;
      background: var(--brand-600);
      color: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
      z-index: 99;
      transition: all 0.3s ease;
      animation: fadeIn 0.3s ease;
    }

    .back-to-top:hover {
      background: var(--brand-700);
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 1024px) {
      .back-to-top {
        bottom: 80px;
      }
    }
    @media (max-width: 480px) {
      .back-to-top {
        bottom: 76px;
        left: 16px;
        width: 40px;
        height: 40px;
      }
    }
  `]
})
export class BackToTopComponent {
  visible = signal(false);

  @HostListener('window:scroll')
  onScroll() {
    this.visible.set(window.scrollY > 400);
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
