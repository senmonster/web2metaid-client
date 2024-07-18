import { BtcNetwork } from './request';

// add global envrc variables
type Flag = 'metaid' | 'testid';

type Environment = {
  network: BtcNetwork;
  base_man_url: string;
  flag: Flag;
};

export const environment: Environment = {
  network: process.env.NEXT_PUBLIC_NETWORK! as BtcNetwork,
  base_man_url: process.env.NEXT_PUBLIC_BASE_MAN_URL!,
  flag: process.env.NEXT_PUBLIC_FLAG! as Flag,
};
