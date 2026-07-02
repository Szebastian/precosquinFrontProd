import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  template: `
    <div class="app-layout" [class.dark]="themeService.isDark()">
      <app-header />
      <div class="app-body">
        <app-sidebar />
        <main class="app-content">
          <div class="content-wrapper">
            <router-outlet />
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: #f1f5f9;
      transition: background 0.3s ease;
    }

    .app-layout.dark {
      background: #0f172a;
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
      background: #f1f5f9;
      position: relative;
      transition: background 0.3s ease;
    }

    .app-layout.dark .app-content {
      background: #0f172a;
    }

    .app-content::-webkit-scrollbar {
      width: 8px;
    }

    .app-content::-webkit-scrollbar-track {
      background: #e2e8f0;
    }

    .app-layout.dark .app-content::-webkit-scrollbar-track {
      background: #1e293b;
    }

    .app-content::-webkit-scrollbar-thumb {
      background: #94a3b8;
      border-radius: 4px;
    }

    .app-layout.dark .app-content::-webkit-scrollbar-thumb {
      background: #475569;
    }

    .app-content::-webkit-scrollbar-thumb:hover {
      background: #64748b;
    }

    .app-layout.dark .app-content::-webkit-scrollbar-thumb:hover {
      background: #64748b;
    }

    .content-wrapper {
      min-height: 100%;
    }

    @media (max-width: 1023px) {
      .app-content {
        padding: 0;
      }
    }
  `]
})
export class MainLayoutComponent {
  themeService = inject(ThemeService);
}
