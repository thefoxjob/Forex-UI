import React from 'react';
import { useParams } from 'react-router-dom';

import Rate from '../components/Rate';
import logger from '../utils/logger';
import type { API } from '../typings/api';


function Trading(): React.ReactElement {
  const controller = React.useRef<AbortController>();
  const { from, to } = useParams();
  const [series, setSeries] = React.useState<{ date: number; price: number; ask: number; bid: number }[]>([]);
  const [high, setHigh] = React.useState<number>(0.00);
  const [low, setLow] = React.useState<number>(0.00);

  const actions = {
    stream: async (signal: AbortSignal) => {
      const response = await fetch(`${ import.meta.env.VITE_ONE_FRAME_API_ENDPOINT }/streaming/rates?pair=${ from }${ to }`, {
        signal,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          token: import.meta.env.VITE_ONE_FRAME_API_TOKEN,
        },
      });

      if (! response.body) {
        return;
      }

      const reader = response.body.getReader();

      signal.addEventListener('abort', (event) => reader.cancel(event));

      // eslint-disable-next-line no-constant-condition
      while (true) {
        try {
          // eslint-disable-next-line no-await-in-loop
          const { done, value } = await reader.read();

          if (done) {
            return;
          }

          // eslint-disable-next-line no-await-in-loop
          const data = await new Response(value).json() as API.Currency[];

          if (data[0].price > high) {
            setHigh(parseFloat(data[0].price.toFixed(3)));
          }

          if (data[0].price < low) {
            setLow(parseFloat(data[0].price.toFixed(3)));
          }

          setSeries((previous) => [
            {
              date: new Date(data[0].time_stamp).getTime(),
              price: parseFloat(data[0].price.toFixed(3)),
              ask: parseFloat(data[0].ask.toFixed(3)),
              bid: parseFloat(data[0].bid.toFixed(3)),
            },
            ...previous.slice(0, 49),
          ]);
        } catch (error) {
          logger.error(error);

          return;
        }
      }
    },
  };

  React.useEffect(() => {
    if (controller.current) {
      controller.current.abort();
    }

    setSeries([]);
    controller.current = new AbortController();
    actions.stream(controller.current.signal);

    return () => {
      controller.current?.abort();
    };
  }, [from, to]);

  return (
    <div className="container mx-auto h-full px-6 py-8">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold">{ `${ from } to ${ to }` }</h1>

        <div className="ml-6"><Rate price={ series[0]?.price } high={ high } /></div>
      </div>

      <div className="max-h-screen py-4 mt-6">
        <div className="flex flex-1 flex-col overflow-y-scroll">
          <table className="text-sm">
            <thead className="font-thin text-gray-400">
              <tr>
                <th className="text-left w-20 py-2">ASK</th>
                <th className="text-left w-20 py-2">BID</th>
                <th className="text-left w-40 py-2">PRICE</th>
              </tr>
            </thead>

            <tbody>
              { series.map((data) => (
                <tr key={ data.date } className="cursor-pointer hover:bg-zinc-800/50">
                  <td className="text-red-500 mr-1">{ data.ask }</td>
                  <td className="text-green-500 mr-1">{ data.bid }</td>
                  <td className="text-gray-500 text-left ml-1">{ data.price }</td>
                </tr>
              )) }
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default Trading;
