import { OtpScreen } from '../../screens/OtpScreen';
import { RegisterScreen } from '../../screens/RegisterScreen';
import { WelcomeScreen } from '../../screens/WelcomeScreen';
import type { AuthStackParamList, StackRoutes } from '../types';

export const authRoutes: StackRoutes<AuthStackParamList> = {
  Welcome: { component: WelcomeScreen },
  Register: { component: RegisterScreen },
  Otp: { component: OtpScreen },
};
