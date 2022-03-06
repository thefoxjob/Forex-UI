import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import './index.css';
import Application from './Application';


ReactDOM.render(
  <BrowserRouter>
    <Toaster position="bottom-center" />
    <Application />
  </BrowserRouter>,
  document.getElementById('root'),
);
