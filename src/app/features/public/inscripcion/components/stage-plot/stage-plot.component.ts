import { Component, EventEmitter, Output, Input, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Instrument } from '../../inscripcion.page';

@Component({
  selector: 'app-stage-plot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stage-plot.component.html',
  styleUrl: './stage-plot.component.scss'
})
export class StagePlotComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() initialInstruments: Instrument[] = [];
  @Input() readonly = false;
  @Input() category: string = 'musica';
  @Output() instrumentsChange = new EventEmitter<Instrument[]>();
  @ViewChild('stageArea')   stageAreaRef?: ElementRef<HTMLDivElement>;

  instruments: Instrument[] = [];
  selectedInstrument: Instrument | null = null;

  private nextInstrumentId = 0;

  instrumentKeys = [
    'guitarra-criolla', 'guitarron', 'charango', 'violin', 'violonchelo', 'contrabajo',
    'quena', 'siku', 'sicus', 'flauta-traversa', 'erke',
    'piano', 'acordeon', 'bandoneon',
    'bombo-leguero', 'caja-chayera', 'percusion-menor',
    'microfono-alt', 'monitor-alt', 'amplificador-alt', 'energia-alt', 'musico-alt', 'bailarin-alt',
  ] as const;

  instrumentConfig: { [key: string]: { label: string; icon: string; group: string } } = {
    'guitarra-criolla': { label: 'Guitarra Criolla',  icon: 'assets/iconoForm/guitarra.webp',         group: 'Cuerdas' },
    'guitarron':        { label: 'Guitarrón',          icon: 'assets/iconoForm/guitarron.webp',        group: 'Cuerdas' },
    'charango':         { label: 'Charango',           icon: 'assets/iconoForm/charango.webp',         group: 'Cuerdas' },
    'violin':           { label: 'Violín',             icon: 'assets/iconoForm/violin.webp',           group: 'Cuerdas' },
    'violonchelo':      { label: 'Violonchelo',        icon: 'assets/iconoForm/violonchelo.webp',      group: 'Cuerdas' },
    'contrabajo':       { label: 'Contrabajo',         icon: 'assets/iconoForm/contrabajo.webp',       group: 'Cuerdas' },
    'quena':            { label: 'Quena',              icon: 'assets/iconoForm/quena.webp',            group: 'Vientos' },
    'siku':             { label: 'Siku',               icon: 'assets/iconoForm/siku.webp',             group: 'Vientos' },
    'sicus':            { label: 'Sicus',              icon: 'assets/iconoForm/sicus.webp',            group: 'Vientos' },
    'flauta-traversa':  { label: 'Flauta Traversa',   icon: 'assets/iconoForm/flauta-traversa.webp',  group: 'Vientos' },
    'erke':             { label: 'Erke',               icon: 'assets/iconoForm/erke.webp',             group: 'Vientos' },
    'piano':            { label: 'Piano',              icon: 'assets/iconoForm/teclado.webp',          group: 'Teclados' },
    'acordeon':         { label: 'Acordeón',           icon: 'assets/iconoForm/acordeon.webp',         group: 'Teclados' },
    'bandoneon':        { label: 'Bandoneón',          icon: 'assets/iconoForm/bandoneon.webp',        group: 'Teclados' },
    'bombo-leguero':    { label: 'Bombo Legüero',     icon: 'assets/iconoForm/bombo-leguero.webp',    group: 'Percusión' },
    'caja-chayera':     { label: 'Caja Chayera',       icon: 'assets/iconoForm/caja-chayera.webp',     group: 'Percusión' },
    'percusion-menor':  { label: 'Percusión Menor',    icon: 'assets/iconoForm/percusion-menor.webp',  group: 'Percusión' },
    'microfono-alt':    { label: 'Micrófono',           icon: 'assets/iconoForm/microfono.webp',        group: 'Equipo' },
    'monitor-alt':      { label: 'Monitor',             icon: 'assets/iconoForm/altavoz-de-musica.webp', group: 'Equipo' },
    'amplificador-alt': { label: 'Amplificador',        icon: 'assets/iconoForm/amplificador.webp',     group: 'Equipo' },
    'energia-alt':      { label: 'Energía',             icon: 'assets/iconoForm/energia.webp',          group: 'Equipo' },
    'musico-alt':       { label: 'Músico',              icon: 'assets/iconoForm/usuario.webp',          group: 'Equipo' },
    'bailarin-alt':     { label: 'Bailarín',             icon: 'assets/iconoForm/usuario.webp',          group: 'Equipo' },
  };

  paletteGroups = ['Cuerdas', 'Vientos', 'Teclados', 'Percusión', 'Equipo'];
  expandedGroups = signal<Set<string>>(new Set(['Cuerdas', 'Equipo']));

  /** Color scheme per instrument group */
  private groupColors: Record<string, string> = {
    'Cuerdas':   '#3b82f6',
    'Vientos':   '#22c55e',
    'Teclados':  '#a855f7',
    'Percusión': '#f59e0b',
    'Equipo':    '#64748b',
  };

  /** Map instrument type → group */
  private typeToGroup: Record<string, string> = {};
  /** Map instrument type → color */
  private typeToColor: Record<string, string> = {};

  constructor() {
    for (const [key, cfg] of Object.entries(this.instrumentConfig)) {
      this.typeToGroup[key] = cfg.group;
      this.typeToColor[key] = this.groupColors[cfg.group] || '#64748b';
    }
  }

  ngOnInit() {
    this.instruments = this.initialInstruments.map(inst => ({ ...inst }));
    this.nextInstrumentId = this.instruments.length > 0
      ? Math.max(...this.instruments.map(i => parseInt(i.id.split('-')[1]))) + 1
      : 0;
  }

  /* ── Readonly bounding-box normalization ── */
  private _bbox: { minX: number; maxX: number; minY: number; maxY: number } | null = null;

  private getBbox() {
    if (this._bbox) return this._bbox;
    if (!this.instruments.length) {
      this._bbox = { minX: 0, maxX: 900, minY: 0, maxY: 400 };
      return this._bbox;
    }
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const inst of this.instruments) {
      const x = inst.centered ? 500 : (inst.x || 0);
      const y = inst.centered ? 250 : (inst.y || 0);
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    const padX = 80, padY = 60;
    minX = Math.max(0, minX - padX);
    minY = Math.max(0, minY - padY);
    maxX = maxX + padX;
    maxY = maxY + padY;
    if (maxX - minX < 300) maxX = minX + 300;
    if (maxY - minY < 250) maxY = minY + 250;
    this._bbox = { minX, maxX, minY, maxY };
    return this._bbox;
  }

  /** Percentage X for readonly mode */
  getPctX(x: number): number {
    const b = this.getBbox();
    return ((x - b.minX) / (b.maxX - b.minX)) * 100;
  }

  /** Percentage Y for readonly mode */
  getPctY(y: number): number {
    const b = this.getBbox();
    return ((y - b.minY) / (b.maxY - b.minY)) * 100;
  }

  ngAfterViewInit() {
    this.centerDefaultMusician();
  }

  ngOnDestroy() {
  }

  private centerDefaultMusician(): boolean {
    if (this.instruments.length > 0 || !this.stageAreaRef) return false;
    const rect = this.stageAreaRef.nativeElement.getBoundingClientRect();
    const isDanza = this.category === 'danza';
    const defaultMusician: Instrument = {
      id: `instrument-${this.nextInstrumentId++}`,
      type: isDanza ? 'bailarin-alt' : 'musico-alt',
      x: rect.width / 2,
      y: rect.height / 2,
      label: isDanza ? 'Bailarín' : 'Músico',
      channel: '',
      rotation: 0,
      centered: true,
    };
    this.instruments.push(defaultMusician);
    this.emitInstrumentsChange();
    return true;
  }

  getIcon(type: string): string {
    return this.instrumentConfig[type]?.icon || '';
  }

  getLabel(type: string): string {
    return this.instrumentConfig[type]?.label || type;
  }

  getGroupColor(type: string): string {
    return this.typeToColor[type] || '#64748b';
  }

  getInstrumentsByGroup(group: string): string[] {
    return this.instrumentKeys.filter(k => this.instrumentConfig[k]?.group === group);
  }

  isGroupExpanded(group: string): boolean {
    return this.expandedGroups().has(group);
  }

  toggleGroup(group: string): void {
    this.expandedGroups.update(current => {
      const next = new Set(current);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  }

  getGroupItemCount(group: string): number {
    return this.getInstrumentsByGroup(group).length;
  }

  getPlacedCountByGroup(group: string): number {
    const keys = this.getInstrumentsByGroup(group);
    return this.instruments.filter(i => keys.includes(i.type)).length;
  }

  allowDrop(event: DragEvent): void {
    event.preventDefault();
  }

  dragStart(event: DragEvent, instrument: Instrument): void {
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', instrument.id);
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onPaletteDragStart(event: DragEvent, instrumentType: string): void {
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', instrumentType);
      event.dataTransfer.effectAllowed = 'copy';
    }
  }

  drop(event: DragEvent): void {
    event.preventDefault();
    const stageArea = (event.target as HTMLElement).closest('.stage-area');
    if (!stageArea) return;

    const rect = stageArea.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const data = event.dataTransfer?.getData('text/plain');

    const existingInstrument = this.instruments.find(i => i.id === data);
    if (existingInstrument) {
      existingInstrument.x = x;
      existingInstrument.y = y;
      existingInstrument.centered = false;
    } else if (data) {
      const newInstrument: Instrument = {
        id: `instrument-${this.nextInstrumentId++}`,
        type: data,
        x,
        y,
        label: this.getLabel(data),
        channel: '',
        rotation: 0,
      };
      this.instruments.push(newInstrument);
    }
    this.emitInstrumentsChange();
  }

  selectInstrument(instrument: Instrument): void {
    this.selectedInstrument = instrument;
  }

  updateInstrumentProperty(property: keyof Instrument, value: any): void {
    if (this.selectedInstrument) {
      (this.selectedInstrument as any)[property] = value;
      this.emitInstrumentsChange();
    }
  }

  rotateSelectedInstrument(): void {
    if (this.selectedInstrument) {
      this.selectedInstrument.rotation = (this.selectedInstrument.rotation + 90) % 360;
      this.emitInstrumentsChange();
    }
  }

  removeInstrument(instrumentToRemove: Instrument): void {
    this.instruments = this.instruments.filter(instrument => instrument.id !== instrumentToRemove.id);
    if (this.selectedInstrument === instrumentToRemove) {
      this.selectedInstrument = null;
    }
    this.emitInstrumentsChange();
  }

  clickToAddInstrument(instrumentType: string): void {
    let stageWidth = 400;
    let stageHeight = 300;
    if (this.stageAreaRef) {
      const rect = this.stageAreaRef.nativeElement.getBoundingClientRect();
      stageWidth = rect.width;
      stageHeight = rect.height;
    }
    const padding = 70;
    const spacingX = 80;
    const spacingY = 65;
    const cols = Math.max(1, Math.floor((stageWidth - padding * 2) / spacingX));
    const count = this.instruments.length;
    const col = count % cols;
    const row = Math.floor(count / cols);
    const totalGridWidth = cols * spacingX;
    const offsetX = (stageWidth - totalGridWidth) / 2 + spacingX / 2;
    const x = offsetX + col * spacingX;
    const y = padding + row * spacingY + 30;

    const newInstrument: Instrument = {
      id: `instrument-${this.nextInstrumentId++}`,
      type: instrumentType,
      x: Math.max(padding, Math.min(x, stageWidth - padding)),
      y: Math.max(padding, Math.min(y, stageHeight - padding)),
      label: this.getLabel(instrumentType),
      channel: '',
      rotation: 0,
    };
    this.instruments.push(newInstrument);
    this.selectedInstrument = newInstrument;
    this.emitInstrumentsChange();
  }

  private emitInstrumentsChange(): void {
    this.instrumentsChange.emit(this.instruments);
  }

  private touchDragData: { instrumentId?: string; instrumentType?: string; offsetX: number; offsetY: number } | null = null;

  onPaletteTouchStart(event: TouchEvent, instrumentType: string): void {
    event.preventDefault();
    this.touchDragData = { instrumentType, offsetX: 0, offsetY: 0 };
  }

  onPaletteTouchMove(_event: TouchEvent, _instrumentType: string): void {
  }

  onPaletteTouchEnd(_event: TouchEvent, instrumentType: string): void {
    if (this.touchDragData?.instrumentType === instrumentType) {
      this.clickToAddInstrument(instrumentType);
      this.touchDragData = null;
    }
  }

  onInstrumentTouchStart(event: TouchEvent, instrument: Instrument): void {
    event.preventDefault();
    event.stopPropagation();
    const touch = event.touches[0];
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    this.touchDragData = {
      instrumentId: instrument.id,
      offsetX: touch.clientX - rect.left - rect.width / 2,
      offsetY: touch.clientY - rect.top - rect.height / 2,
    };
    this.selectInstrument(instrument);
  }

  onStageTouchMove(event: TouchEvent): void {
    if (!this.touchDragData || !this.stageAreaRef) return;
    event.preventDefault();
    const touch = event.touches[0];
    const stageRect = this.stageAreaRef.nativeElement.getBoundingClientRect();
    const x = touch.clientX - stageRect.left;
    const y = touch.clientY - stageRect.top;

    if (this.touchDragData.instrumentId) {
      const inst = this.instruments.find(i => i.id === this.touchDragData!.instrumentId);
      if (inst) {
        inst.x = Math.max(0, Math.min(x, stageRect.width));
        inst.y = Math.max(0, Math.min(y, stageRect.height));
        inst.centered = false;
        this.emitInstrumentsChange();
      }
    }
  }

  onStageTouchEnd(event: TouchEvent): void {
    if (!this.touchDragData || !this.stageAreaRef) return;
    const touch = event.changedTouches[0];
    const stageRect = this.stageAreaRef.nativeElement.getBoundingClientRect();
    const x = touch.clientX - stageRect.left;
    const y = touch.clientY - stageRect.top;

    if (this.touchDragData.instrumentType) {
      const newInstrument: Instrument = {
        id: `instrument-${this.nextInstrumentId++}`,
        type: this.touchDragData.instrumentType,
        x: Math.max(0, Math.min(x, stageRect.width)),
        y: Math.max(0, Math.min(y, stageRect.height)),
        label: this.getLabel(this.touchDragData.instrumentType),
        channel: '',
        rotation: 0,
      };
      this.instruments.push(newInstrument);
      this.selectedInstrument = newInstrument;
      this.emitInstrumentsChange();
    } else if (this.touchDragData.instrumentId) {
      const inst = this.instruments.find(i => i.id === this.touchDragData!.instrumentId);
      if (inst) {
        inst.x = Math.max(0, Math.min(x, stageRect.width));
        inst.y = Math.max(0, Math.min(y, stageRect.height));
        inst.centered = false;
        this.emitInstrumentsChange();
      }
    }
    this.touchDragData = null;
  }
}
