import { environment } from '../../../environments/environment';
import Clarity from '@microsoft/clarity';

const CLARITY_PROJECT_ID = 'xyvkq0pjf9';

export function initClarity(): void {
  if (typeof window === 'undefined') return;
  if (!environment.enableAnalytics) {
    console.log('[Clarity] skipped — enableAnalytics is', environment.enableAnalytics);
    return;
  }
  console.log('[Clarity] initializing with project:', CLARITY_PROJECT_ID);
  Clarity.init(CLARITY_PROJECT_ID);
  console.log('[Clarity] done');
}
