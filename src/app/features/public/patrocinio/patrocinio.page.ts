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
  destacado: string;
  incluye: string[];
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
      nombre: 'Público Federal',
      descripcion: 'Espectadores de todo el país y la región.'
    },
    {
      icono: 'youtube',
      nombre: 'Alcance Digital',
      descripcion: 'Transmisión en vivo de alta fidelidad y redes activas.'
    },
    {
      icono: 'instagram',
      nombre: 'Identidad Tradicional',
      descripcion: 'Un público con fuerte sentido de pertenencia.'
    }
  ];

  ventajas: VentajaAudiencia[] = [
    {
      icono: 'ojo',
      titulo: 'Público Federal',
      texto: 'Espectadores de todo el país y la región.'
    },
    {
      icono: 'mapa',
      titulo: 'Alcance Digital',
      texto: 'Transmisión en vivo de alta fidelidad y redes activas.'
    },
    {
      icono: 'play',
      titulo: 'Identidad Tradicional',
      texto: 'Un público con fuerte sentido de pertenencia.'
    }
  ];

  planes: Plan[] = [
    {
      id: 'candil',
      nombre: 'El Candil',
      tagline: 'Presencia Comercial',
      precio: '$130.000',
      precioLabel: 'Inversión · Julio',
      popular: true,
      color: 'var(--brand-500)',
      destacado: 'Logo en pantallas y menciones en vivo.',
      incluye: [
        'Banner digital rotativo en streaming (YouTube/Insta).',
        '1 mención del locutor por jornada.',
        'Logo en la web oficial del festival.'
      ]
    },
    {
      id: 'juntada',
      nombre: 'La Juntada',
      tagline: 'Destacado Multicanal',
      precio: '$250.000',
      precioLabel: 'Inversión · Julio',
      color: 'var(--brand-600)',
      destacado: 'Espacio físico y publicidad preferencial.',
      incluye: [
        'Stand / espacio publicitario en el predio.',
        'Banner fijo en la transmisión en vivo.',
        '3 menciones del locutor por jornada.',
        'Presencia destacada en redes y folletería.'
      ]
    },
    {
      id: 'padrino',
      nombre: 'El Gran Padrino',
      tagline: 'Sponsor Oficial Exclusivo',
      precio: '$500.000',
      precioLabel: 'Inversión · Julio',
      color: 'var(--brand-900)',
      destacado: 'Sponsor Oficial Exclusivo del festival.',
      incluye: [
        'Publicidad exclusiva en pantalla principal de YouTube.',
        'Banner central gigante en el escenario.',
        'Menciones continuas de los locutores principales.',
        'Presencia total en gráfica, vía pública y prensa.'
      ]
    }
  ];

  planActivo: string = this.planes[0].id;

  beneficiosJulio = [
    {
      titulo: 'Exposición Temprana',
      texto: 'Presencia en campañas publicitarias desde ahora.'
    },
    {
      titulo: 'Mejor Precio',
      texto: 'Tarifas promocionales por contratación anticipada.'
    },
    {
      titulo: 'Ubicación Premium',
      texto: 'Prioridad en los espacios físicos y digitales más visuales.'
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

