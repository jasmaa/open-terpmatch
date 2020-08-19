const { validateEmail, validatePhone, formatPhone } = require('../src/utils');

describe('Email validator', () => {
    it('declares email valid', () => {
        expect(validateEmail('example@mail.com')).toBe(true);
        expect(validateEmail('JAMES1245@MAIL.ORG')).toBe(true);
        expect(validateEmail('me-me.ExAMPLLLE@maaaaaiil.xyz')).toBe(true);
        expect(validateEmail('my_name@mail.com')).toBe(true);
    });

    it('declares non-email invalid', () => {
        expect(validateEmail('a')).toBe(false);
        expect(validateEmail('@123.com')).toBe(false);
        expect(validateEmail(0)).toBe(false);
        expect(validateEmail('my name@ma    il.com')).toBe(false);
        expect(validateEmail(null)).toBe(false);
        expect(validateEmail(undefined)).toBe(false);
    });

    it('declares empty string valid', () => {
        expect(validateEmail('')).toBe(true);
    });
});

describe('Phone number validator', () => {
    it('declares phone number valid', () => {
        expect(validatePhone('1234567890')).toBe(true);
        expect(validatePhone('3287238732')).toBe(true);
        expect(validatePhone(1111111111)).toBe(true);
    });

    it('declares non-phone number invalid', () => {
        expect(validatePhone('a')).toBe(false);
        expect(validatePhone('1')).toBe(false);
        expect(validatePhone(0)).toBe(false);
        expect(validatePhone('123')).toBe(false);
        expect(validatePhone(null)).toBe(false);
        expect(validatePhone(undefined)).toBe(false);
    });

    it('declares empty string valid', () => {
        expect(validatePhone('')).toBe(true);
    });
});

describe('Phone formatter', () => {
    it('formats number as US phone number', () => {
        expect(formatPhone('1234567890')).toBe('+11234567890');
    });

    it('formats null as null', () => {
        expect(formatPhone(null)).toBe(null);
    });

    it('formats undefined as undefined', () => {
        expect(formatPhone(undefined)).toBe(undefined);
    });
});