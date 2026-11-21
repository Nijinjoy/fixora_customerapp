import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type UserProfile = {
  name: string;
  email?: string;
  photo?: string;
};

export type SessionStatus = 'signedOut' | 'needsProfile' | 'signedIn';

type SessionState = {
  phone: string | null;
  profile: UserProfile | null;
  hydrated: boolean;
  permissionsPrompted: boolean;
  verifyPhone: (phone: string) => void;
  completeProfile: (profile: UserProfile) => void;
  signOut: () => void;
  markPermissionsPrompted: () => void;
};

export const useSessionStore = create<SessionState>()(
  persist(
    set => ({
      phone: null,
      profile: null,
      hydrated: false,
      permissionsPrompted: false,
      verifyPhone: phone => set({ phone, profile: null }),
      completeProfile: profile => set({ profile }),
      signOut: () => set({ phone: null, profile: null }),
      markPermissionsPrompted: () => set({ permissionsPrompted: true }),
    }),
    {
      name: 'fixora-session',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ phone, profile, permissionsPrompted }) => ({
        phone,
        profile,
        permissionsPrompted,
      }),
      onRehydrateStorage: () => () => {
        useSessionStore.setState({ hydrated: true });
      },
    },
  ),
);

export const selectSessionStatus = ({
  phone,
  profile,
}: SessionState): SessionStatus =>
  !phone ? 'signedOut' : !profile ? 'needsProfile' : 'signedIn';

export const useSessionStatus = () => useSessionStore(selectSessionStatus);
