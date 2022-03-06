import React from 'react';
import { Outlet } from 'react-router-dom';

import Sidebar from '../components/Sidebar';


function Dashboard(): React.ReactElement {
  return (
    <div className="flex flex-1">
      <aside className="w-96 fixed h-screen">
        <Sidebar />
      </aside>
      <main className="ml-96 w-full h-screen">
        <Outlet />
      </main>
    </div>
  );
}

export default Dashboard;
