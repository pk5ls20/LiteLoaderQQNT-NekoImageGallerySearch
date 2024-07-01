import { sharedAdapter } from '../../adapter/SharedAdapter';

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
    sharedAdapter.Log.debug('[Vue app log]', ...args);
  }
}
