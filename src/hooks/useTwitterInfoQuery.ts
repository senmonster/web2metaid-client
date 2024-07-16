import { useEffect, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
axios.defaults.withCredentials = true;

export type User = {
  id: string;
  name: string;
  username: string;
  type: 'local' | 'twitter';
};

export function useTwitterInfoQuery() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<User | null>(null);
  useEffect(() => {
    setLoading(true);
    axios
      .get<any, AxiosResponse<User>>(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/web2metaid/me`,
        {
          withCredentials: true,
        }
      )
      .then((v) => {
        if (v.data) setData(v.data);
      })
      .catch((err) => {
        console.log('error', err);
        setError('Not Authenticated');
      })
      .finally(() => setLoading(false));
  }, []);

  return { error, data, loading };
}
