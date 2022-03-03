import React, { Fragment } from 'react';
import classnames from 'classnames';
import { Listbox, Transition } from '@headlessui/react';

import { CurrencyCode } from '../constants';


type Props = {
  onChange: (value: CurrencyCode | undefined) => void;
  value?: CurrencyCode;
}

function CurrencySelector(props: Props): React.ReactElement {
  return (
    <Listbox value={ props.value } onChange={ props.onChange }>
      <div className="relative">
        <Listbox.Button className="relative w-40 py-2 pl-3 pr-10 text-left text-black bg-white rounded-lg shadow-md cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-orange-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm">
          <div className="flex flex-1 items-center">
            { props.value && (
              <>
                <span className={ `mr-4 currency-flag currency-flag-${ props.value.toLowerCase() }` } />
                <span className="block truncate">{ props.value }</span>
              </>
            ) }

            { ! props.value && <span className="block truncate text-gray-400">Select a Currency</span> }
          </div>
          <span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
            <i className="fa-solid fa-chevron-down" />
          </span>
        </Listbox.Button>

        <Transition
          as={ Fragment }
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute w-40 py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            { Object.values(CurrencyCode).map((code) => (
              <Listbox.Option
                key={ code }
                className={ ({ active }) => classnames('cursor-default select-none relative py-2 pl-4 pr-4', active ? 'text-amber-900 bg-amber-100' : 'text-gray-900') }
                value={ code }
              >
                <div className="flex flex-1">
                  <div className={ `mr-4 currency-flag currency-flag-${ code.toLowerCase() }` } />
                  <span className={ classnames('block truncate', props.value === code ? 'font-medium' : 'font-normal') }>
                    { code }
                  </span>
                </div>
              </Listbox.Option>
            )) }
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}

CurrencySelector.defaultProps = {
  value: undefined,
};

export default CurrencySelector;
