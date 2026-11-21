export type GoogleProfile = {
  name: string;
  email: string;
  photo?: string;
};

export async function getGoogleProfile(): Promise<GoogleProfile> {
  throw new Error(
    "Google sign-in isn't set up yet. Please enter your details manually.",
  );
}
