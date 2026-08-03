import { Component, inject, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { AdminBottomNavComponent } from './bottom-nav/bottom-nav.component';
import { ThemeService } from '../../core/services/theme.service';
import { BackToTopComponent } from '../../shared/components/back-to-top/back-to-top.component';
import { ToastContainerComponent } from '../../shared/components/toast/toast-container.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, AdminBottomNavComponent, CommonModule, BackToTopComponent, ToastContainerComponent],
  template: `
    <div class="app-layout" [class.dark]="themeService.isDark()">
      <app-header (toggleSidebar)="toggleSidebar()" [isSidebarOpen]="isSidebarOpen" />
      <div class="app-body">
        <app-sidebar [class.sidebar-hidden]="!isSidebarOpen" />
        <main id="main-content" class="app-content" [class.sidebar-open]="isSidebarOpen" tabindex="-1">
          <div class="content-wrapper">
            <router-outlet />
          </div>
        </main>
      </div>
      <app-admin-bottom-nav />
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
    @media (max-width: 1023px) {
      .app-body {
        flex-direction: column;
      }

      app-sidebar {
        display: none;
      }

      .app-content {
        padding: 0;
      }

      .content-wrapper {
        padding: 12px 12px 88px;
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
}
