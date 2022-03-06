import React, { Fragment } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Dialog, Transition } from '@headlessui/react';

import CurrencySelector from './CurrencySelector';
import { CurrencyCode } from '../constants';


type Props = {
  show?: boolean;
  onClose?: (value: boolean) => void;
  onSubmit: (from: CurrencyCode, to: CurrencyCode) => void;
}

type FormValues = {
  from: CurrencyCode;
  to: CurrencyCode;
}

function CurrencyDialog(props: Props) {
  const form = useForm<FormValues>();

  const events = {
    handleDialogClose: (value: boolean) => {
      if (props.onClose) {
        props.onClose(value);
      }
    },
    handleFormSubmit: (values: FormValues) => {
      if (values.from && values.to) {
        props.onSubmit(values.from, values.to);
      }
    },
  };

  return (
    <Transition
      appear
      show={ props.show }
      as={ Fragment }
      enter="transition-opacity duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-300"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <Dialog open onClose={ events.handleDialogClose } className="fixed inset-0 z-10 overflow-y-auto">
        <div className="min-h-screen px-4 text-center">
          <Dialog.Overlay className="fixed inset-0 backdrop-blur-md" />

          <div className="flex flex-1 min-h-screen min-w-screen justify-center items-center">
            <div className="inline-block p-6 my-8 align-middle transition-all transform text-white w-full max-w-md">
              <Dialog.Title as="h3" className="text-4xl font-thin">
                Add New Currency
              </Dialog.Title>
              <div className="mt-4">
                <form onSubmit={ form.handleSubmit(events.handleFormSubmit) }>
                  <div className="flex flex-1 flex-row items-center justify-center">
                    <div className="mx-2">
                      <Controller
                        name="from"
                        control={ form.control }
                        rules={{ required: true }}
                        render={ ({ field }) => (
                          <CurrencySelector value={ field.value } onChange={ field.onChange } placeholder="From" />
                        ) }
                      />
                    </div>

                    <div className="mx-2">
                      <Controller
                        name="to"
                        control={ form.control }
                        rules={{ required: true }}
                        render={ ({ field }) => (
                          <CurrencySelector value={ field.value } onChange={ field.onChange } placeholder="To" />
                        ) }
                      />
                    </div>

                    <button type="submit" className="rounded-md px-4 py-2 transition-colors hover:bg-zinc-600">
                      <i className="fa-solid fa-plus" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

CurrencyDialog.defaultProps = {
  show: false,
  onClose: undefined,
};

export default CurrencyDialog;
