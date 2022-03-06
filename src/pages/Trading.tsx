import React from 'react';
import day from 'dayjs';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'react-hot-toast';
import { useParams } from 'react-router-dom';

import Rate from '../components/Rate';
import logger from '../utils/logger';
import type { API } from '../typings/api';


function Trading(): React.ReactElement {
  const controller = React.useRef<AbortController>();
  const { from, to } = useParams();
  const [series, setSeries] = React.useState<{ date: number; price: number; ask: number; bid: number }[]>([]);
  const [high, setHigh] = React.useState<number>(- Infinity);
  const [low, setLow] = React.useState<number>(Infinity);

  const ChartTooltip = React.useCallback(({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="py-4 px-6 shadow bg-white rounded-md text-black">
          <div className="font-bold">{ payload[0].payload.price }</div>
          <div>{ new Date(payload[0].payload.date).toLocaleString() }</div>
        </div>
      );
    }

    return null;
  }, []);

  const actions = {
    stream: async (signal: AbortSignal) => {
      try {
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
              ...previous.slice(0, 29),
            ]);
          } catch (error: unknown) {
            if (error instanceof Error && error.name !== 'AbortError') {
              logger.error(error);
              toast('Error while reading data from the server. Please try again later.');
            }

            return;
          }
        }
      } catch (error) {
        logger.error(error);
        toast('Unable to connect to server. Please try again later.');
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
      <div className="flex flex-1 flex-row overflow-y-scroll">
        <div className="flex flex-col grow h-screen px-6">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">{ `${ from } to ${ to }` }</h1>

            <div className="ml-6 w-40"><Rate price={ series[0]?.price } high={ high } /></div>

            <div className="flex justify-between w-28 text-xs">
              <div className="font-bold">High</div>
              <div className="text-right text-gray-500">
                { high !== - Infinity ? high : <div className="animate-pulse h-2 w-8 bg-zinc-700/40 rounded my-1" /> }
              </div>
            </div>

            <div className="flex justify-between w-28 ml-4 text-xs">
              <div className="font-bold">Low</div>
              <div className="text-right text-gray-500">
                { low !== Infinity ? low : <div className="animate-pulse h-2 w-8 bg-zinc-700/40 rounded my-1" /> }
              </div>
            </div>
          </div>

          <ResponsiveContainer className="mt-12" height="100%" maxHeight={ 500 } width="100%">
            <AreaChart
              data={ series }
              margin={{
                top: 5,
                right: 30,
                left: 0,
                bottom: 10,
              }}
              height={ 500 }
            >
              <defs>
                <linearGradient id="chart-color" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#71cc80" stopOpacity={ 0.3 } />
                  <stop offset="95%" stopColor="#71cc80" stopOpacity={ 0.01 } />
                </linearGradient>
              </defs>

              <XAxis
                tick={{ fill: '#ffffff', fontSize: 12 }}
                dataKey="date"
                domain={ ['dataMin - 5', 'dataMax + 5'] }
                height={ 50 }
                minTickGap={ 10 }
                tickFormatter={ (time) => day(time).format('HH:mm:ss') }
                tickMargin={ 10 }
                scale="time"
                type="number"
              />

              <YAxis
                tick={{ fill: '#ffffff', fontSize: 12 }}
              />

              <Tooltip
                content={ ChartTooltip }
              />

              <CartesianGrid vertical={ false } strokeOpacity={ 0.2 } strokeDasharray="2 2" />

              <Area
                dot={ false }
                type="natural"
                dataKey="price"
                stroke="#71cc80"
                fillOpacity={ 1 }
                fill="url(#chart-color)"
                isAnimationActive={ false }
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div>
          <table className="w-60 text-sm">
            <thead className="font-thin text-gray-400">
              <tr>
                <th className="text-left w-20 py-2">ASK</th>
                <th className="text-left w-20 py-2">BID</th>
                <th className="text-left w-20 py-2">PRICE</th>
              </tr>
            </thead>

            <tbody>
              { series.length === 0 && [...Array(20)].map((key, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <tr key={ `placeholder:${ index }` }>
                  <td className="text-center">
                    <div className="animate-pulse h-4 w-3/4 bg-zinc-700/20 rounded my-1" />
                  </td>
                  <td className="text-center">
                    <div className="animate-pulse h-4 w-3/4 bg-zinc-700/20 rounded my-1" />
                  </td>
                  <td className="text-center">
                    <div className="animate-pulse h-4 w-3/4 bg-zinc-700/20 rounded my-1" />
                  </td>
                </tr>
              )) }

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
