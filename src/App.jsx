import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import InvestmentPlans from './pages/InvestmentPlans';
import Users from './pages/Users';
import Transactions from './pages/Transactions';
import NewsMedia from './pages/NewsMedia';
import Settings from './pages/Settings';
import PaymentSettings from './pages/PaymentSettings';
import Ranks from './pages/Ranks';
import Referrals from './pages/Referrals';
import SupportTickets from './pages/SupportTickets';
import SupportChannels from './pages/SupportChannels';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/investment-plans" element={<InvestmentPlans />} />
          <Route path="/users" element={<Users />} />
          <Route path="/ranks" element={<Ranks />} />
          <Route path="/referrals" element={<Referrals />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/support-tickets" element={<SupportTickets />} />
          <Route path="/support-channels" element={<SupportChannels />} />
          <Route path="/news-media" element={<NewsMedia />} />
          <Route path="/payment-settings" element={<PaymentSettings />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
