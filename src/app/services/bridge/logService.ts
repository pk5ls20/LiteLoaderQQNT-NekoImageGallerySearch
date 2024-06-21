// @ts-ignore
import { log } from '../../../common/logs';

interface LogService {
  set(...args: any[]): void;
}

export class devLogService implements LogService {
  set(...args: any[]): void {
    console.log(...args);
  }
}

export class LLNTLogService implements LogService {
  set(...args: any[]): void {
    log.debug('[Vue app log]', ...args);
  }
}
