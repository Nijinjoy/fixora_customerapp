export type GoogleProfile = {
  name: string;
  email: string;
  photo?: string;
};

/**
 * Reads the user's name and email from their Google account. Used only to
 * pre-fill profile details — the account itself is created with phone + OTP.
 *
 * TODO: implement with @react-native-google-signin/google-signin once the
 * Google Cloud OAuth client IDs (Android SHA-1, iOS client ID) are set up.
 */
export async function getGoogleProfile(): Promise<GoogleProfile> {
  throw new Error(
    "Google sign-in isn't set up yet. Please enter your details manually.",
  );
}
