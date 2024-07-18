'use client';
import Header from '@/components/custom/header';
import { Button } from '@/components/ui/button';
import { useTwitterInfoQuery } from '@/hooks/useTwitterInfoQuery';
import { User, walletRestoreParamsAtom } from '@/store/account';

import { isEmpty, isNil } from 'ramda';
import { useRecoilState, useRecoilValue } from 'recoil';
import { MetaletWalletForBtc, btcConnect, loadBtc } from '@metaid/metaid'; // loadBtc form btc chain
import { Web2MetaidSchema } from '@/config/web2metaid.entity';
import { useTelegramInfoQuery } from '@/hooks/useTelegramInfoQuery';
import { Skeleton } from '@/components/ui/skeleton';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { bindTGModalOpenAtom, bindXModalOpenAtom } from '@/store/ue';
import { useEffect, useState } from 'react';
import { TGLoginButton } from '@/components/custom/TelegramLogin';
import { environment } from '@/utils/envrionments';
import { metaidService } from '@/utils/api';
import { useQuery } from '@tanstack/react-query';

export default function Home() {
  const walletParams = useRecoilValue(walletRestoreParamsAtom);

  const [tgWidgetElem, setTgWidgetElem] = useState<HTMLElement | null>(null);

  const [xOpen, setXOpen] = useRecoilState(bindXModalOpenAtom);
  const [tgOpen, setTgOpen] = useRecoilState(bindTGModalOpenAtom);
  const { data: twitterUser } = useTwitterInfoQuery();
  const { data: TelegramUser } = useTelegramInfoQuery();

  const { data: BindData } = useQuery({
    queryKey: ['web2metaid', 'pin'],
    enabled: !isEmpty(walletParams?.address ?? ''),
    queryFn: () =>
      metaidService.getPinListByAddress({
        addressType: 'owner',
        address: walletParams?.address ?? '',
        cursor: 0,
        size: 100,
        path: '/protcols/web2metaid',
      }),
  });

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
      window.location.href = await getTwitterOauthUrl();
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
      network: environment.network!,
    });

    const web2metaidEntity = await loadBtc(Web2MetaidSchema, {
      connector: btcConnector,
    });

    const signature = await window.metaidwallet.btc.signMessage(
      `${btcConnector.metaid}_${user?.id}`
    );

    if (!isNil(user)) {
      // todo: verify signature
      const bindHistoryIndex = (BindData?.list ?? []).findIndex((d) => {
        let summary = d?.contentSummary ?? '';
        const isSummaryJson = summary.startsWith('{') && summary.endsWith('}');
        const parseSummary = isSummaryJson ? JSON.parse(summary) : {};
        if (
          parseSummary?.appName === user.type &&
          parseSummary?.signature === signature
        ) {
          return true;
        }
      });

      if (bindHistoryIndex !== -1) {
        alert(`You have already binded MetaID with your ${user.type} account`);
        return;
      }
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
              flag: environment.flag,
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
        alert('bind failed:' + toastMessage);
      }
    }
  };

  useEffect(() => {
    if (tgOpen) {
      setTimeout(() => {
        setTgWidgetElem(
          document.getElementById('telegram-login-web2metaid_bot')
        );
      }, 1800);
    } else {
      setTgWidgetElem(null);
    }
  }, [tgOpen]);

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
            <div className='relative flex flex-col gap-2 space-y-10 items-center'>
              <div className='flex flex-col items-center relative'>
                <div>{`First, You need to connect with Telegram`}</div>
                <div>↓</div>
                {isNil(tgWidgetElem) && (
                  <Skeleton className='w-[171px] h-[28px] rounded-md absolute top-[50px]' />
                )}
                <div className='absolute  top-[50px]'>
                  <TGLoginButton
                    botUsername={process.env.NEXT_PUBLIC_BOT_USERNAME!}
                    authCallbackUrl={`${process.env.NEXT_PUBLIC_SERVER_URI}/oauth/telegram`}
                    buttonSize='medium' // "large" | "medium" | "small"
                    cornerRadius={5} // 0 - 20
                    showAvatar={false} // true | false
                    lang='en'
                  />
                </div>
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
