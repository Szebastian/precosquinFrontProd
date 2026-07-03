import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <ol class="breadcrumbs-list">
        @for (crumb of breadcrumbs(); track crumb.path; let last = $last) {
          <li class="breadcrumb-item" [class.breadcrumb-active]="last">
            @if (!last) {
              <a [routerLink]="crumb.path" class="breadcrumb-link">{{ crumb.label }}</a>
              <span class="breadcrumb-sep">/</span>
            } @else {
              <span class="breadcrumb-current">{{ crumb.label }}</span>
            }
          </li>
        }
      </ol>
    </nav>
  `,
  styles: [`
    .breadcrumbs {
      padding: var(--space-3) 0;
      margin-bottom: var(--space-4);
    }

    .breadcrumbs-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0;
    }

    .breadcrumb-item {
      display: flex;
      align-items: center;
      font-size: var(--text-sm);
    }

    .breadcrumb-link {
      color: var(--brand-600);
      text-decoration: none;
      font-weight: var(--weight-medium);
      transition: color var(--transition-fast);
    }

    .breadcrumb-link:hover {
      color: var(--brand-700);
      text-decoration: underline;
    }

    .breadcrumb-sep {
      color: var(--gray-400);
      margin: 0 var(--space-2);
      font-size: var(--text-xs);
    }

    .breadcrumb-active .breadcrumb-current {
      color: var(--gray-600);
      font-weight: var(--weight-semibold);
    }
  `]
})
export class BreadcrumbsComponent {
  private breadcrumbService = inject(BreadcrumbService);
  breadcrumbs = this.breadcrumbService.breadcrumbs;
}
