// TODO: use date-fns

import moment = require("moment");

const enNames = {
    monthNames: ['Meskerem', 'Tikemet', 'Hidar', 'Tahesas', 'Tir', 'Yekatit', 'Megabit', 'Miazia', 'Genbot', 'Sene', 'Hamle', 'Nehase', 'Pagume'],
    monthNamesShort: ['Mes', 'Tik', 'Hid', 'Tah', 'Tir', 'Yek', 'Meg', 'Mia', 'Gen', 'Sen', 'Ham', 'Neh', 'Pag'],
    dayNames: ['Ehud', 'Segno', 'Maksegno', 'Irob', 'Hamus', 'Arb', 'Kidame'],
    dayNamesShort: ['Ehu', 'Seg', 'Mak', 'Iro', 'Ham', 'Arb', 'Kid'],
    dayNamesMin: ['Eh', 'Se', 'Ma', 'Ir', 'Ha', 'Ar', 'Ki'],
};

const amNames = {
    monthNames: ['መስከረም', 'ጥቅምት', 'ኅዳር', 'ታህሣሥ', 'ጥር', 'የካቲት', 'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜ'],
    monthNamesShort: ['መስከ', 'ጥቅም', 'ኅዳር', 'ታህሣ', 'ጥር', 'የካቲ', 'መጋቢ', 'ሚያዝ', 'ግንቦ', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜ'],
    dayNames: ['እሑድ', 'ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሓሙስ', 'ዓርብ', 'ቅዳሜ'],
    dayNamesShort: ['እሑድ', 'ሰኞ', 'ማክሰ', 'ረቡዕ', 'ሓሙስ', 'ዓርብ', 'ቅዳሜ'],
    dayNamesMin: ['እሑ', 'ሰኞ', 'ማክ', 'ረቡ', 'ሐሙ', 'ዓር', 'ቅዳ'],
};

export enum Era {
    AMETE_ALEM = -285019,
    AMETE_MIHRET = 1723856
}
// TODO: use date-fns
export class MomentEthiopia {


    private JD_GC_OFFSET: number = 1721426;
    private JD_EPOCH_OFFSET_UNSET: number = -1;
    private JDN_OFFSET: number;
    private GC_NUMBER_OF_MONTHS = 12;
    private GC_MONTH_DAYS: number[] = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    private fn: any;


    constructor() {
        this.JDN_OFFSET = this.JD_EPOCH_OFFSET_UNSET;

    }


    private static quotient(i: number, j: number): number {
        return Math.floor(i / j);
    }

    private static mod(i: number, j: number): number {
        return i % j;
    }

    private static isGregorianLeap(year: number): boolean {
        return (year % 4 === 0) && ((year % 100 !== 0) || (year % 400 === 0));
    }

    private static guessEraFromJDN(jdn: number) {
        return (jdn >= (Era.AMETE_MIHRET + 365)) ? Era.AMETE_MIHRET : Era.AMETE_ALEM;
    }

    /** ERA HELPERS */
    setEra(era: Era) {
        if ((era === Era.AMETE_ALEM) || (era === Era.AMETE_MIHRET)) {
            this.JDN_OFFSET = era;
        } else {
            this.JDN_OFFSET = Era.AMETE_MIHRET;
        }
    }

    isEraSet() {
        return (this.JD_EPOCH_OFFSET_UNSET !== this.JDN_OFFSET);
    }

    unsetEra() {
        this.JDN_OFFSET = this.JD_EPOCH_OFFSET_UNSET;
    }


    /** CONVERSION **/
    ecToJDN(day: number, month: number, year: number) {
        let ERA = this.isEraSet() ? this.JDN_OFFSET : Era.AMETE_MIHRET;
        return (ERA + 365) + 365 * (year - 1) + MomentEthiopia.quotient(year, 4) + 30 * month + day - 31;
    }

    jdnToEc(jdn: number) {
        let ERA = this.isEraSet() ? this.JDN_OFFSET : MomentEthiopia.guessEraFromJDN(jdn);
        let r = MomentEthiopia.mod((jdn - ERA), 1461);
        let n = MomentEthiopia.mod(r, 365) + 365 * MomentEthiopia.quotient(r, 1460);
        let year = 4 * MomentEthiopia.quotient((jdn - ERA), 1461) +
            MomentEthiopia.quotient(r, 365) -
            MomentEthiopia.quotient(r, 1460);
        let month = MomentEthiopia.quotient(n, 30) + 1;
        let day = MomentEthiopia.mod(n, 30) + 1;

        return [year, month, day];
    }

    gcToJDN(day: number, month: number, year: number) {
        let s = MomentEthiopia.quotient(year, 4) -
            MomentEthiopia.quotient(year - 1, 4) -
            MomentEthiopia.quotient(year, 100) +
            MomentEthiopia.quotient(year - 1, 100) +
            MomentEthiopia.quotient(year, 400) -
            MomentEthiopia.quotient(year - 1, 400);

        let t = MomentEthiopia.quotient(14 - month, 12);

        let n = 31 * t * (month - 1) +
            (1 - t) * (59 + s + 30 * (month - 3) + MomentEthiopia.quotient((3 * month - 7), 5)) +
            day - 1;

        return this.JD_GC_OFFSET + 365 * (year - 1) + MomentEthiopia.quotient(year - 1, 4) - MomentEthiopia.quotient(year - 1, 100) + MomentEthiopia.quotient(year - 1, 400) + n;
    }

    jdnToGc(jdn: number): number[] {
        let r2000 = MomentEthiopia.mod((jdn - this.JD_GC_OFFSET), 730485);
        let r400 = MomentEthiopia.mod((jdn - this.JD_GC_OFFSET), 146097);
        let r100 = MomentEthiopia.mod(r400, 36524);
        let r4 = MomentEthiopia.mod(r100, 1461);
        let n = MomentEthiopia.mod(r4, 365) + 365 * MomentEthiopia.quotient(r4, 1460);
        let s = MomentEthiopia.quotient(r4, 1095);
        let aprime = 400 * MomentEthiopia.quotient((jdn - this.JD_GC_OFFSET), 146097) +
            100 * MomentEthiopia.quotient(r400, 36524) +
            4 * MomentEthiopia.quotient(r100, 1461) +
            MomentEthiopia.quotient(r4, 365) -
            MomentEthiopia.quotient(r4, 1460) -
            MomentEthiopia.quotient(r2000, 730484);
        let year = aprime + 1;
        let t = MomentEthiopia.quotient((364 + s - n), 306);
        let month = t * (MomentEthiopia.quotient(n, 31) + 1) + (1 - t) * (MomentEthiopia.quotient((5 * (n - s) + 13), 153) + 1);
        n += 1 - MomentEthiopia.quotient(r2000, 730484);
        let day = n;


        if ((r100 === 0) && (n === 0) && (r400 !== 0)) {
            month = 12;
            day = 31;
        } else {
            this.GC_MONTH_DAYS[2] = (MomentEthiopia.isGregorianLeap(year)) ? 29 : 28;
            for (let i = 1; i <= this.GC_NUMBER_OF_MONTHS; ++i) {
                if (n <= this.GC_MONTH_DAYS[i]) {
                    day = n;
                    break;
                }
                n -= this.GC_MONTH_DAYS[i];
            }
        }
        return [year, month, day];

    }

    gcToEc(day: number, month: number, year: number) {
        let jdn = this.gcToJDN(day, month, year);
        return this.jdnToEc(jdn);
    }

    ecToGreg(day: number, month: number, year: number): number[] {
        let jdn = this.ecToJDN(day, month, year);
        return this.jdnToGc(jdn);
    }

    ecToGc(day: number, month: number, year: number, era: number): number[] {
        this.setEra(era);
        let result = this.ecToGreg(day, month, year);
        this.unsetEra();
        return result;
    }

    /***
     * convert ethiopian date gregorian date
     * @param {number[]} dateArray
     * @returns {number[]}
     */
    public toGc(dateArray: number[]) {
        let [y, m, d, era] = dateArray;
        if (d < 0 || d > 30 || m < 0 || m > 13) {
            throw new Error('Invalid Ethiopian Date');
        }
        if (!era) {
            era = Era.AMETE_MIHRET;
        }
        return this.ecToGc(d, m, y, era);
    }

    /***
     * Convert gregorian date to ethiopian date
     * @returns {number[]}
     * @param date
     */
    public toEc(date: Date) {
        let [y, m, d] = [date.getFullYear(), date.getMonth() + 1, date.getDate()];
        if (d < 0 || d > 31 || m < 0 || m > 12) {
            throw new Error('Invalid Gregorian Date');
        }
        return this.gcToEc(d, m, y);
    }





}


