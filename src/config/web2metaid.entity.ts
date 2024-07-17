import { EntitySchema } from '@metaid/metaid';

export const Web2MetaidSchema: EntitySchema = {
  name: 'web2metaid',
  nodeName: 'web2metaid',
  path: '/protcols/web2metaid',
  versions: [
    {
      version: 1,
      body: [
        {
          name: 'appName', // twitter
          type: 'string',
        },
        {
          name: 'handler', // 'metaid_twittedid'
          type: 'string',
        },
        {
          name: 'signature', // hash for metaid_twittedid
          type: 'string',
        },
      ],
    },
  ],
};
