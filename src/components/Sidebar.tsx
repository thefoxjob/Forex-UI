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
  const [pairs, setPairs] = React.useState<Set<string>>(new Set(localStorage.getItem('currencies')?.split(',') ?? ['JPYUSD']));
  const [currencies, setCurrencies] = React.useState<Record<string, API.Currency>>({});

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

          if (Array.isArray(data)) {
            setCurrencies(() => data.reduce((accumulator, currency) => {
              accumulator[`${ currency.from }${ currency.to }`] = currency;

              return accumulator;
            }, {} as Record<string, API.Currency>));
          }
        } catch (error) {
          if (error instanceof Error && error.name !== 'AbortError') {
            logger.error(error);
          }

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
    handleDialogClose: () => {
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

    localStorage.setItem('currencies', [...pairs.values()].join(','));

    controller.current = new AbortController();
    actions.stream(controller.current.signal);

    return () => {
      if (! controller.current?.signal.aborted) {
        controller.current?.abort();
      }
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

        { pairs.size > 0 && (
          <div className="overflow-y-scroll">
            { [...pairs.values()].map((code) => (
              <Transition
                appear
                show
                as="div"
                key={ code }
                enter="transition-opacity duration-500"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-500"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                className="relative group"
              >
                <div className={ currencies[code] ? '' : 'animate-pulse' }>
                  <button
                    type="button"
                    className="absolute right-3 -top-1 rounded-full border text-gray-500  border-gray-500 p-0 m-0 w-4 h-4 hidden items-center justify-center transition-colors hover:bg-zinc-800/50 hover:text-white hover:border-white group-hover:flex"
                    disabled={ ! currencies[code] }
                    onClick={ (e: React.SyntheticEvent) => events.handleRemoveButtonClick(e, currencies[code].from, currencies[code].to) }
                  >
                    <i className="fa-solid fa-xmark fa-2xs" />
                  </button>

                  <Link to={ `${ code.substring(0, 3) }/${ code.substring(3, 6) }` } className="flex flex-1 flex-row justify-between mx-4 my-2 px-5 py-4 rounded-md bg-zinc-800 transition-colors hover:bg-zinc-800/50">
                    <div>
                      <div className="font-black text-sm">
                        { code }
                        =X
                      </div>
                      <div className="mt-1 text-xs text-white/50">
                        { currencies[code] ? `${ currencies[code].from }/${ currencies[code].to }` : <div className="h-2 w-12 bg-zinc-700 rounded" /> }
                      </div>
                    </div>
                    <div className="font-black text-sm">
                      { currencies[code]?.price.toFixed(3) ?? <div className="h-3 w-12 bg-zinc-700 rounded" /> }
                    </div>
                  </Link>
                </div>
              </Transition>
            )) }
          </div>
        ) }

        { pairs.size === 0 && (
          <div className="flex flex-1 flex-col grow items-center justify-center">
            <h3 className="text-white font-bold">There are no watchlist items</h3>
            <div className="text-gray-500 text-sm mt-2 px-6 text-center tracking">
              Your watchlist is empty. Add a new currencies to build your watch list.
              To add currencies to the watchlist, tap the &quot;+&quot; button.
            </div>
          </div>
        ) }
      </div>

      <CurrencyDialog show={ show } onSubmit={ events.handleAddNewCurrency } onClose={ events.handleDialogClose } />
    </>
  );
}

export default Sidebar;
