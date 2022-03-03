import React from 'react';
import qs from 'qs';
import { Link } from 'react-router-dom';
import { Transition } from '@headlessui/react';

import CurrencyDialog from './CurrencyDialog';
import logger from '../utils/logger';
import { CurrencyCode } from '../constants';
import type { API } from '../typings/api';


function Sidebar(): React.ReactElement {
  const controller = React.useRef<AbortController>();
  const [show, setShow] = React.useState(false);
  const [pairs, setPairs] = React.useState<Set<string>>(new Set(['JPYUSD']));
  const [currencies, setCurrencies] = React.useState<API.Currency[]>([]);

  const actions = {
    stream: async (signal: AbortSignal) => {
      const response = await fetch(`${ import.meta.env.VITE_ONE_FRAME_API_ENDPOINT }/streaming/rates?${ qs.stringify({ pair: [...pairs.values()] }, { arrayFormat: 'repeat' }) }`, {
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

          setCurrencies(data);
        } catch (error) {
          logger.error(error);

          return;
        }
      }
    },
  };

  const events = {
    handleAddButtonClick: (e: React.SyntheticEvent) => {
      e.preventDefault();
      setShow((previous) => ! previous);
    },
    handleAddNewCurrency: (from: CurrencyCode, to: CurrencyCode) => {
      setPairs((previous) => {
        const next = new Set(previous);

        next.add(`${ from }${ to }`);

        return next;
      });

      setShow(false);
    },
    handleRemoveButtonClick: (e: React.SyntheticEvent, from: CurrencyCode, to: CurrencyCode) => {
      e.preventDefault();

      setPairs((previous) => {
        const next = new Set(previous);

        next.delete(`${ from }${ to }`);

        return next;
      });
    },
  };

  React.useEffect(() => {
    if (controller.current) {
      controller.current.abort();
    }

    controller.current = new AbortController();
    actions.stream(controller.current.signal);

    return () => {
      controller.current?.abort();
    };
  }, [pairs]);

  return (
    <>
      <div className="flex flex-1 h-screen flex-col border-r border-r-zinc-800">
        <div className="flex justify-end m-2">
          <button type="button" className="rounded-md w-10 h-10 transition-colors hover:bg-black/40" onClick={ events.handleAddButtonClick }>
            <i className="fa-solid fa-plus" />
          </button>
        </div>

        <div className="overflow-y-scroll">
          { currencies.filter((currency) => pairs.has(`${ currency.from }${ currency.to }`)).map((currency) => (
            <Transition
              appear
              show
              as="div"
              key={ `${ currency.from }/${ currency.to }` }
              enter="transition-opacity duration-500"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity duration-500"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              className="relative group"
            >
              <button
                type="button"
                className="absolute right-3 -top-1 rounded-full border text-gray-500  border-gray-500 p-0 m-0 w-4 h-4 hidden items-center justify-center transition-colors hover:bg-zinc-800/50 hover:text-white hover:border-white group-hover:flex"
                onClick={ (e: React.SyntheticEvent) => events.handleRemoveButtonClick(e, currency.from, currency.to) }
              >
                <i className="fa-solid fa-xmark fa-2xs" />
              </button>

              <Link to={ `${ currency.from }/${ currency.to }` } className="flex flex-1 flex-row justify-between mx-4 my-2 px-5 py-4 rounded-md bg-zinc-800 transition-colors hover:bg-zinc-800/50">
                <div>
                  <div className="font-black text-sm">
                    { currency.from }
                    { currency.to }
                    =X
                  </div>
                  <div className="mt-1 text-xs text-white/50">
                    { currency.from }
                    /
                    { currency.to }
                  </div>
                </div>
                <div className="font-black text-sm">
                  { currency.price.toFixed(3) }
                </div>
              </Link>
            </Transition>
          )) }
        </div>
      </div>

      <CurrencyDialog show={ show } onSubmit={ events.handleAddNewCurrency } />
    </>
  );
}

export default Sidebar;
