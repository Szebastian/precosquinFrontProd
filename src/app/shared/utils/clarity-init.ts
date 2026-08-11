import { environment } from '../../../environments/environment';
import Clarity from '@microsoft/clarity';

const CLARITY_PROJECT_ID = 'xyvkq0pjf9';

export function initClarity(): void {
  if (typeof window === 'undefined') return;
  if (!environment.enableAnalytics) return;
  Clarity.init(CLARITY_PROJECT_ID);
}
