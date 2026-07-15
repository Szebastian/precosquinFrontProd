import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
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

  instrumentKeys = ['drums', 'guitar', 'bass', 'keyboard', 'microphone', 'amp', 'monitor', 'micstand', 'musician', 'di-box', 'ac-power'] as const;

  instrumentConfig: { [key: string]: { label: string; icon: string } } = {
    drums:       { label: 'Batería',             icon: 'assets/iconoForm/bateria.webp' },
    guitar:      { label: 'Guitarra',            icon: 'assets/iconoForm/guitarra.webp' },
    bass:        { label: 'Bajo',                icon: 'assets/iconoForm/guitarra-electrica.webp' },
    keyboard:    { label: 'Teclado',             icon: 'assets/iconoForm/teclado.webp' },
    microphone:  { label: 'Micrófono',           icon: 'assets/iconoForm/microfono.webp' },
    amp:         { label: 'Amplificador',        icon: 'assets/iconoForm/amplificador.webp' },
    monitor:     { label: 'Monitor',             icon: 'assets/iconoForm/altavoz-de-musica.webp' },
    micstand:    { label: 'Micrófono (trípode)', icon: 'assets/iconoForm/microfono-tripode.webp' },
    musician:    { label: 'Músico',              icon: 'assets/iconoForm/usuario.webp' },
    'di-box':    { label: 'DI Box',              icon: 'assets/iconoForm/dibox.webp' },
    'ac-power':  { label: 'Energía',             icon: 'assets/iconoForm/energia.webp' },
  };

  constructor() { }

  ngOnInit() {
    this.instruments = this.initialInstruments.map(inst => ({ ...inst }));
    this.nextInstrumentId = this.instruments.length > 0
      ? Math.max(...this.instruments.map(i => parseInt(i.id.split('-')[1]))) + 1
      : 0;
  }

  getIcon(type: string): string {
    return this.instrumentConfig[type]?.icon || '';
  }

  getLabel(type: string): string {
    return this.instrumentConfig[type]?.label || type;
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

  private emitInstrumentsChange(): void {
    this.instrumentsChange.emit(this.instruments);
  }
}
