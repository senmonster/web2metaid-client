import { environment } from './envrionments';
import { BtcNetwork, api } from './request';

// type MetaidService = {
//  };

export type MetaidItem = {
  number: number;
  name: string;
  nameId: string;
  address: string;
  avatar: string;
  avatarId: string;
  bio: string;
  bioId: string;
  soulbondToken: string;
  isInit: boolean;
  metaid: string;
  chainName: 'btc' | 'mvc';
  followCount: number;
  pdv: number;
  fdv: number;
};

export type Pin = {
  content: string;
  number: number;
  operation: string;
  height: number;
  id: string;
  type: string;
  path: string;
  pop: string;
  metaid: string;
};

export type PinDetail = {
  id: string;
  number: number;
  metaid: string;
  address: string;
  creator: string;
  initialOwner: string;
  output: string;
  outputValue: number;
  timestamp: number;
  genesisFee: number;
  genesisHeight: number;
  genesisTransaction: string;
  txInIndex: number;
  offset: number;
  location: string;
  operation: string;
  path: string;
  parentPath: string;
  originalPath: string;
  encryption: string;
  version: string;
  contentType: string;
  contentTypeDetect: string; // text/plain; charset=utf-8
  contentBody: any;
  contentLength: number;
  contentSummary: string;
  status: number;
  originalId: string;
  isTransfered: boolean;
  preview: string; // "https://man-test.metaid.io/pin/4988b001789b5dd76db60017ce85ccbb04a3f2aa825457aa948dc3c1e3b6e552i0";
  content: string; // "https://man-test.metaid.io/content/4988b001789b5dd76db60017ce85ccbb04a3f2aa825457aa948dc3c1e3b6e552i0";
  pop: string;
  popLv: number;
  chainName: string;
  dataValue: number;
};

type Count = {
  block: number;
  Pin: number;
  metaId: number;
  app: number;
};

type MetaidService = {
  getMetaidList: (params: { page: number; size: number }) => Promise<any>;
  // | {
  //     count: { block: number; Pin: number; metaId: number; app: number };
  //     list: MetaidItem[];
  //   }
  // | MetaidItem[]
  getPinList: (params: {
    page: number;
    size: number;
  }) => Promise<{ Pins: Pin[]; Count: Count; Active: string }>;
  getPinListByPath: (params: {
    page: number;
    limit: number;
    path: string;
  }) => Promise<{ list: PinDetail[]; total: number }>;
  getPinListByAddress: (params: {
    address: string;
    cursor: number;
    size: number;
    path?: string;
    addressType?: string;
    cnt?: boolean;
  }) => Promise<{ list: PinDetail[] | null; total: number }>;
  getBlockList: (params: { page: number; size: number }) => Promise<{
    msgMap: Record<number, Pin[]>;
    msgList: number[];
    Active: string;
  }>;
  getMempoolList: (params: { page: number; size: number }) => Promise<{
    Count: Count;
    Active: string;
    Pins: Pin[];
  }>;
  getPinDetail: (params: { id: string }) => Promise<PinDetail>;
  getMetaidInfo: (params: { metaId: string }) => Promise<MetaidItem>;
};

export const metaidService: MetaidService = {
  getMetaidList: (params) =>
    api.get(`${environment.base_man_url}/api/metaid/list`, { params }),
  getPinList: (params) =>
    api.get(`${environment.base_man_url}/api/pin/list`, { params }),
  getPinListByPath: (params) =>
    api.get(`${environment.base_man_url}/api/getAllPinByPath`, { params }),
  getPinDetail: (params) =>
    api.get(`${environment.base_man_url}/api/pin/${params.id}`),
  getMetaidInfo: (params) =>
    api.get(`${environment.base_man_url}/api/info/metaid/${params.metaId}`),
  getBlockList: (params) =>
    api.get(`${environment.base_man_url}/api/block/list`, { params }),
  getMempoolList: (params) =>
    api.get(`${environment.base_man_url}/api/mempool/list`, { params }),
  getPinListByAddress: ({
    address,
    cursor,
    size,
    path,
    addressType = 'owner',
    cnt = true,
  }) => {
    const url = `${environment.base_man_url}/api/address/pin/list/${addressType}/${address}`;

    return api.get(url, { params: { cnt, cursor, size, path } });
  },
  //   getNodeList : (params) => api.get('/api/node/list', { params })
};

export type FeeRateApi = {
  fastestFee: number;
  halfHourFee: number;
  hourFee: number;
  economyFee: number;
  minimumFee: number;
};

export async function fetchFeeRate({
  netWork,
}: {
  netWork?: BtcNetwork;
}): Promise<FeeRateApi> {
  const response = await fetch(
    `https://mempool.space/${
      netWork === 'mainnet' ? '' : 'testnet/'
    }api/v1/fees/recommended`,
    {
      method: 'get',
    }
  );
  return response.json();
}
