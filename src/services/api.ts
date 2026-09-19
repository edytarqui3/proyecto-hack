import { Platform } from 'react-native';

// En Android Emulator, localhost de la máquina host es 10.0.2.2
// En iOS Simulator o Web, localhost es localhost
const DEFAULT_HOST = Platform.OS === 'android' ? 'http://10.0.2.2:3000/api/v1' : 'http://localhost:3000/api/v1';

let currentBaseUrl = DEFAULT_HOST;

export const ApiService = {
  getBaseUrl(): string {
    return currentBaseUrl;
  },

  setBaseUrl(url: string): void {
    currentBaseUrl = url.trim();
  },

  async getCreditEvaluations(): Promise<any[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`${currentBaseUrl}/credit-evaluations`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return await res.json();
    } catch (e: any) {
      console.log(`[API] Error al consultar ${currentBaseUrl}/credit-evaluations:`, e.message);
      return [];
    }
  },

  async saveCreditEvaluation(payload: any): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(`${currentBaseUrl}/credit-evaluations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        return { success: true, data: json };
      } else {
        return { success: false, error: json.message || 'Error en servidor' };
      }
    } catch (e: any) {
      return { success: false, error: `Error de red: ${e.message}` };
    }
  },

  async seedAll(): Promise<boolean> {
    try {
      const res = await fetch(`${currentBaseUrl}/seed/all`, { method: 'POST' });
      return res.ok;
    } catch {
      return false;
    }
  },
};
