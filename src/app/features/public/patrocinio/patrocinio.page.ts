import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Canal {
  icono: string;
  nombre: string;
  descripcion: string;
}

interface Beneficio {
  texto: string;
  destacado?: boolean;
}

interface VentajaAudiencia {
  icono: string;
  titulo: string;
  texto: string;
}

interface Plan {
  id: string;
  nombre: string;
  tagline: string;
  precio: string;
  precioLabel: string;
  popular?: boolean;
  color: string;
  resumen: string;
  web: Beneficio[];
  youtube: Beneficio[];
  instagram: Beneficio[];
  cierre: string;
  comparacion: string;
}

@Component({
  selector: 'app-patrocinio-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './patrocinio.page.html',
  styleUrl: './patrocinio.page.scss'
})
export class PatrocinioPageComponent {
  socios = [
    { nombre: 'Rayentray', logo: 'assets/img/LRayentray.webp' },
    { nombre: 'Hydro', logo: 'assets/img/LHydro.webp' },
    { nombre: 'Piramides', logo: 'assets/img/LPiramides.webp' },
    { nombre: 'Pre-Cosquín', logo: 'assets/img/logoballena.webp' },
  ];

  canales: Canal[] = [
    {
      icono: 'web',
      nombre: 'La Web Oficial de la Sede',
      descripcion: 'El punto de encuentro obligatorio donde participantes de toda la Patagonia ya están ingresando para descargar las bases e inscribirse.'
    },
    {
      icono: 'youtube',
      nombre: 'Transmisión en Vivo (YouTube · 5 y 6 Sept.)',
      descripcion: 'El canal con mayor tiempo de permanencia. Familias de todo el país se conectan en tiempo real y la transmisión queda grabada de forma permanente.'
    },
    {
      icono: 'instagram',
      nombre: 'Instagram Activo',
      descripcion: 'El motor del día a día, donde generamos interacción y expectativa creciente rumbo al primer fin de semana de septiembre.'
    }
  ];

  ventajas: VentajaAudiencia[] = [
    {
      icono: 'ojo',
      titulo: 'Visibilidad inmediata',
      texto: 'Tu marca se activa desde el momento de tu contratación, no solo los días del evento.'
    },
    {
      icono: 'mapa',
      titulo: 'Alcance multicanal',
      texto: 'Llegás a nivel local, provincial y nacional durante las jornadas del 5 y 6 de septiembre.'
    },
    {
      icono: 'calendario',
      titulo: 'Campaña previa',
      texto: 'Sumate en julio y agosto: la comunicación ya está en marcha y creciendo.'
    },
    {
      icono: 'play',
      titulo: 'Exposición permanente',
      texto: 'La transmisión grabada en YouTube sigue sumando visualizaciones meses después.'
    }
  ];

  planes: Plan[] = [
    {
      id: 'candil',
      nombre: 'El Candil',
      tagline: 'Presencia Comercial Inicial',
      precio: '$60.000',
      precioLabel: 'Inversión única',
      color: 'var(--brand-500)',
      resumen: 'La primera luz que se enciende en el fogón. Ideal para pequeños comercios, artesanos y emprendedores de la región.',
      web: [
        { texto: 'Logotipo en la sección Sponsors Oficiales de la web.' }
      ],
      youtube: [],
      instagram: [
        { texto: 'Mención en publicación grupal a los comercios que apoyan la cultura local.' }
      ],
      cierre: 'Tu marca activa en la web durante todo el proceso de inscripción de los artistas.',
      comparacion: 'Logotipo en Sponsors + mención en Instagram'
    },
    {
      id: 'trunca',
      nombre: 'La Trunca',
      tagline: 'Destacado Multicanal — El más elegido',
      precio: '$180.000',
      precioLabel: 'Inversión única',
      popular: true,
      color: 'var(--brand-600)',
      resumen: 'La chacarera trunca tiene un acento fuerte y llamativo. Para comercios medianos, prestadores turísticos y restaurantes.',
      web: [
        { texto: 'Logotipo destacado (tamaño mediano) en panel lateral y cabecera.' }
      ],
      youtube: [
        { texto: '3 menciones en vivo por jornada agradeciendo tu marca.' },
        { texto: 'Placa rotativa con tu logo en las pausas técnicas.' }
      ],
      instagram: [
        { texto: '1 Historia individual exclusiva con enlace a tu propuesta.' },
        { texto: 'Mención en el posteo de agradecimiento general.' }
      ],
      cierre: 'Ideal para captar al turista que planifica su viaje a Puerto Pirámides.',
      comparacion: 'Logo destacado + 3 menciones en vivo + Historia exclusiva'
    },
    {
      id: 'fogon',
      nombre: 'El Gran Fogón',
      tagline: 'Sponsor Principal — Cupos Limitados',
      precio: '$450.000',
      precioLabel: 'Inversión única',
      color: 'var(--brand-900)',
      resumen: 'El corazón del encuentro, donde se concentra toda la atención. Para empresas líderes, grandes cadenas hoteleras e instituciones.',
      web: [
        { texto: 'Banner principal exclusivo en la portada durante julio, agosto y septiembre.' }
      ],
      youtube: [
        { texto: 'Zócalo publicitario (Lower Third) fijo en pantalla en bloques seleccionados.' },
        { texto: 'Agradecimiento estelar al inicio, intermedios y cierre de cada jornada.' },
        { texto: 'Placa a pantalla completa al inicio y cierre de las transmisiones.' }
      ],
      instagram: [
        { texto: '1 posteo o Reel en formato colaboración (Collab) mostrando tu apoyo.' },
        { texto: '3 menciones en historias durante el fin de semana del evento.' }
      ],
      cierre: 'Exclusividad de marca y máxima exposición. Tu inversión sigue rindiendo cuando los ganadores compartan sus videos.',
      comparacion: 'Banner exclusivo + Lower Third + Placa a pantalla completa'
    }
  ];

  beneficiosJulio = [
    {
      titulo: 'Exposición Temprana',
      texto: 'Si cerramos tu pauta ahora, tu logo ya empieza a figurar en la web oficial desde esta semana, captando todas las visitas de inscripciones de julio y agosto totalmente gratis.'
    },
    {
      titulo: 'Financiación en 2 Cuotas',
      texto: '50% en julio para asegurar el espacio, y 50% restante antes del 31 de agosto. Montos sumamente cómodos para cualquier comercio de la zona.'
    },
    {
      titulo: 'El Fin de Semana de Septiembre',
      texto: 'El 5 y 6 de septiembre Puerto Pirámides recibe una enorme afluencia de artistas, acompañantes, jurados y público folclórico. La oportunidad perfecta para gastronomía, hoteles y turismo.'
    }
  ];

  contacto = {
    whatsappBase: 'https://wa.me/5492804000000?text=',
    instagram: 'https://www.instagram.com/precosquinpuertopiramides',
    email: 'precosquinpuertopiramides@gmail.com'
  };

  planWhatsapp(nombre: string): string {
    const msg = `Hola! Quiero reservar el Plan ${nombre} para el Pre-Cosquín de Septiembre.`;
    return this.contacto.whatsappBase + encodeURIComponent(msg);
  }

  whatsappLink(): string {
    const msg = 'Hola! Quiero sumarme como patrocinador del Pre-Cosquín Puerto Pirámides.';
    return this.contacto.whatsappBase + encodeURIComponent(msg);
  }
}

