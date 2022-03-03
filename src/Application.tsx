import React from 'react';
import loadable from '@loadable/component';
import { Route, Routes } from 'react-router-dom';

import Loading from './components/Loading';


const Dashboard = loadable(() => import('./pages/Dashboard'), { fallback: <Loading /> });
const Trading = loadable(() => import('./pages/Trading'), { fallback: <Loading /> });

function Application() {
  return (
    <Routes>
      <Route path="/" element={ <Dashboard /> }>
        <Route path=":from/:to" element={ <Trading /> } />
      </Route>
    </Routes>
  );
}

export default Application;
