import { AgeGroup } from '../entities/child.entity';

/**
 * Calculate the age group based on birth date
 * Age ranges:
 * - MLADJA_JASLENA: 0.5y - 1.5y
 * - STARIJA_JASLENA: 1.5y - 2.5y
 * - MLADJA: 2.5y - 3.5y
 * - SREDNJA: 3.5y - 4.5y
 * - STARIJA: 4.5y - 5.5y
 * - NAJSTARIJA: 5.5y - 6.5y
 */
export function calculateAgeGroup(birthDate: Date, referenceDate: Date = new Date()): AgeGroup | null {
    const ageInMonths = getAgeInMonths(birthDate, referenceDate);

    // Converting years to months for easier comparison
    // 0.5y = 6 months, 1.5y = 18 months, etc.

    if (ageInMonths >= 6 && ageInMonths < 18) {
        return AgeGroup.MLADJA_JASLENA;
    } else if (ageInMonths >= 18 && ageInMonths < 30) {
        return AgeGroup.STARIJA_JASLENA;
    } else if (ageInMonths >= 30 && ageInMonths < 42) {
        return AgeGroup.MLADJA;
    } else if (ageInMonths >= 42 && ageInMonths < 54) {
        return AgeGroup.SREDNJA;
    } else if (ageInMonths >= 54 && ageInMonths < 66) {
        return AgeGroup.STARIJA;
    } else if (ageInMonths >= 66 && ageInMonths < 78) {
        return AgeGroup.NAJSTARIJA;
    }

    return null; // Child is too young or too old for these groups
}

/**
 * Calculate age in months between two dates
 */
function getAgeInMonths(birthDate: Date, referenceDate: Date): number {
    const birth = new Date(birthDate);
    const reference = new Date(referenceDate);

    let months = (reference.getFullYear() - birth.getFullYear()) * 12;
    months += reference.getMonth() - birth.getMonth();

    // If the day of the month hasn't been reached yet, subtract one month
    if (reference.getDate() < birth.getDate()) {
        months--;
    }

    return months;
}

/**
 * Get age in years (decimal) from birth date
 */
export function getAgeInYears(birthDate: Date, referenceDate: Date = new Date()): number {
    return getAgeInMonths(birthDate, referenceDate) / 12;
}
