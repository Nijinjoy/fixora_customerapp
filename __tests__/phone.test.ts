import { formatPhone, getPhoneError, normalizePhone } from '../src/utils/phone';

describe('normalizePhone', () => {
  it.each([
    ['+91 98765 43210', '9876543210'],
    ['919876543210', '9876543210'],
    ['09876543210', '9876543210'],
    ['98765432101', '9876543210'],
    ['9198765432', '9198765432'],
    ['98a76-5', '98765'],
  ])('%s -> %s', (input, expected) => {
    expect(normalizePhone(input)).toBe(expected);
  });
});

describe('getPhoneError', () => {
  it('stays quiet until touched, and for valid or empty input', () => {
    expect(getPhoneError('98', false)).toBeNull();
    expect(getPhoneError('', true)).toBeNull();
    expect(getPhoneError('9876543210', true)).toBeNull();
  });

  it('explains short and wrongly-prefixed numbers', () => {
    expect(getPhoneError('98765', true)).toBe(
      'Enter a valid 10-digit mobile number',
    );
    expect(getPhoneError('5876543210', true)).toBe(
      'Mobile numbers start with 6, 7, 8 or 9',
    );
  });
});

test('formatPhone', () => {
  expect(formatPhone('9876543210')).toBe('+91 98765 43210');
});
