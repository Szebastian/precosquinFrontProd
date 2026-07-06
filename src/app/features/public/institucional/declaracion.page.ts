import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BreadcrumbsComponent } from '../../../shared/components/breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-declaracion',
  standalone: true,
  imports: [RouterLink, BreadcrumbsComponent],
  template: `
    <div class="declaracion-page">
      <div class="declaracion-container">

        <app-breadcrumbs />

        <a routerLink="/" class="back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Volver al inicio
        </a>

        <header class="declaracion-header">
          <div class="declaracion-badge">DOCUMENTO INSTITUCIONAL</div>
          <h1 class="declaracion-title">Declaración N° 35/26 C.D.P.P</h1>
          <p class="declaracion-subtitle">Declaración de Interés Cultural, Turístico y Comunitario</p>
          <div class="declaracion-meta">
            <span class="meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              1 de julio de 2027
            </span>
            <span class="meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Concejo Deliberante de Puerto Pirámides
            </span>
          </div>
        </header>

        <div class="declaracion-actions-top">
          <a href="assets/docs/declaracion-35-26.pdf" download class="btn-download">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Descargar documento original (PDF)
          </a>
        </div>

        <article class="declaracion-body">

          <div class="doc-header-block">
            <div class="doc-header-left">
              <div class="doc-logo-placeholder">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>
              </div>
              <div>
                <strong>Concejo Deliberante</strong>
                <span>Puerto Pirámides — Chubut</span>
              </div>
            </div>
            <div class="doc-header-right">
              <span class="doc-stamp">ES COPIA FIEL DEL ORIGINAL</span>
              <span class="doc-date">Puerto Pirámides, 1 de julio de 2027</span>
            </div>
          </div>

          <h2 class="doc-title-main">DECLARACIÓN N° 35/26 C.D.P.P</h2>

          <section class="doc-section">
            <h3 class="doc-heading">VISTO</h3>
            <p class="doc-text doc-text-italic">
              Que Puerto Pirámides es sede oficial del Pre-Cosquín, y;
            </p>
          </section>

          <section class="doc-section">
            <h3 class="doc-heading">CONSIDERANDO</h3>
            <ul class="doc-list">
              <li>
                Que Puerto Pirámides ha logrado consolidarse como sede del Certamen para Nuevos Valores
                Pre-Cosquín, incorporando a su calendario anual una propuesta cultural de relevancia regional y nacional;
              </li>
              <li>
                Que las ediciones realizadas en los años 2024 y 2025 convocaron a artistas, bailarines, músicos y
                delegaciones de distintos puntos de la Patagonia, fortaleciendo el intercambio cultural y la difusión
                de las expresiones artísticas de nuestra región;
              </li>
              <li>
                Que el Pre-Cosquín constituye uno de los certámenes de folklore más importantes del país,
                brindando a nuevos talentos la posibilidad de acceder al escenario mayor del Festival Nacional
                de Folklore de Cosquín;
              </li>
              <li>
                Que la realización de este evento promueve el encuentro entre generaciones, la preservación
                de las tradiciones populares y la valoración del patrimonio cultural argentino;
              </li>
              <li>
                Que Puerto Pirámides cuenta con una destacada trayectoria en el desarrollo de actividades
                artísticas y culturales, impulsadas por vecinos, músicos, bailarines e instituciones que contribuyen
                permanentemente al fortalecimiento de la identidad local;
              </li>
              <li>
                Que la organización del Pre-Cosquín en nuestra localidad es el resultado del compromiso y
                esfuerzo de una comisión integrada por Luis Eduardo Lagos, Sandra Contreras, Paula Villarroel,
                Brisa Fuentes, Máximo Lagos, Brian Lagos, Alejandra Ocaranza, Milton Estévez de Souza,
                Lucía Estévez de Souza y Martina Estévez de Souza, Adrián Contreras y Sofía Contreras;
              </li>
              <li>
                Que la llegada de participantes, acompañantes y visitantes genera un movimiento económico
                favorable para los sectores vinculados al turismo, la gastronomía, el alojamiento, el comercio
                y los servicios locales;
              </li>
              <li>
                Que la edición 2027 del Pre-Cosquín se desarrollará los días 5 y 6 de septiembre en Puerto
                Pirámides, constituyendo una oportunidad para continuar fortaleciendo el posicionamiento de
                nuestra localidad como un destino que integra naturaleza, cultura e identidad;
              </li>
            </ul>
          </section>

          <section class="doc-section doc-declaration">
            <h3 class="doc-heading-center">
              EL CONCEJO DELIBERANTE<br/>
              DE LA LOCALIDAD DE PUERTO PIRÁMIDES<br/>
              <span class="doc-declara">DECLARA</span>
            </h3>
          </section>

          <section class="doc-section">
            <div class="doc-article">
              <h4 class="doc-article-num">ARTÍCULO 1°:</h4>
              <p class="doc-text">
                Declarar de interés cultural, turístico y comunitario la realización de la nueva edición del
                Pre-Cosquín a desarrollarse en la localidad de Puerto Pirámides, durante los días 5 y 6 de
                septiembre del presente año.
              </p>
            </div>
          </section>

          <section class="doc-section">
            <div class="doc-article">
              <h4 class="doc-article-num">ARTÍCULO 2°:</h4>
              <p class="doc-text">
                Reconocer y respaldar el trabajo de la Comisión Organizadora y de todas las personas,
                instituciones y organismos que contribuyen a la organización y difusión del evento.
              </p>
            </div>
          </section>

          <section class="doc-section">
            <div class="doc-article">
              <h4 class="doc-article-num">ARTÍCULO 3°:</h4>
              <p class="doc-text">
                Invitar a los organismos provinciales y nacionales competentes en materia de cultura y turismo,
                así como a las instituciones educativas y organizaciones de la sociedad civil, a acompañar y
                promover la realización de este evento.
              </p>
            </div>
          </section>

          <section class="doc-section">
            <div class="doc-article">
              <h4 class="doc-article-num">ARTÍCULO 4°:</h4>
              <p class="doc-text">
                Solicitar a la Honorable Legislatura de Chubut, que declare de interés cultural al Pre-Cosquín
                2027, en Puerto Pirámides.
              </p>
            </div>
          </section>

        </article>

        <div class="declaracion-share">
          <p class="share-label">Compartir esta declaración:</p>
          <div class="share-buttons">
            <a href="https://www.instagram.com/precosquinpuertopiramides" target="_blank" class="share-btn share-instagram" title="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              Instagram
            </a>
            <a href="https://www.youtube.com/@PreCosquinPuertoPirámides" target="_blank" class="share-btn share-youtube" title="YouTube">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
              YouTube
            </a>
            <a href="https://wa.me/?text=Declaración%20N°35/26%20C.D.P.P%20-%20Pre-Cosquín%20Puerto%20Pirámides%202027" target="_blank" class="share-btn share-whatsapp" title="WhatsApp">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </a>
          </div>
        </div>

        <div class="declaracion-cta">
          <h3 class="cta-heading">¿Listo para ser parte del Pre-Cosquín 2027?</h3>
          <p class="cta-text">Inscribí tu propuesta artística y formá parte del certamen declarado de interés cultural.</p>
          <a routerLink="/inscripcion" class="cta-btn-declaracion">
            INSCRIBIRME AHORA
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </a>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .declaracion-page {
      min-height: 100vh;
      background: linear-gradient(180deg, #f8f6f2 0%, #fff 100%);
      padding: var(--space-6) var(--space-4);
    }

    .declaracion-container {
      max-width: 800px;
      margin: 0 auto;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      font-size: var(--text-sm);
      color: var(--gray-500);
      text-decoration: none;
      margin-bottom: var(--space-6);
      transition: color var(--transition-fast);
    }

    .back-link:hover { color: var(--brand-600); }

    .declaracion-header {
      text-align: center;
      margin-bottom: var(--space-8);
    }

    .declaracion-badge {
      display: inline-block;
      font-size: 10px;
      font-weight: var(--weight-bold);
      letter-spacing: 0.15em;
      color: var(--brand-600);
      background: var(--brand-50);
      border: 1px solid var(--brand-200);
      padding: 5px 14px;
      border-radius: var(--radius-full);
      margin-bottom: var(--space-4);
    }

    .declaracion-title {
      font-family: var(--font-display);
      font-size: var(--text-4xl);
      font-weight: var(--weight-extrabold);
      color: var(--gray-900);
      margin: 0 0 var(--space-2);
      line-height: 1.15;
    }

    .declaracion-subtitle {
      font-size: var(--text-lg);
      color: var(--gray-600);
      margin: 0 0 var(--space-4);
      font-weight: var(--weight-medium);
    }

    .declaracion-meta {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-6);
      flex-wrap: wrap;
    }

    .meta-item {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--text-sm);
      color: var(--gray-500);
    }

    .declaracion-actions-top {
      text-align: center;
      margin-bottom: var(--space-8);
    }

    .btn-download {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: 0.75rem 1.5rem;
      background: var(--brand-600);
      color: #fff;
      border-radius: var(--radius-full);
      text-decoration: none;
      font-size: var(--text-sm);
      font-weight: var(--weight-bold);
      transition: all var(--transition-fast);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }

    .btn-download:hover {
      background: var(--brand-700);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
    }

    .declaracion-body {
      background: #fff;
      border-radius: var(--radius-xl);
      border: 1px solid var(--gray-200);
      box-shadow: var(--shadow-md);
      padding: var(--space-8) var(--space-10);
      margin-bottom: var(--space-8);
    }

    .doc-header-block {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: var(--space-6);
      border-bottom: 2px solid var(--gray-200);
      margin-bottom: var(--space-6);
      gap: var(--space-4);
    }

    .doc-header-left {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .doc-logo-placeholder {
      width: 50px;
      height: 50px;
      border-radius: var(--radius-lg);
      background: var(--brand-50);
      color: var(--brand-600);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .doc-header-left div {
      display: flex;
      flex-direction: column;
    }

    .doc-header-left strong {
      font-size: var(--text-sm);
      color: var(--gray-900);
    }

    .doc-header-left span {
      font-size: var(--text-xs);
      color: var(--gray-500);
    }

    .doc-header-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: var(--space-1);
      flex-shrink: 0;
    }

    .doc-stamp {
      font-size: 9px;
      font-weight: var(--weight-bold);
      letter-spacing: 0.08em;
      color: var(--brand-600);
      border: 2px solid var(--brand-600);
      padding: 3px 8px;
      border-radius: var(--radius-sm);
    }

    .doc-date {
      font-size: var(--text-xs);
      color: var(--gray-500);
      font-style: italic;
    }

    .doc-title-main {
      font-family: var(--font-display);
      font-size: var(--text-xl);
      font-weight: var(--weight-extrabold);
      color: var(--gray-900);
      text-align: center;
      margin: 0 0 var(--space-6);
      text-decoration: underline;
      text-underline-offset: 4px;
    }

    .doc-section {
      margin-bottom: var(--space-6);
    }

    .doc-heading {
      font-size: var(--text-base);
      font-weight: var(--weight-extrabold);
      color: var(--gray-900);
      margin: 0 0 var(--space-3);
      text-decoration: underline;
      text-underline-offset: 3px;
    }

    .doc-heading-center {
      font-size: var(--text-base);
      font-weight: var(--weight-extrabold);
      color: var(--gray-900);
      text-align: center;
      margin: 0 0 var(--space-4);
      line-height: 1.6;
    }

    .doc-declara {
      text-decoration: underline;
      text-underline-offset: 3px;
    }

    .doc-text {
      font-size: var(--text-sm);
      line-height: 1.8;
      color: var(--gray-800);
      margin: 0;
    }

    .doc-text-italic {
      font-style: italic;
      padding-left: var(--space-6);
    }

    .doc-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .doc-list li {
      font-size: var(--text-sm);
      line-height: 1.8;
      color: var(--gray-800);
      padding-left: var(--space-6);
      position: relative;
    }

    .doc-list li::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0.6rem;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--brand-500);
    }

    .doc-declaration {
      padding: var(--space-6) 0;
    }

    .doc-article {
      display: flex;
      gap: var(--space-3);
      align-items: flex-start;
    }

    .doc-article-num {
      font-size: var(--text-sm);
      font-weight: var(--weight-extrabold);
      color: var(--brand-700);
      margin: 0;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .doc-article .doc-text {
      margin: 0;
    }

    .declaracion-share {
      text-align: center;
      margin-bottom: var(--space-8);
    }

    .share-label {
      font-size: var(--text-sm);
      color: var(--gray-600);
      margin: 0 0 var(--space-3);
      font-weight: var(--weight-medium);
    }

    .share-buttons {
      display: flex;
      justify-content: center;
      gap: var(--space-3);
      flex-wrap: wrap;
    }

    .share-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: 0.5rem 1rem;
      border-radius: var(--radius-full);
      text-decoration: none;
      font-size: var(--text-xs);
      font-weight: var(--weight-bold);
      transition: all var(--transition-fast);
    }

    .share-instagram {
      background: linear-gradient(135deg, #f58529, #dd2a7b, #8134af, #515bd4);
      color: #fff;
    }

    .share-instagram:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(221, 42, 123, 0.4); }

    .share-youtube {
      background: #ff0000;
      color: #fff;
    }

    .share-youtube:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(255, 0, 0, 0.4); }

    .share-whatsapp {
      background: #25d366;
      color: #fff;
    }

    .share-whatsapp:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4); }

    .declaracion-cta {
      background: linear-gradient(135deg, var(--brand-600), var(--brand-800));
      border-radius: var(--radius-xl);
      padding: var(--space-10) var(--space-8);
      text-align: center;
      box-shadow: 0 8px 30px rgba(37, 99, 235, 0.25);
    }

    .cta-heading {
      font-family: var(--font-display);
      font-size: var(--text-2xl);
      font-weight: var(--weight-extrabold);
      color: #fff;
      margin: 0 0 var(--space-3);
    }

    .cta-text {
      font-size: var(--text-base);
      color: rgba(255,255,255,0.85);
      margin: 0 0 var(--space-6);
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
      line-height: 1.6;
    }

    .cta-btn-declaracion {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: var(--brand-accent);
      color: var(--gray-900);
      padding: 14px 28px;
      border-radius: var(--radius-full);
      font-size: var(--text-sm);
      font-weight: var(--weight-extrabold);
      text-decoration: none;
      letter-spacing: 0.05em;
      transition: all var(--transition-fast);
      white-space: nowrap;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }

    .cta-btn-declaracion:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.3);
    }

    @media (max-width: 640px) {
      .declaracion-body {
        padding: var(--space-5) var(--space-4);
      }

      .declaracion-title {
        font-size: var(--text-2xl);
      }

      .doc-header-block {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      .doc-header-right {
        align-items: center;
      }

      .doc-article {
        flex-direction: column;
        gap: var(--space-1);
      }

      .share-buttons {
        flex-direction: column;
        align-items: center;
      }

      .declaracion-meta {
        flex-direction: column;
        gap: var(--space-2);
      }
    }
  `]
})
export class DeclaracionPageComponent {}
