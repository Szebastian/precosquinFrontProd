import {
  Component,
  ChangeDetectionStrategy,
  input,
} from '@angular/core';
import { DatePipe } from '@angular/common';

interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  category: string;
}

@Component({
  selector: 'app-mobile-news-grid',
  standalone: true,
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="news-section">
      <div class="news-grid">
        @for (news of newsItems(); track news.id; let i = $index) {
          <div class="news-card">
            <img
              src="{{ news.image }}"
              alt="{{ news.title }}"
              width="80"
              height="80"
              class="news-thumbnail"
              loading="lazy"
            />

            <div class="news-content">
              <span class="news-category">{{ news.category }}</span>
              <h3 class="news-title">{{ news.title }}</h3>
              <time class="news-date">{{ news.date | date:'dd MMMM' }}</time>
            </div>
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    .news-section {
      padding: 0 16px 20px;
    }

    .news-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .news-card {
      display: flex;
      gap: 12px;
      background: #181a1f;
      border-radius: 16px;
      padding: 12px;
      border: 1px solid rgba(255, 255, 255, 0.06);
      transition: border-color 0.15s ease;
    }

    .news-card:hover {
      border-color: rgba(255, 255, 255, 0.12);
    }

    .news-thumbnail {
      border-radius: 10px;
      object-fit: cover;
      flex-shrink: 0;
    }

    .news-content {
      flex: 1;
      min-width: 0;
    }

    .news-category {
      display: inline-block;
      font-size: 10px;
      font-weight: 600;
      color: #c9a87d;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .news-title {
      font-size: 14px;
      font-weight: 600;
      color: #ffffff;
      margin: 0 0 4px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .news-date {
      font-size: 11px;
      color: #7b8395;
    }
  `],
})
export class MobileNewsGridComponent {
  newsItems = input<NewsItem[]>([]);
}