/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import WishForm from './components/WishForm';
import WishFeed from './components/WishFeed';
import Gallery from './components/Gallery';
import Registry from './components/Registry';
import Schedule from './components/Schedule';
import TableSeating from './components/TableSeating';
import Footer from './components/Footer';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className={`${activeTab === 'home' ? '' : 'pt-32'} pb-24`}>
        {activeTab === 'home' && <Home />}

        {activeTab === 'wishes' && (
          <div className="max-w-container-max mx-auto px-margin-page">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
              <WishForm />
              <WishFeed />
            </div>
          </div>
        )}
        
        {activeTab === 'gallery' && <Gallery />}
        
        {activeTab === 'registry' && <Registry />}
        
        {activeTab === 'schedule' && <Schedule />}
        
        {activeTab === 'table-seating' && <TableSeating />}
      </main>

      <Footer />
    </div>
  );
}
