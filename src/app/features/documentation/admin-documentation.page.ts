import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/auth/auth.service';

interface DocSection {
  id: string;
  title: string;
  icon: string;
  content: DocBlock[];
}

interface DocBlock {
  title: string;
  type: 'text' | 'list' | 'table' | 'quote' | 'split' | 'note' | 'warning' | 'flow-map';
  content?: string;
  items?: string[];
  rows?: { label: string; value: string }[];
  columns?: { title: string; text: string; examples?: string }[];
  attr?: string;
  note?: string;
  style?: 'info' | 'warning' | 'success';
}

@Component({
  selector: 'app-admin-documentation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-documentation.page.html',
  styleUrl: './admin-documentation.page.css'
})
export class AdminDocumentationComponent implements OnInit {
  auth = inject(AuthService);

  activeTab = signal<string>('reglamento');
  searchQuery = signal<string>('');
  expandedCards = signal<Set<string>>(new Set());
  zoomLevel = signal<number>(1);
  panX = signal<number>(0);
  panY = signal<number>(0);
  isPanning = signal<boolean>(false);
  private lastPanX = 0;
  private lastPanY = 0;

  sections: DocSection[] = [
    {
      id: 'mapa-formulario',
      title: 'Mapa del Formulario',
      icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/></svg>',
      content: [
        {
          title: 'Flujo completo del formulario de inscripción',
          type: 'flow-map'
        }
      ]
    },
    {
      id: 'reglamento',
      title: 'Reglamento General',
      icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>',
      content: [
        {
          title: 'Objetivo',
          type: 'text',
          content: 'Reconocer los valores artísticos de todo el territorio nacional en propuestas de música y danza de carácter folklórico, brindando la oportunidad de llegar al <strong>Festival Nacional de Folklore de Cosquín</strong>.'
        },
        {
          title: 'Requisitos para Participar',
          type: 'list',
          items: [
            '<strong>Edad mínima:</strong> 16 años al momento de la inscripción',
            '<strong>Nacionalidad:</strong> Argentinos nativos o naturalizados',
            '<strong>No ser ganador anterior</strong> en la misma categoría',
            '<strong>Excepción:</strong> Conjunto de Baile Folklórico puede reingresar después de 5 años con propuesta completamente diferente',
            'Presentar <strong>6 obras</strong> al momento de la inscripción (título, género, autor)'
          ]
        },
        {
          title: 'Presentación en Competencia',
          type: 'list',
          items: [
            'El participante interpreta <strong>2 obras</strong> (1 elegida por él + 1 elegida por el jurado)',
            'Si avanza a la <strong>final</strong>: presenta 1 obra adicional (diferente a las anteriores)',
            'El jurado puede solicitar una <strong>"segunda pasada"</strong> en malambo (contrapunto)'
          ]
        },
        {
          title: 'Reglas Escénicas',
          type: 'list',
          items: [
            '<strong>NO</strong> se permite escenografía',
            '<strong>NO</strong> se permite audiovisual (solo una imagen como "postal" en pantalla)',
            'Máximo <strong>2 asistentes de escena</strong> para ingreso/egreso de elementos',
            '<strong>20 segundos</strong> al inicio + 20 segundos al final para utilería (fuera del tiempo de presentación)',
            '<strong>Prohibido:</strong> fuego y elementos peligrosos',
            'Prohibido presentarse en short, bermudas, musculosas, ojotas, etc.'
          ]
        },
        {
          title: 'Tolerancia de Tiempo',
          type: 'note',
          content: 'Los tiempos estipulados tienen un límite de tolerancia de <strong>10 segundos</strong>. Superado dicho límite, cualquier reclamo es <strong>inapelable</strong>.',
          style: 'info'
        },
        {
          title: 'Premiación',
          type: 'list',
          items: [
            'Actuación en el <strong>Festival Nacional de Folklore de Cosquín</strong>',
            'Certificado de acreditación',
            'Premio en efectivo (a determinar por la Comisión)',
            'Derecho a competir por el premio <strong>REVELACIÓN</strong> del Festival',
            'Menciones especiales: Mejor Coreógrafo, Mejor Participante en Música, Mejor Participante en Danza, Mejor Puesta en Escena'
          ]
        },
        {
          title: 'Fechas del Festival 2027',
          type: 'table',
          rows: [
            { label: 'Ronda Clasificatoria', value: '4 - 15 de enero 2027' },
            { label: 'Finales', value: '16 - 17 de enero 2027' },
            { label: 'Noche de Ganadores', value: '18 de enero 2027' }
          ]
        }
      ]
    },
    {
      id: 'categorias-musica',
      title: 'Categorías de Música',
      icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
      content: [
        {
          title: 'Solista Vocal',
          type: 'split',
          columns: [
            { title: 'Tiempo: 5 min', text: 'Interpretación vocal de folklore, tango o música popular argentina.' }
          ],
          note: 'Presentar 2 obras (1 elegida + 1 del jurado). Si avanza a final: 1 obra más.'
        },
        {
          title: 'Dúo Vocal',
          type: 'split',
          columns: [
            { title: 'Tiempo: 5 min', text: 'Interpretación vocal de dos artistas.' }
          ],
          note: 'Mismas reglas que Solista Vocal. Evaluación de ensamble y arreglos.'
        },
        {
          title: 'Conjunto Vocal',
          type: 'split',
          columns: [
            { title: 'Tiempo: 5 min', text: 'Grupo vocal de 3 a 8 integrantes.' }
          ],
          note: 'Presentar 2 obras. Evaluación de empaste vocal y arreglos.'
        },
        {
          title: 'Solista Instrumental',
          type: 'split',
          columns: [
            { title: 'Tiempo: 5 min', text: 'Interpretación instrumental en solitario.' }
          ],
          note: 'Puede ser acompañado por 1 instrumento armónico (excepcional). Sin cambios de instrumento. Sin pistas grabadas.'
        },
        {
          title: 'Conjunto Instrumental',
          type: 'split',
          columns: [
            { title: 'Tiempo: 5 min', text: 'Grupo instrumental de hasta 10 integrantes.' }
          ],
          note: 'Máximo 10 integrantes. Sin pistas grabadas.'
        },
        {
          title: 'Canción Inédita',
          type: 'split',
          columns: [
            { title: 'Tiempo: 5 min', text: 'Obra musical inédita del participante.' }
          ],
          note: 'Presentar la obra completa. Evaluación de producción, arreglo y métrica.'
        },
        {
          title: 'Expresión Oral Folklórica',
          type: 'split',
          columns: [
            { title: 'Tiempo: 5-8 min', text: 'Narradores, recitadores, "decidores". NUEVA CATEGORÍA.' }
          ],
          note: 'Mínimo 5 min, máximo 8 min. Categoría nueva desde 2027.'
        }
      ]
    },
    {
      id: 'categorias-danza',
      title: 'Categorías de Danza',
      icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4" r="2"/><path d="M12 6v4l-3 5"/><path d="M12 10l3 5"/><path d="M9 21l3-6 3 6"/></svg>',
      content: [
        {
          title: 'Pareja de Baile Tradicional',
          type: 'split',
          columns: [
            { title: 'Tiempo: 5 min', text: 'Pareja que interpreta baile folklórico con respeto a las características regionales.' }
          ],
          note: 'Puede usar música grabada. Evaluación de estilo regional y coreografía.'
        },
        {
          title: 'Pareja de Baile Estilizada',
          type: 'split',
          columns: [
            { title: 'Tiempo: 5 min', text: 'Pareja con propuesta estilizada de baile folklórico.' }
          ],
          note: 'Puede usar música grabada. Evaluación de puesta en escena y estilo.'
        },
        {
          title: 'Conjunto de Baile Folklórico',
          type: 'split',
          columns: [
            { title: 'Tiempo: 8-10 min', text: 'Grupo de mínimo 8 bailarines con puesta de carácter artístico.' }
          ],
          note: 'Mínimo 8 participantes. Puede usar música grabada. Máximo 16 integrantes en Cosquín. Máximo 2 asistentes de escena. 20 seg antes y después para utilería.'
        },
        {
          title: 'Solista de Malambo Masculino',
          type: 'split',
          columns: [
            { title: 'Tiempo: 2-4 min', text: 'Malambo masculino en solitario.' }
          ],
          note: 'Mínimo 2 min, máximo 4 min. Estilo norteño o sureño. Intro musical máx 30 seg. Preparar 3 pasadas diferentes.'
        },
        {
          title: 'Solista de Malambo Femenino',
          type: 'split',
          columns: [
            { title: 'Tiempo: 2-4 min', text: 'Malambo femenino en solitario.' }
          ],
          note: 'Mismas reglas que el masculino. Estilo norteño o sureño.'
        },
        {
          title: 'Conjunto de Malambo',
          type: 'split',
          columns: [
            { title: 'Tiempo: 3-4 min', text: 'Grupo de 4 a 8 bailarines de malambo.' }
          ],
          note: 'Mínimo 4, máximo 8 integrantes. Máximo 4 músicos en vivo. Puede cambiar estilo entre ronda y final.'
        }
      ]
    },
    {
      id: 'requisitos-tecnicos',
      title: 'Requisitos Técnicos',
      icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>',
      content: [
        {
          title: 'Requisitos para Músicos',
          type: 'list',
          items: [
            'Instrumentos en <strong>perfecto estado</strong> de funcionamiento',
            '<strong>No modificar</strong> niveles de ganancia durante la prueba de sonido',
            '<strong>No modificar</strong> ecualización una vez en el escenario',
            'Baterías nuevas y accesorios completos',
            'Verificar que los conectores de salida ("Jack") estén firmes',
            'Usar cables de señal de <strong>buena calidad</strong>',
            'Verificar conexiones de pedales de efectos'
          ]
        },
        {
          title: 'Clasificación de Instrumentos (Art. 31)',
          type: 'split',
          columns: [
            { title: 'Instrumento Melódico', text: 'Produce una nota a la vez. Permite líneas melódicas pero sin acordes simultáneos.', examples: 'Violín, Bandoneón, Flauta traversa, Clarinete, Saxofón, Trompeta, Quena, Erke, Sikus' },
            { title: 'Instrumento Armónico', text: 'Produce varias notas simultáneamente (acordes).', examples: 'Guitarra, Piano, Charango, Arpa, Acordeón' }
          ],
          note: 'El solista instrumental puede ser acompañado por <strong>1 instrumento armónico</strong> de manera excepcional. El acompañamiento será de base, sin prominencia melódica.'
        },
        {
          title: 'Microfonía',
          type: 'list',
          items: [
            'Se recomienda <strong>Shure SM58</strong> (o equivalente)',
            'Distancia de la boca: <strong>4-5 cm</strong>',
            'Sistemas inalámbricos deben ser aprobados por la empresa de sonido',
            '<strong>Evitar banda VHF</strong> (usar UHF)'
          ]
        },
        {
          title: 'Vestimenta',
          type: 'list',
          items: [
            'La vestimenta debe tener la <strong>corrección necesaria</strong> para su presentación',
            '<strong>Prohibido:</strong> short, bermudas, pantalones cortos, musculosas, ojotas',
            'No se permitirán hechos o manifestaciones que afecten la ética, moral o buenas costumbres'
          ]
        },
        {
          title: 'Instrumentos No Permitidos',
          type: 'list',
          items: [
            '<strong>Batería:</strong> Solo permitida en Conjuntos Instrumentales',
            '<strong>Percusión menor:</strong> Permitida como acompañamiento (no como protagonista)',
            '<strong>Sintetizadores/Teclados:</strong> Solo como instrumento armónico (acordes), no como reemplazo de otros instrumentos'
          ]
        }
      ]
    },
    {
      id: 'musica-popular',
      title: 'Música Popular de Raíz Folklórica',
      icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
      content: [
        {
          title: '¿Qué es Música Popular de Raíz Folklórica?',
          type: 'quote',
          content: '"Aquellas canciones basadas en hechos culturales, producidas, reconocidas y reproducidas por el pueblo, con características implícitas de identidades regionales, imbuidas de un tratamiento artístico y compositivo relevante."',
          attr: '— Leda Valladares',
          note: '"Lo popular y lo folklórico no son voces sinónimas. Si bien lo folklórico es popular, no todo lo popular es folklórico."'
        },
        {
          title: '¿Qué NO es Folklórico?',
          type: 'text',
          content: 'Canciones de creadores individuales que, aunque referenciadas en tradiciones regionales, <strong>no reflejan la identidad colectiva</strong> de una comunidad. Ejemplo: "La Llorona" (México) o "Cielito Lindo" (México) NO son folklóricas argentinas.'
        },
        {
          title: 'Criterios para ser Folklórico',
          type: 'list',
          items: [
            'La obra debe ser <strong>conocida y aceptada por la gente</strong>',
            'Debe reflejar la <strong>identidad colectiva</strong> de una comunidad',
            'Puede ser de autor conocido o desconocido',
            'Puede no estar documentada pero debe estar <strong>viva en la memoria popular</strong>'
          ]
        }
      ]
    },
    {
      id: 'criterios-evaluacion',
      title: 'Criterios de Evaluación',
      icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
      content: [
        {
          title: 'Música — Criterios por Categoría',
          type: 'table',
          rows: [
            { label: 'Solista Vocal', value: 'Técnica Vocal · Interpretación · Recursos · Color' },
            { label: 'Dúo Vocal', value: 'Interpretación (ensamble) · Técnica Vocal · Color · Arreglos' },
            { label: 'Conjunto Vocal', value: 'Técnica Vocal · Interpretación (ensamble) · Tímbrica · Arreglos' },
            { label: 'Solista Instrumental', value: 'Técnica · Repertorio · Interpretación · Arreglos' },
            { label: 'Conjunto Instrumental', value: 'Técnica Instrumental · Repertorio · Interpretación · Arreglos' },
            { label: 'Canción Inédita', value: 'Propuesta · Música · Métrica' },
            { label: 'Expresión Oral', value: 'Interpretación · Contenido · Presencia Escénica' }
          ]
        },
        {
          title: 'Danza — Criterios por Categoría',
          type: 'table',
          rows: [
            { label: 'Pareja Tradicional', value: 'Estilo · Coreografía · Interpretación · Puesta' },
            { label: 'Pareja Estilizada', value: 'Estilo · Coreografía · Interpretación · Puesta (énfasis estilización)' },
            { label: 'Conjunto de Baile', value: 'Diseño Coreográfico · Estilo · Interpretación · Musicalización' },
            { label: 'Malambo (todos)', value: 'Estilo · Rutina Coreográfica · Interpretación · Puesta' }
          ]
        }
      ]
    }
  ];

