import { CompleteProfileScreen } from '../../screens/CompleteProfileScreen';
import type { OnboardingStackParamList, StackRoutes } from '../types';

export const onboardingRoutes: StackRoutes<OnboardingStackParamList> = {
  CompleteProfile: { component: CompleteProfileScreen },
};
