import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { BreadcrumbService } from './breadcrumb.service';

describe('BreadcrumbService', () => {
  let service: BreadcrumbService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'noticias', component: {} as any },
          { path: 'institucional/declaracion', component: {} as any },
        ]),
      ],
    });
    service = TestBed.inject(BreadcrumbService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with empty breadcrumbs', () => {
    expect(service.breadcrumbs().length).toBe(0);
  });

  it('should build breadcrumbs on NavigationEnd', async () => {
    await router.navigate(['/noticias']);
    const crumbs = service.breadcrumbs();
    expect(crumbs.length).toBe(2);
    expect(crumbs[0].label).toBe('Inicio');
    expect(crumbs[0].path).toBe('/');
    expect(crumbs[1].label).toBe('Noticias');
    expect(crumbs[1].path).toBe('/noticias');
  });

  it('should build breadcrumbs for nested path', async () => {
    await router.navigate(['/institucional/declaracion']);
    const crumbs = service.breadcrumbs();
    expect(crumbs.length).toBe(3);
    expect(crumbs[1].label).toBe('Institucional');
    expect(crumbs[2].label).toBe('Declaración N° 35/26');
  });

  it('should format unknown segments', () => {
    expect(service.formatLabel('my-page')).toBe('My Page');
    expect(service.formatLabel('hello')).toBe('Hello');
  });
});