  filteredSections = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.sections;

    return this.sections.filter(section => {
      const titleMatch = section.title.toLowerCase().includes(query);
      const contentMatch = section.content.some(block => {
        const blockTitleMatch = block.title.toLowerCase().includes(query);
        const textMatch = block.content?.toLowerCase().includes(query);
        const itemsMatch = block.items?.some(item => item.toLowerCase().includes(query));
        const noteMatch = block.note?.toLowerCase().includes(query);
        return blockTitleMatch || textMatch || itemsMatch || noteMatch;
      });
      return titleMatch || contentMatch;
    });
  });

  totalResults = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return 0;

    let count = 0;
    this.sections.forEach(section => {
      section.content.forEach(block => {
        if (block.title.toLowerCase().includes(query) ||
            block.content?.toLowerCase().includes(query) ||
            block.items?.some(item => item.toLowerCase().includes(query)) ||
            block.note?.toLowerCase().includes(query)) {
          count++;
        }
      });
    });
    return count;
  });

  ngOnInit(): void {
    this.expandedCards.set(new Set(['reglamento']));
  }

  setActiveTab(tabId: string): void {
    this.activeTab.set(tabId);
  }

  toggleCard(sectionId: string, cardTitle: string): void {
    const key = `${sectionId}:${cardTitle}`;
    const current = new Set(this.expandedCards());
    if (current.has(key)) {
      current.delete(key);
    } else {
      current.add(key);
    }
    this.expandedCards.set(current);
  }

  isCardExpanded(sectionId: string, cardTitle: string): boolean {
    return this.expandedCards().has(`${sectionId}:${cardTitle}`);
  }

  expandAll(): void {
    const allKeys = new Set<string>();
    this.filteredSections().forEach(section => {
      section.content.forEach(block => {
        allKeys.add(`${section.id}:${block.title}`);
      });
    });
    this.expandedCards.set(allKeys);
  }

  collapseAll(): void {
    this.expandedCards.set(new Set());
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  zoomIn(): void {
    this.zoomLevel.set(Math.min(this.zoomLevel() + 0.25, 3));
  }

  zoomOut(): void {
    this.zoomLevel.set(Math.max(this.zoomLevel() - 0.25, 0.25));
  }

  resetZoom(): void {
    this.zoomLevel.set(1);
    this.panX.set(0);
    this.panY.set(0);
  }

  onWheel(event: WheelEvent): void {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    this.zoomLevel.set(Math.min(Math.max(this.zoomLevel() + delta, 0.25), 3));
  }

  onMouseDown(event: MouseEvent): void {
    if (event.button === 1 || (event.button === 0 && event.shiftKey)) {
      this.isPanning.set(true);
      this.lastPanX = event.clientX - this.panX();
      this.lastPanY = event.clientY - this.panY();
    }
  }

  onMouseMove(event: MouseEvent): void {
    if (this.isPanning()) {
      this.panX.set(event.clientX - this.lastPanX);
      this.panY.set(event.clientY - this.lastPanY);
    }
  }

  onMouseUp(): void {
    this.isPanning.set(false);
  }

  getZoomTransform(): string {
    return `scale(${this.zoomLevel()}) translate(${this.panX() / this.zoomLevel()}px, ${this.panY() / this.zoomLevel()}px)`;
  }
}
