export enum EntityType {
  PERSON = 'PERSON',
  LOCATION = 'LOCATION',
  EMAIL_ADDRESS = 'EMAIL_ADDRESS',
  IP_ADDRESS = 'IP_ADDRESS',
  PHONE_NUMBER = 'PHONE_NUMBER',
  CREDIT_CARD = 'CREDIT_CARD',
  DATE_TIME = 'DATE_TIME',
  URL = 'URL'
}

export interface DetectedEntity {
  text: string;
  type: EntityType;
  startIndex?: number; // Calculated client-side
  endIndex?: number;   // Calculated client-side
}

export type RedactionMode = 'REDACT' | 'MASK';

export interface ProcessingStats {
  totalEntities: number;
  levenshteinDistance: number;
  similarityScore: number;
  breakdown: Record<EntityType, number>;
}