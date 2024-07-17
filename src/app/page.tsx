'use client';
import Header from '@/components/custom/header';
import { Button } from '@/components/ui/button';
import { useTwitterInfoQuery } from '@/hooks/useTwitterInfoQuery';
import { User, walletRestoreParamsAtom } from '@/store/account';
import axios from 'axios';
import Image from 'next/image';
import { isNil } from 'ramda';
import { useRecoilState, useRecoilValue } from 'recoil';
import { MetaletWalletForBtc, btcConnect, loadBtc } from '@metaid/metaid'; // loadBtc form btc chain
import { Web2MetaidSchema } from '@/config/web2metaid.entity';
import { LoginButton as TGLoginBtn } from '@telegram-auth/react';
import { useTelegramInfoQuery } from '@/hooks/useTelegramInfoQuery';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';

export default function Home() {
  const [xOpen, setXOpen] = useState(false);
  const [tgOpen, setTgOpen] = useState(false);
  const { data: twitterUser } = useTwitterInfoQuery();
  const { data: TelegramUser } = useTelegramInfoQuery();

  const walletParams = useRecoilValue(walletRestoreParamsAtom);

  const confirmConnect = () => {
    if (isNil(walletParams?.address)) {
      alert('Please connect your wallet first');
      return;
    }
  };
  // twitter oauth Url constructor
  function getTwitterOauthUrl() {
    const rootUrl = 'https://twitter.com/i/oauth2/authorize';
    const options = {
      redirect_uri: `${process.env.NEXT_PUBLIC_SERVER_URI}/oauth/twitter`,
      client_id: process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID!,
      state: 'state',
      response_type: 'code',
      code_challenge: 'y_SfRG4BmOES02uqWeIkIgLQAlTBggyf_G7uKT51ku8',
      code_challenge_method: 'S256',
      scope: ['users.read', 'tweet.read', 'follows.read', 'follows.write'].join(
        ' '
      ), // add/remove scopes as needed
    };
    const qs = new URLSearchParams(options).toString();
    return `${rootUrl}?${qs}`;
  }

  const hanldeLoginWithX = async () => {
    // TODO: bind twitter, weibo, qq, wechat
    try {
      // window.location.href = await getTwitterOauthUrl();
      window.location.href = 'https://xngc7bmn-3000.asse.devtunnels.ms/';

      setTimeout(() => {
        setXOpen(true);
      }, 5000);

      // const response =`` await axios.get('http://localhost:5000/auth/twitter');
      // window.location.href = response.data.url;
    } catch (error) {
      console.error(error);
    }
  };

  const handleBindMetaid = async (user: User) => {
    confirmConnect();
    const _wallet = MetaletWalletForBtc.restore({
      ...walletParams!,
      internal: window.metaidwallet,
    });
    const btcConnector = await btcConnect({
      wallet: _wallet,
      network: 'testnet',
    });

    const web2metaidEntity = await loadBtc(Web2MetaidSchema, {
      connector: btcConnector,
    });

    const signature = await window.metaidwallet.btc.signMessage(
      `${btcConnector.metaid}_${user?.id}`
    );

    // todo: verify signature

    if (!isNil(user)) {
      const body = {
        appName: user.type,
        handler: user,
        signature,
      };
      try {
        const createRes = await web2metaidEntity!.create({
          dataArray: [
            {
              body: JSON.stringify(body),
              contentType: 'text/plain;utf-8',
              flag: 'testid',
            },
          ],
          options: {
            noBroadcast: 'no',
            feeRate: 8,
          },
        });
        if (!isNil(createRes?.revealTxIds[0])) {
          alert('bind success');
        }
      } catch (error) {
        console.log('error', error);
        const errorMessage = (error as any)?.message ?? error;
        const toastMessage = errorMessage?.includes(
          'Cannot read properties of undefined'
        )
          ? 'User Canceled'
          : errorMessage;
        alert('bind failed');
      }
    }
  };

  return (
    <div className='container relative min-h-screen'>
      <Header />

      <div className='space-x-4 absolute left-[40%] top-1/3 h-full'>
        <Dialog open={xOpen} onOpenChange={setXOpen}>
          <DialogTrigger asChild>
            <Button variant='outline'>Bind Twitter</Button>
          </DialogTrigger>
          <DialogContent className='sm:!max-w-[800px]'>
            <DialogHeader>
              <DialogTitle>Bind Twitter</DialogTitle>
            </DialogHeader>
            <div className='flex flex-col space-y-12 items-center'>
              <div className='flex items-center gap-2'>
                <div>{`First, You need to connect with Twitter ==>`}</div>
                <Button
                  className='bg-gray-500  rounded-sm text-center'
                  onClick={hanldeLoginWithX}
                >
                  Go
                </Button>
              </div>
              {twitterUser && <div>{`Login with ${twitterUser.name}`}</div>}
              <div className='flex items-center gap-2'>
                <div>{`Then you can perform binding operations. ==>`}</div>
                <Button
                  className='bg-gray-500 rounded-sm text-center'
                  onClick={async () =>
                    twitterUser && handleBindMetaid(twitterUser)
                  }
                >
                  Go
                </Button>
              </div>
            </div>
            <DialogFooter className='sm:justify-start'>
              <DialogClose asChild>
                <Button type='button' variant='secondary'>
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={tgOpen} onOpenChange={setTgOpen}>
          <DialogTrigger asChild>
            <Button variant='outline'>Bind Telegram</Button>
          </DialogTrigger>
          <DialogContent className='sm:!max-w-[800px]'>
            <DialogHeader>
              <DialogTitle>Bind Telegram</DialogTitle>
            </DialogHeader>
            <div className='relative flex flex-col gap-2 space-y-6 items-center'>
              <div className='flex flex-col items-center'>
                <div>{`First, You need to connect with Telegram`}</div>
                <div>↓</div>
                <TGLoginBtn
                  botUsername={process.env.NEXT_PUBLIC_BOT_USERNAME!}
                  authCallbackUrl={`${process.env.NEXT_PUBLIC_SERVER_URI}/oauth/telegram`}
                  onAuthCallback={() => {
                    setTimeout(() => {
                      setTgOpen(true);
                    }, 2000);
                  }}
                  buttonSize='medium' // "large" | "medium" | "small"
                  cornerRadius={5} // 0 - 20
                  showAvatar={false} // true | false
                  lang='en'
                />
              </div>
              <div className='flex flex-col  items-center'>
                <div>{`Then you can perform binding operations.`}</div>
                <div>↓</div>
                <Button
                  className='bg-gray-500 rounded-sm text-center'
                  onClick={async () =>
                    TelegramUser && handleBindMetaid(TelegramUser)
                  }
                >
                  Go
                </Button>
              </div>
            </div>
            <DialogFooter className='sm:justify-start'>
              <DialogClose asChild>
                <Button type='button' variant='secondary'>
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
