import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-documentacion-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './documentacion.page.html',
  styleUrl: './documentacion.page.css'
})
export class DocumentacionPageComponent {
  openSection = signal<string | null>(null);

  toggleSection(id: string): void {
    this.openSection.set(this.openSection() === id ? null : id);
  }

  categoriasMusica = [
    { id: 'sv', nombre: 'Solista Vocal', tiempo: '5 min', desc: 'Interpretación vocal de folklore, tango o música popular argentina.', reglas: 'Presentar 2 obras (1 elegida + 1 del jurado). Si avanza a final: 1 obra más.', criterios: 'Técnica Vocal (afinación, respiración, vibrato) · Interpretación (fraseo, planos sonoros, matices) · Recursos (melódico, estilístico) · Color' },
    { id: 'dv', nombre: 'Dúo Vocal', tiempo: '5 min', desc: 'Interpretación vocal de dos artistas.', reglas: 'Mismas reglas que Solista Vocal. Evaluación de ensamble y arreglos.', criterios: 'Interpretación (ensamble, estilo) · Técnica Vocal · Color · Arreglos (creatividad, tratamiento armónico)' },
    { id: 'cv', nombre: 'Conjunto Vocal', tiempo: '5 min', desc: 'Grupo vocal de 3 a 8 integrantes.', reglas: 'Presentar 2 obras. Evaluación de empaste vocal y arreglos.', criterios: 'Técnica Vocal · Interpretación (ensamble) · Tímbrica (empaste vocal) · Arreglos' },
    { id: 'si', nombre: 'Solista Instrumental', tiempo: '5 min', desc: 'Interpretación instrumental en solitario.', reglas: 'Puede ser acompañado por 1 instrumento armónico (excepcional). Sin cambios de instrumento. Sin pistas grabadas.', criterios: 'Técnica (afinación, precisión rítmica) · Repertorio (complejidad) · Interpretación (fraseo, dinámica) · Arreglos (creatividad, textura)' },
    { id: 'ci', nombre: 'Conjunto Instrumental', tiempo: '5 min', desc: 'Grupo instrumental de hasta 10 integrantes.', reglas: 'Máximo 10 integrantes. Sin pistas grabadas.', criterios: 'Técnica Instrumental · Repertorio · Interpretación (ensamble, planos sonoros) · Arreglos' },
    { id: 'smm', nombre: 'Solista de Malambo Masculino', tiempo: '2-4 min', desc: 'Malambo masculino en solitario.', reglas: 'Mínimo 2 min, máximo 4 min. Estilo norteño o sureño. Intro musical máx 30 seg. Preparar 3 pasadas diferentes.', criterios: 'Estilo (mudanzas, atuendo) · Rutina Coreográfica (inicio, desarrollo, remate) · Interpretación (técnica del movimiento) · Puesta (acompañamiento musical)' },
    { id: 'smf', nombre: 'Solista de Malambo Femenino', tiempo: '2-4 min', desc: 'Malambo femenino en solitario.', reglas: 'Mismas reglas que el masculino. Estilo norteño o sureño.', criterios: 'Mismos criterios que Malambo Masculino' },
    { id: 'cm', nombre: 'Conjunto de Malambo', tiempo: '3-4 min', desc: 'Grupo de 4 a 8 bailarines de malambo.', reglas: 'Mínimo 4, máximo 8 integrantes. Máximo 4 músicos en vivo. Puede cambiar estilo entre ronda y final.', criterios: 'Estilo · Rutina Coreográfica · Interpretación · Puesta' },
    { id: 'ci2', nombre: 'Canción Inédita', tiempo: '5 min', desc: 'Obra musical inédita del participante.', reglas: 'Presentar la obra completa. Evaluación de producción, arreglo y métrica.', criterios: 'Propuesta (producción, arreglo) · Música (forma, estructura armónica) · Métrica (rima, regionalismo)' },
    { id: 'eof', nombre: 'Expresión Oral Folklórica', tiempo: '5-8 min', desc: 'Narradores, recitadores, "decidores". NUEVA CATEGORÍA.', reglas: 'Mínimo 5 min, máximo 8 min. Categoría nueva desde 2026.', criterios: 'Interpretación y expresión oral · Contenido, identidad cultural y valor folklórico · Presencia Escénica y Desempeño Artístico' },
  ];

  categoriasDanza = [
    { id: 'pbt', nombre: 'Pareja de Baile Tradicional', tiempo: '5 min', desc: 'Pareja que interpreta baile folklórico con respeto a las características regionales.', reglas: 'Puede usar música grabada. Evaluación de estilo regional y coreografía.', criterios: 'Estilo (respeto características regionales) · Coreografía (estructuración tradicional) · Interpretación (técnica, correspondencia, musicalidad) · Puesta (acompañamiento, atuendo)' },
    { id: 'pbe', nombre: 'Pareja de Baile Estilizada', tiempo: '5 min', desc: 'Pareja con propuesta estilizada de baile folklórico.', reglas: 'Puede usar música grabada. Evaluación de puesta en escena y estilo.', criterios: 'Mismos criterios que Pareja Tradicional, con mayor énfasis en estilización' },
    { id: 'cbf', nombre: 'Conjunto de Baile Folklórico', tiempo: '8-10 min', desc: 'Grupo de mínimo 8 bailarines con puesta de carácter artístico.', reglas: 'Mínimo 8 participantes. Puede usar música grabada. Máximo 16 integrantes en Cosquín. Máximo 2 asistentes de escena. 20 seg antes y después para utilería.', criterios: 'Diseño Coreográfico · Estilo · Interpretación (técnica, musicalidad) · Musicalización de la Obra' },
  ];

  formatCriterios(criterios: string): string[] {
    return criterios.split(' · ');
  }
}
