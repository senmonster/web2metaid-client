import { atom } from 'recoil';
import { recoilPersist } from 'recoil-persist';

const { persistAtom } = recoilPersist();

export const bindXModalOpenAtom = atom<boolean>({
  key: 'bindXModalOpenAtom',
  default: false,
  effects_UNSTABLE: [persistAtom],
});
export const bindTGModalOpenAtom = atom<boolean>({
  key: 'bindTGModalOpenAtom',
  default: false,
  effects_UNSTABLE: [persistAtom],
});
