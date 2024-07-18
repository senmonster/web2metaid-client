import { IMetaletWalletForBtc } from '@metaid/metaid';
import { atom } from 'recoil';
import { recoilPersist } from 'recoil-persist';

const { persistAtom } = recoilPersist();

export type User = {
  username: string;
  name: string;
  type: 'telegram' | 'twitter';
  id: string;
};

export const walletAtom = atom<IMetaletWalletForBtc | null>({
  key: 'walletAtom',
  default: null,
  // effects_UNSTABLE: [persistAtom],
});

export const walletRestoreParamsAtom = atom<{
  address: string;
  pub: string;
} | null>({
  key: 'walletRestoreParamsAtom',
  default: null,
  effects_UNSTABLE: [persistAtom],
});

export const telegramUserAtom = atom<User | null>({
  key: 'telegramUserAtom',
  default: null,
});
export const twitterUserAtom = atom<User | null>({
  key: 'tgUserAtom',
  default: null,
});
