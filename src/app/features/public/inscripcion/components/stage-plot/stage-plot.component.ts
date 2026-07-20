import { Component, EventEmitter, Output, Input, OnInit, signal } from '@angular/core';
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
export class StagePlotComponent implements OnInit {
  @Input() initialInstruments: Instrument[] = [];
  @Input() readonly = false;
  @Output() instrumentsChange = new EventEmitter<Instrument[]>();

  instruments: Instrument[] = [];
  selectedInstrument: Instrument | null = null;

  private nextInstrumentId = 0;

  instrumentKeys = [
    'guitarra-criolla', 'guitarron', 'charango', 'violin', 'violonchelo', 'contrabajo',
    'quena', 'siku', 'sicus', 'flauta-traversa', 'erke',
    'piano', 'acordeon', 'bandoneon',
    'bombo-leguero', 'caja-chayera', 'percusion-menor',
    'microfono-alt', 'monitor-alt', 'amplificador-alt', 'energia-alt', 'musico-alt',
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
  };

  paletteGroups = ['Cuerdas', 'Vientos', 'Teclados', 'Percusión', 'Equipo'];
  expandedGroups = signal<Set<string>>(new Set(['Cuerdas']));

  constructor() { }

  ngOnInit() {
    this.instruments = this.initialInstruments.map(inst => ({ ...inst }));
    this.nextInstrumentId = this.instruments.length > 0
      ? Math.max(...this.instruments.map(i => parseInt(i.id.split('-')[1]))) + 1
      : 0;

    if (this.instruments.length === 0) {
      const defaultMusician: Instrument = {
        id: `instrument-${this.nextInstrumentId++}`,
        type: 'musico-alt',
        x: 95,
        y: 90,
        label: 'Músico',
        channel: '',
        rotation: 0,
      };
      this.instruments.push(defaultMusician);
      this.emitInstrumentsChange();
    }
  }

  getIcon(type: string): string {
    return this.instrumentConfig[type]?.icon || '';
  }

  getLabel(type: string): string {
    return this.instrumentConfig[type]?.label || type;
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
    const stageWidth = 400;
    const stageHeight = 200;
    const padding = 60;
    const cols = Math.floor((stageWidth - padding * 2) / 70);
    const count = this.instruments.length;
    const col = count % cols;
    const row = Math.floor(count / cols);
    const x = padding + col * 70 + 35;
    const y = padding + row * 60 + 30;

    const newInstrument: Instrument = {
      id: `instrument-${this.nextInstrumentId++}`,
      type: instrumentType,
      x: Math.min(x, stageWidth - padding),
      y: Math.min(y, stageHeight - padding),
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
}
