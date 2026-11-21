import { profileSchema } from '../src/schemas/profileSchema';

const parse = (values: { name: string; email: string; photo?: string }) =>
  profileSchema.safeParse(values);

const messages = (values: { name: string; email: string }) => {
  const result = parse(values);
  return result.success ? [] : result.error.issues.map(i => i.message);
};

describe('profileSchema', () => {
  it('trims the name and turns an empty email into undefined', () => {
    const result = parse({ name: '  Anu Joseph ', email: '  ' });
    expect(result.success && result.data).toEqual({
      name: 'Anu Joseph',
      email: undefined,
    });
  });

  it('keeps a trimmed, valid email and the photo', () => {
    const result = parse({
      name: 'Anu',
      email: ' anu@example.com ',
      photo: 'file://p.jpg',
    });
    expect(result.success && result.data).toEqual({
      name: 'Anu',
      email: 'anu@example.com',
      photo: 'file://p.jpg',
    });
  });

  it('rejects a name shorter than 2 characters', () => {
    expect(messages({ name: ' A ', email: '' })).toEqual([
      'Enter your full name',
    ]);
  });

  it('rejects an invalid email', () => {
    expect(messages({ name: 'Anu', email: 'anu@example' })).toEqual([
      'Enter a valid email address',
    ]);
  });
});
