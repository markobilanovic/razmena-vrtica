import { z } from 'zod';

// Gender enum
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export const GenderSchema = z.nativeEnum(Gender);

// Age Group enum
export enum AgeGroup {
  MLADJA_JASLENA = 'MLADJA_JASLENA', // 0.5y - 1.5y
  STARIJA_JASLENA = 'STARIJA_JASLENA', // 1.5y - 2.5y
  MLADJA = 'MLADJA', // 2.5y - 3.5y
  SREDNJA = 'SREDNJA', // 3.5y - 4.5y
  STARIJA = 'STARIJA', // 4.5y - 5.5y
  NAJSTARIJA = 'NAJSTARIJA', // 5.5y - 6.5y
}

export const AgeGroupSchema = z.nativeEnum(AgeGroup);

// Match Status enum
export enum MatchStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export const MatchStatusSchema = z.nativeEnum(MatchStatus);
