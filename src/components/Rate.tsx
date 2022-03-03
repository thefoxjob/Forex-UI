import React from 'react';
import classnames from 'classnames';


type Props = {
  price?: number;
  high?: number;
}

function Rate(props: Props): React.ReactElement {
  const [status, setStatus] = React.useState<'DOWN' | 'UP' | false>(false);
  const price = React.useRef<number>(props.price ?? 0.0);

  const difference = props.price && props.high ? ((props.price - props.high) / ((props.price + props.high) / 2)).toFixed(2) : '0.00';

  React.useEffect(() => {
    if (props.price) {
      if (props.price < price.current) {
        setStatus('DOWN');
      } else if (props.price > price.current) {
        setStatus('UP');
      } else {
        setStatus(false);
      }
    } else {
      setStatus(false);
    }

    price.current = props.price ?? 0.0;
  }, [props.price]);

  return (
    <div
      className={ classnames('flex items-center text-sm', {
        'text-red-500': status === 'DOWN',
        'text-green-500': status === 'UP',
      }) }
    >
      { props.price ?? <span className="animate-pulse">0.000</span> }

      { status && <i className={ `ml-2 fa-2xs fa-solid fa-arrow-${ status.toLowerCase() }` } /> }

      { difference && (
        <span className="ml-4 text-white text-xs">
          { difference }
          %
        </span>
      ) }
    </div>
  );
}

Rate.defaultProps = {
  price: undefined,
  high: undefined,
};

export default Rate;
