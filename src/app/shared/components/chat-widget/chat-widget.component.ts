import { Component, signal, computed, ElementRef, ViewChild, AfterViewChecked, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
  source?: string;
  suggestions?: string[];
  timestamp: Date;
}

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Floating button -->
    <button
      class="chat-fab"
      [class.chat-fab--open]="isOpen()"
      (click)="toggle()"
      aria-label="Abrir chat de ayuda">
      @if (!isOpen()) {
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      } @else {
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      }
    </button>

    <!-- Chat panel -->
    @if (isOpen()) {
      <div class="chat-panel" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="chat-header">
          <div class="chat-header-info">
            <div class="chat-avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div>
              <span class="chat-header-title">Pre-Cosquín 2027</span>
              <span class="chat-header-status">Asistente virtual</span>
            </div>
          </div>
          <button class="chat-close" (click)="toggle()" aria-label="Cerrar chat">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Messages -->
        <div class="chat-messages" #chatMessages>
          @for (msg of messages(); track msg.timestamp) {
            <div class="chat-msg" [class.chat-msg--user]="msg.role === 'user'" [class.chat-msg--bot]="msg.role === 'bot'">
              @if (msg.role === 'bot') {
                <div class="chat-msg-avatar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
              }
              <div class="chat-msg-content">
                @if (msg.role === 'bot' && msg.source === 'faq') {
                  <span class="chat-msg-badge">Respuesta frecuente</span>
                }
                <div class="chat-msg-bubble">
                  @if (msg.role === 'bot') {
                    <p class="chat-msg-text" [innerHTML]="parseLinks(msg.text)"></p>
                  } @else {
                    <p class="chat-msg-text">{{ msg.text }}</p>
                  }
                </div>
              </div>
            </div>
          }

          @if (loading()) {
            <div class="chat-msg chat-msg--bot">
              <div class="chat-msg-avatar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div class="chat-msg-content">
                <div class="chat-msg-bubble chat-typing">
                  <span class="chat-typing-dot"></span>
                  <span class="chat-typing-dot"></span>
                  <span class="chat-typing-dot"></span>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Suggestions -->
        @if (messages().length > 0 && messages()[messages().length - 1].role === 'bot' && !loading() && suggestions().length > 0) {
          <div class="chat-suggestions">
            <span class="chat-suggestions-label">Preguntá por:</span>
            <div class="chat-suggestions-btns">
              @for (sug of suggestions().slice(0, 3); track sug) {
                <button class="chat-suggestion-btn" (click)="sendSuggestion(sug)">{{ sug }}</button>
              }
            </div>
          </div>
        }

        <!-- Input -->
        <div class="chat-input-area">
          <input
            type="text"
            class="chat-input"
            [ngModel]="inputValue()"
            (ngModelChange)="inputValue.set($event)"
            (keyup.enter)="send()"
            placeholder="Escribí tu pregunta..."
            [disabled]="loading()" />
          <button
            class="chat-send"
            (click)="send()"
            [disabled]="!inputValue().trim() || loading()"
            aria-label="Enviar mensaje">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>

        <!-- Footer -->
        <div class="chat-footer">
          <a href="https://precosquinpiramides.com" target="_blank" rel="noopener">
            Preguntas Frecuentes
          </a>
        </div>
      </div>
    }
  `,
  styles: [`
    :host {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    /* Floating Action Button */
    .chat-fab {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
      color: white;
      box-shadow: 0 4px 20px rgba(37,99,235,0.3);
      transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .chat-fab:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 28px rgba(37,99,235,0.4);
    }
    .chat-fab--open {
      background: #64748b;
      box-shadow: 0 4px 16px rgba(100,116,139,0.3);
    }

    /* Panel */
    .chat-panel {
      position: absolute;
      bottom: 76px;
      right: 0;
      width: 360px;
      max-height: 540px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 12px 48px rgba(0,0,0,0.12);
      animation: chatSlideUp 0.3s cubic-bezier(0.22, 1, 0.36, 1);
    }
    @keyframes chatSlideUp {
      from { opacity: 0; transform: translateY(16px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* Header */
    .chat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
      border-bottom: 1px solid #e2e8f0;
    }
    .chat-header-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .chat-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    .chat-header-title {
      display: block;
      font-size: 0.95rem;
      font-weight: 700;
      color: white;
    }
    .chat-header-status {
      display: block;
      font-size: 0.72rem;
      color: rgba(255,255,255,0.8);
    }
    .chat-close {
      background: rgba(255,255,255,0.2);
      border: none;
      border-radius: 8px;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      cursor: pointer;
      transition: background 0.2s;
    }
    .chat-close:hover { background: rgba(255,255,255,0.3); }

    /* Messages */
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-height: 280px;
      max-height: 340px;
      scroll-behavior: smooth;
    }
    .chat-msg {
      display: flex;
      gap: 8px;
      max-width: 85%;
      animation: chatFadeIn 0.2s ease-out;
    }
    @keyframes chatFadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .chat-msg--user {
      align-self: flex-end;
      flex-direction: row-reverse;
    }
    .chat-msg--bot { align-self: flex-start; }
    .chat-msg-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #e0e7ff;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #3b82f6;
      flex-shrink: 0;
    }
    .chat-msg-bubble {
      padding: 10px 14px;
      border-radius: 14px;
      font-size: 0.85rem;
      line-height: 1.5;
    }
    .chat-msg--bot .chat-msg-bubble {
      background: #f1f5f9;
      color: #334155;
      border-bottom-left-radius: 4px;
    }
    .chat-msg--user .chat-msg-bubble {
      background: #3b82f6;
      color: white;
      border-bottom-right-radius: 4px;
    }
    .chat-msg-text { margin: 0; }
    .chat-link {
      color: #2563eb;
      text-decoration: underline;
      font-weight: 600;
    }
    .chat-link:hover {
      color: #1d4ed8;
    }
    .chat-link--prominent {
      display: inline-block;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      padding: 6px 16px;
      border-radius: 20px;
      font-weight: 600;
      margin: 4px 0;
      border: 2px solid transparent;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
    }
    .chat-link--prominent:hover {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
    }
    .chat-msg-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .chat-msg-badge {
      display: inline-block;
      padding: 2px 8px;
      background: #dbeafe;
      color: #2563eb;
      font-size: 0.65rem;
      font-weight: 600;
      border-radius: 10px;
      width: fit-content;
    }

    /* Typing indicator */
    .chat-typing {
      display: flex;
      gap: 4px;
      padding: 12px 18px !important;
    }
    .chat-typing-dot {
      width: 7px;
      height: 7px;
      background: #94a3b8;
      border-radius: 50%;
      animation: chatBounce 1.2s infinite;
    }
    .chat-typing-dot:nth-child(2) { animation-delay: 0.15s; }
    .chat-typing-dot:nth-child(3) { animation-delay: 0.3s; }
    @keyframes chatBounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-5px); }
    }

    /* Suggestions */
    .chat-suggestions {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 4px 16px 8px;
      align-items: flex-start;
    }
    .chat-suggestions-label {
      font-size: 0.7rem;
      color: #64748b;
      font-weight: 500;
    }
    .chat-suggestions-btns {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .chat-suggestion-btn {
      padding: 8px 14px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      color: #475569;
      font-size: 0.78rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    .chat-suggestion-btn:hover {
      background: #eff6ff;
      border-color: #bfdbfe;
      color: #2563eb;
    }

    /* Input area */
    .chat-input-area {
      display: flex;
      gap: 8px;
      padding: 12px 16px;
      border-top: 1px solid #e2e8f0;
      background: #ffffff;
    }
    .chat-input {
      flex: 1;
      padding: 12px 16px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      color: #334155;
      font-size: 0.88rem;
      outline: none;
      transition: border-color 0.2s;
    }
    .chat-input:focus { border-color: #3b82f6; }
    .chat-input::placeholder { color: #94a3b8; }
    .chat-input:disabled { opacity: 0.5; }
    .chat-send {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      border: none;
      background: #3b82f6;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      flex-shrink: 0;
    }
    .chat-send:hover:not(:disabled) { background: #2563eb; }
    .chat-send:disabled { opacity: 0.4; cursor: not-allowed; background: #94a3b8; }

    /* Footer */
    .chat-footer {
      padding: 10px 16px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
      background: #f8fafc;
    }
    .chat-footer a {
      color: #64748b;
      font-size: 0.72rem;
      text-decoration: none;
    }
    .chat-footer a:hover { color: #475569; text-decoration: underline; }

    /* Responsive */
    @media (max-width: 1024px) {
      :host {
        bottom: 84px;
        right: 16px;
      }
    }
    @media (max-width: 480px) {
      :host {
        bottom: 84px;
        right: 16px;
      }
      .chat-panel {
        position: fixed;
        bottom: 0;
        right: 0;
        left: 0;
        width: 100%;
        max-height: calc(100vh - 56px);
        border-radius: 16px 16px 0 0;
        box-shadow: 0 -4px 20px rgba(0,0,0,0.12);
        animation: chatSlideUpMobile 0.3s cubic-bezier(0.22, 1, 0.36, 1);
      }
      @keyframes chatSlideUpMobile {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
      }
      .chat-messages { min-height: 50vh; max-height: 60vh; }
      /* Add bottom padding so content isn't hidden behind mobile browser nav */
      .chat-input-area { padding-bottom: env(safe-area-inset-bottom, 0px); }
    }
  `]
})
export class ChatWidgetComponent implements AfterViewChecked {
  @ViewChild('chatMessages') chatMessagesRef?: ElementRef<HTMLElement>;

  private http = inject(HttpClient);

  isOpen = signal(false);
  loading = signal(false);
  inputValue = signal('');
  messages = signal<ChatMessage[]>([]);
  suggestions = signal<string[]>([
    '¿Cómo me inscribo?',
    '¿Qué categorías hay?',
    '¿Cómo me hago sponsor?',
  ]);

  private shouldScroll = false;

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  toggle(): void {
    this.isOpen.update(v => !v);
    if (this.isOpen() && this.messages().length === 0) {
      // Welcome message
      this.messages.set([{
        role: 'bot',
        text: '¡Hola! Soy el asistente de Pre-Cosquín Puerto Pirámides 2027. ¿En qué puedo ayudarte?',
        timestamp: new Date(),
      }]);
    }
  }

  send(): void {
    const text = this.inputValue().trim();
    if (!text || this.loading()) return;

    // Add user message
    this.messages.update(msgs => [...msgs, {
      role: 'user',
      text,
      timestamp: new Date(),
    }]);
    this.inputValue.set('');
    this.loading.set(true);
    this.shouldScroll = true;

    // Call API
    this.http.post<{ reply: string; source: string; suggestions: string[] }>(
      `${environment.apiUrl}/chat/`,
      { message: text, session_id: this.getSessionId() }
    ).subscribe({
      next: (res) => {
        this.messages.update(msgs => [...msgs, {
          role: 'bot',
          text: res.reply,
          source: res.source,
          suggestions: res.suggestions,
          timestamp: new Date(),
        }]);
        this.loading.set(false);
        this.shouldScroll = true;
      },
      error: () => {
        this.messages.update(msgs => [...msgs, {
          role: 'bot',
          text: 'Disculpá, hubo un error. Intentá de nuevo o visitá precosquinpiramides.com',
          timestamp: new Date(),
        }]);
        this.loading.set(false);
        this.shouldScroll = true;
      },
    });
  }

  sendSuggestion(sug: string): void {
    this.suggestions.update(sugs => sugs.filter(s => s !== sug));
    this.inputValue.set(sug);
    this.send();
  }

  private scrollToBottom(): void {
    const el = this.chatMessagesRef?.nativeElement;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }

  private getSessionId(): string {
    let id = localStorage.getItem('chat_session_id');
    if (!id) {
      id = 'chat_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('chat_session_id', id);
    }
    return id;
  }

  parseLinks(text: string): string {
    // Handle "hacé click acá <url>" pattern - make "hacé click acá" the link text
    const clickHereRegex = /(hac[eé]\s*click\s*ac[aí]|haga\s*click\s*ac[aí]|haga\s*clic\s*ac[aí]|hac[eé]\s*clic\s*ac[aí])\s+(https?:\/\/[^\s]+|precosquinpiramides\.com[^\s]*)/gi;
    text = text.replace(clickHereRegex, (match, linkText, url) => {
      const href = url.startsWith('http') ? url : `https://${url}`;
      let label = 'hacé click acá';
      if (url.includes('/inscripcion')) label = 'hacé click acá';
      else if (url.includes('/stands/nuevo')) label = 'hacé click acá';
      else if (url.includes('/patrocinio')) label = 'hacé click acá';
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="chat-link chat-link--prominent">${label}</a>`;
    });

    // Handle regular URLs
    const urlRegex = /(https?:\/\/[^\s]+|precosquinpiramides\.com[^\s,.]*)/g;
    text = text.replace(urlRegex, (url) => {
      const href = url.startsWith('http') ? url : `https://${url}`;
      let label = url;
      if (url.includes('/inscripcion')) label = 'Formulario de inscripción';
      else if (url.includes('/stands/nuevo')) label = 'Formulario de stands';
      else if (url.includes('/patrocinio')) label = 'Planes de patrocinio';
      else if (url.includes('/cronograma')) label = 'Cronograma';
      else if (url.includes('precosquinpiramides.com')) label = 'precosquinpiramides.com';
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="chat-link">${label}</a>`;
    });

    return text;
  }
}
