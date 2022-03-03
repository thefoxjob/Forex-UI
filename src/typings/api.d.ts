import { CurrencyCode } from '../constants';


export namespace API {
  export interface Currency {
    from: CurrencyCode;
    to: CurrencyCode;
    bid: number;
    ask: number;
    price: number;
    time_stamp: string;
  }
}
