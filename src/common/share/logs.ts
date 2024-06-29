export const log = {
  base(method: 'log' | 'debug', tag: string, ...args: any[]) {
    console[method](`[Plugin-NekoImage ${tag}]`, new Date().toLocaleString(), ...args);
  },
  success(...args: any[]) {
    this.base('log', 'SUCCESS', ...args);
  },
  error(...args: any[]) {
    this.base('log', 'ERROR', ...args);
  },
  warn(...args: any[]) {
    this.base('log', 'WARN', ...args);
  },
  debug(...args: any[]) {
    this.base('debug', 'DEBUG', ...args);
  }
};
