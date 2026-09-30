import { ApiRequestLog } from '../models/api-request-log.model.js';

type AuditEntry = {
  event: string;
  method?: string;
  path?: string;
  statusCode?: number;
  ip?: string;
  deviceId?: string;
  timezone?: string;
  error?: string;
};

/** Fire-and-forget — never fail the API request if logging fails. */
export function recordApiEvent(entry: AuditEntry): void {
  void ApiRequestLog.create(entry).catch(() => {
    /* audit log optional */
  });
}
