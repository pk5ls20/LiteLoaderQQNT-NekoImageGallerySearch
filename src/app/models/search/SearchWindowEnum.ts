export enum serverStatus {
  CONNECTED = 0,
  UNAUTHORIZED = 1,
  DISCONNECTED = 2
}

export enum searchType {
  TEXT = 0,
  OCR = 1,
  IMAGE = 2,
  ADVANCED = 3
}

export enum promptType {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
  COMBINED = 'combined'
}

export enum fetchType {
  FIRST = 0,
  MORE = 1
}

export enum fetchStatus {
  NONE = 0,
  FIRST_FETCHING = 1,
  FIRST_SUCCESS = 2,
  MORE_FETCHING = 3,
  MORE_SUCCESS = 4
}
