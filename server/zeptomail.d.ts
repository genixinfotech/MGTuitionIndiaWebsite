import type { IncomingMessage, ServerResponse } from 'node:http'

export function normalizeZeptoUrl(url?: string): string
export function zeptoAuthHeader(token?: string): string
export function sendZeptoMail(
  env: Record<string, string | undefined>,
  payload: { kind: string; data: Record<string, unknown> },
): Promise<void>
export function createEmailMiddleware(
  env: Record<string, string | undefined>,
): (req: IncomingMessage, res: ServerResponse) => Promise<void>
