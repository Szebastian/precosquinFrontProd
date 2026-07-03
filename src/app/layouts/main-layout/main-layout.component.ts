import { Component, inject, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ThemeService } from '../../core/services/theme.service';
import { BackToTopComponent } from '../../shared/components/back-to-top/back-to-top.component';
import { ToastContainerComponent } from '../../shared/components/toast/toast-container.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, CommonModule, BackToTopComponent, ToastContainerComponent],
  template: `
    <div class="app-layout" [class.dark]="themeService.isDark()">
      <app-header (toggleSidebar)="toggleSidebar()" [isSidebarOpen]="isSidebarOpen" />
      <div class="app-body" [class.sidebar-open]="isSidebarOpen && windowWidth < 1024" (click)="closeSidebarOnOverlayClick($event)">
        <app-sidebar [class.sidebar-hidden]="!isSidebarOpen" />
        <main id="main-content" class="app-content" [class.sidebar-open]="isSidebarOpen" tabindex="-1">
          <div class="content-wrapper">
            <router-outlet />
          </div>
        </main>
      </div>
      <app-back-to-top />
      <app-toast-container />
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: var(--gray-50);
      transition: background 0.3s ease;
    }

    .app-layout.dark {
      background: #0a0d14;
    }

    .app-body {
      display: flex;
      flex: 1;
      overflow: hidden;
      min-height: 0;
    }

    .app-content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      background: var(--gray-50);
      position: relative;
      transition: background 0.3s ease, margin-left 0.3s ease;
    }

    .app-layout.dark .app-content {
      background: #0a0d14;
    }

    /* Scrollbar styles - using custom properties */
    .app-content::-webkit-scrollbar {
      width: var(--space-2);
    }

    .app-content::-webkit-scrollbar-track {
      background: var(--gray-100);
    }

    .app-layout.dark .app-content::-webkit-scrollbar-track {
      background: var(--gray-800);
    }

    .app-content::-webkit-scrollbar-thumb {
      background: var(--gray-400);
      border-radius: var(--radius-sm);
    }

    .app-layout.dark .app-content::-webkit-scrollbar-thumb {
      background: var(--gray-600);
    }

    .app-content::-webkit-scrollbar-thumb:hover {
      background: var(--gray-500);
    }

    .app-layout.dark .app-content::-webkit-scrollbar-thumb:hover {
      background: var(--gray-700);
    }

    .content-wrapper {
      min-height: 100%;
      padding: var(--space-4);
    }

    /* Default desktop view */
    app-sidebar {
      width: var(--sidebar-width);
      flex-shrink: 0;
      transition: margin-left 0.3s ease;
    }

    /* Mobile styles */
    @media (max-width: 1023px) { /* Below lg breakpoint */
      .app-body {
        flex-direction: column; /* Stack header, sidebar, content */
      }

      app-sidebar {
        position: fixed;
        top: var(--header-height);
        left: 0;
        height: calc(100vh - var(--header-height));
        z-index: var(--z-fixed);
        background: var(--gray-50);
        box-shadow: var(--shadow-lg);
        margin-left: calc(-1 * var(--sidebar-width)); /* Hidden by default */
      }

      .app-layout.dark app-sidebar {
        background: var(--gray-950);
      }

      app-sidebar.sidebar-hidden {
        margin-left: calc(-1 * var(--sidebar-width));
      }

      app-sidebar:not(.sidebar-hidden) {
        margin-left: 0; /* Slide in */
      }

      .app-content {
        padding: var(--space-4) var(--space-2); /* Adjust padding for mobile */
      }

      .content-wrapper {
        padding: var(--space-2);
      }

      /* Overlay when sidebar is open */
      .app-body::after {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: var(--z-modal-backdrop);
        pointer-events: none; /* Allow clicks to pass through by default */
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .app-body.sidebar-open::after {
        opacity: 1;
        pointer-events: auto; /* Enable clicks to close sidebar */
      }
    }

    /* Desktop styles */
    @media (min-width: 1024px) { /* lg breakpoint and up */
      app-sidebar {
        margin-left: 0; /* Always visible on desktop */
      }

      .app-content {
        padding: var(--space-4);
      }
    }
  `]
})
export class MainLayoutComponent {
  themeService = inject(ThemeService);
  isSidebarOpen: boolean = typeof window !== 'undefined' ? window.innerWidth >= 1024 : false; // Sidebar open by default on desktop, safe for SSR

  // Safe access to window.innerWidth for template
  get windowWidth(): number {
    return typeof window !== 'undefined' ? window.innerWidth : 0;
  }

  @HostListener('window:resize', ['$event'])
  onResize(_event: Event) {
    this.isSidebarOpen = this.windowWidth >= 1024;
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebarOnOverlayClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    // Only close if click is on the app-body itself and not on a child element within the sidebar
    if (target.classList.contains('app-body') && this.isSidebarOpen && this.windowWidth < 1024) {
      this.isSidebarOpen = false;
    }
  }
}
