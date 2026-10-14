/**
 * Ambient type definitions for Supabase Edge Functions (Deno runtime).
 * Provides TypeScript intellisense and prevents IDE diagnostics errors
 * when developing in hybrid Vite/Node/Deno workspaces.
 */

declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    has(key: string): boolean;
    delete(key: string): void;
    toObject(): Record<string, string>;
  }

  export const env: Env;

  export function serve(
    handler: (req: Request) => Response | Promise<Response>
  ): void;

  export function serve(
    options: {
      port?: number;
      hostname?: string;
      onListen?: (params: { port: number; hostname: string }) => void;
    },
    handler: (req: Request) => Response | Promise<Response>
  ): void;
}
