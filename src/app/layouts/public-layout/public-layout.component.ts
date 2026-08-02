import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HomeBottomNavComponent } from '../../features/public/home/components/home-bottom-nav.component';
import { YoutubeLiveWidgetComponent } from '../../features/public/home/components/youtube-live-widget.component';
import { BackToTopComponent } from '../../shared/components/back-to-top/back-to-top.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, HomeBottomNavComponent, YoutubeLiveWidgetComponent, BackToTopComponent],
  template: `
    <router-outlet />
    <app-youtube-live-widget />
    <app-back-to-top />
    <app-home-bottom-nav />
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class PublicLayoutComponent {}
