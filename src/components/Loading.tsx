import React from 'react';
import { HashLoader } from 'react-spinners';
import { Transition } from '@headlessui/react';


type Props = {
  show?: boolean;
}

function Loading(props: Props) {
  return (
    <Transition
      appear
      as="div"
      show={ props.show }
      leave="transition-opacity duration-300"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      className="fixed top-0 bottom-0 left-0 right-0 flex flex-1 items-center justify-center backdrop-blur-sm bg-white/1 z-20"
    >
      <HashLoader color="#ffffff" />
    </Transition>
  );
}

Loading.defaultProps = {
  show: false,
};

export default Loading;
