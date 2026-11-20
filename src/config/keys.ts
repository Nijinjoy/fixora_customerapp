// Keys are read from the git-ignored .env file (see .env.example).
import { GOOGLE_MAPS_API_KEY as MAPS_KEY } from '@env';

export const GOOGLE_MAPS_API_KEY = MAPS_KEY ?? '';
