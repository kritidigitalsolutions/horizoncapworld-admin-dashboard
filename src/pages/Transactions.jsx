import React, { useState, useEffect } from 'react';
import {
  RiDownloadLine, RiCalendarLine, RiEyeLine, RiArrowUpCircleLine,
  RiArrowDownCircleLine, RiFlashlightLine, RiGiftLine, RiGlobalLine,
  RiCloseLine, RiPrinterLine, RiTimeLine, RiDeleteBinLine,
  RiFileExcelLine, RiAlertLine, RiCheckLine
} from 'react-icons/ri';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import KPICard from '../components/ui/KPICard';
import TabsBar from '../components/ui/TabsBar';
import SearchBar from '../components/ui/SearchBar';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import PageHeader from '../components/ui/PageHeader';
import { transactions as initialTransactions } from '../data/mockData';

export default function Transactions() {
  const [loading, setLoading] = useState(true);
  const [txnList, setTxnList] = useState(initialTransactions);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [txnToDelete, setTxnToDelete] = useState(null);
  const [clearAllModalOpen, setClearAllModalOpen] = useState(false);
  const [dateRangeModalOpen, setDateRangeModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Date filter state
  const [datePreset, setDatePreset] = useState('all'); // all, today, last7, thisMonth, custom
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search, datePreset, customStartDate, customEndDate]);

  const statusVariant = (status) => {
    if (status === 'Approved') return 'success';
    if (status === 'Pending') return 'warning';
    return 'danger';
  };

  const typeIcon = (type) => {
    if (type === 'Deposit') {
      return <RiArrowDownCircleLine className="text-emerald-500 flex-shrink-0" size={16} />;
    }
    if (type === 'Withdrawal') {
      return <RiArrowUpCircleLine className="text-amber-500 flex-shrink-0" size={16} />;
    }
    if (type === 'ROI Return') {
      return <RiFlashlightLine className="text-gold-500 flex-shrink-0" size={16} />;
    }
    return <RiGiftLine className="text-blue-500 flex-shrink-0" size={16} />;
  };

  // Delete Individual Transaction
  const handleDeleteTxn = () => {
    if (!txnToDelete) return;
    setTxnList(txnList.filter(t => t.id !== txnToDelete.id));
    if (selectedTxn?.id === txnToDelete.id) {
      setSelectedTxn(null);
    }
    setTxnToDelete(null);
  };

  // Clear All Transactions
  const handleClearAll = () => {
    setTxnList([]);
    setSelectedTxn(null);
    setClearAllModalOpen(false);
  };

  // Export CSV Functionality
  const handleExportCSV = () => {
    if (filtered.length === 0) return;
    const headers = ['TXN ID', 'Investor', 'User ID', 'Country', 'Type', 'Amount', 'Gateway', 'Date', 'Time', 'Status', 'Reference No'];
    const rows = filtered.map(t => [
      t.id,
      `"${t.user}"`,
      t.userCustomId || '',
      `"${t.country || ''}"`,
      t.type,
      `"${t.amount}"`,
      `"${t.gateway || ''}"`,
      t.date,
      t.time || '',
      t.status,
      t.referenceNo || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `horizon_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Date Filtering Logic
  const filtered = txnList.filter(txn => {
    const q = search.trim().toLowerCase();
    const matchTab = activeTab === 'all' || txn.type === activeTab;

    // Date Range Matching
    let matchDate = true;
    if (datePreset === 'today') {
      matchDate = txn.date === '2025-08-18';
    } else if (datePreset === 'last7') {
      matchDate = txn.date >= '2025-08-11' && txn.date <= '2025-08-18';
    } else if (datePreset === 'thisMonth') {
      matchDate = txn.date.startsWith('2025-08');
    } else if (datePreset === 'custom') {
      if (customStartDate && txn.date < customStartDate) matchDate = false;
      if (customEndDate && txn.date > customEndDate) matchDate = false;
    }

    const matchSearch = !q ||
      txn.user.toLowerCase().includes(q) ||
      txn.id.toLowerCase().includes(q) ||
      (txn.userCustomId || '').toLowerCase().includes(q) ||
      (txn.country || '').toLowerCase().includes(q) ||
      (txn.gateway || '').toLowerCase().includes(q) ||
      (txn.referenceNo || '').toLowerCase().includes(q) ||
      txn.amount.toLowerCase().includes(q) ||
      txn.date.toLowerCase().includes(q);

    return matchTab && matchSearch && matchDate;
  });

  // Calculate KPI Totals
  const totalDeposits = txnList.filter(t => t.type === 'Deposit' && t.status === 'Approved').reduce((acc, t) => acc + (t.rawAmount || 0), 0);
  const totalWithdrawals = txnList.filter(t => t.type === 'Withdrawal' && t.status === 'Approved').reduce((acc, t) => acc + (t.rawAmount || 0), 0);
  const totalRoi = txnList.filter(t => t.type === 'ROI Return').reduce((acc, t) => acc + (t.rawAmount || 0), 0);
  const totalReferral = txnList.filter(t => t.type === 'Referral Bonus').reduce((acc, t) => acc + (t.rawAmount || 0), 0);

  // Dedicated Clean PDF Print Generator for Table Data
  const handlePrintPDF = () => {
    const printWindow = window.open('', '_blank', 'width=1100,height=850');
    if (!printWindow) return;

    const rowsHtml = filtered.map(t => `
      <tr>
        <td style="padding: 10px 12px; font-weight: 600; color: #9A7B00; border-bottom: 1px solid #e5e7eb; font-family: monospace;">${t.id}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb;">
          <div style="font-weight: 600; color: #1e293b;">${t.user}</div>
          <div style="font-size: 11px; color: #64748b;">${t.userCustomId || ''} • ${t.country || ''}</div>
        </td>
        <td style="padding: 10px 12px; color: #334155; border-bottom: 1px solid #e5e7eb;">${t.type}</td>
        <td style="padding: 10px 12px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #e5e7eb;">${t.amount}</td>
        <td style="padding: 10px 12px; color: #475569; font-size: 12px; border-bottom: 1px solid #e5e7eb;">${t.gateway || 'Direct Bank'}</td>
        <td style="padding: 10px 12px; color: #64748b; font-size: 12px; border-bottom: 1px solid #e5e7eb;">${t.date} ${t.time || ''}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb;">
          <span style="display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; ${
            t.status === 'Approved' ? 'background: #ecfdf5; color: #065f46;' :
            t.status === 'Pending' ? 'background: #fffbeb; color: #92400e;' :
            'background: #fef2f2; color: #991b1b;'
          }">${t.status}</span>
        </td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Horizon of Capital — Transactions Audit Report</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              color: #1e293b;
              margin: 0;
              padding: 32px;
              background: #ffffff;
            }
            .header-box {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              padding-bottom: 20px;
              border-bottom: 2px solid #FFD700;
              margin-bottom: 24px;
            }
            .logo-title {
              font-family: 'Outfit', sans-serif;
              font-size: 22px;
              font-weight: 700;
              color: #0f172a;
            }
            .gold-badge {
              display: inline-block;
              background: #FFF9E6;
              color: #9A7B00;
              border: 1px solid #FFE066;
              padding: 2px 10px;
              border-radius: 6px;
              font-size: 11px;
              font-weight: 700;
              margin-top: 4px;
            }
            .meta-box {
              text-align: right;
              font-size: 12px;
              color: #64748b;
            }
            .summary-cards {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 12px;
              margin-bottom: 24px;
            }
            .card {
              border: 1px solid #e2e8f0;
              border-radius: 10px;
              padding: 12px 16px;
              background: #f8fafc;
            }
            .card-title {
              font-size: 11px;
              color: #64748b;
              text-transform: uppercase;
              font-weight: 600;
            }
            .card-val {
              font-size: 18px;
              font-weight: 700;
              color: #0f172a;
              margin-top: 2px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 13px;
            }
            th {
              background: #f1f5f9;
              color: #475569;
              text-align: left;
              padding: 10px 12px;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              border-bottom: 2px solid #cbd5e1;
            }
            .footer {
              margin-top: 36px;
              padding-top: 16px;
              border-top: 1px solid #e2e8f0;
              display: flex;
              justify-content: space-between;
              font-size: 11px;
              color: #94a3b8;
            }
            @media print {
              body { padding: 12px; }
            }
          </style>
        </head>
        <body>
          <div class="header-box">
            <div>
              <div class="logo-title">HORIZON OF CAPITAL</div>
              <div class="gold-badge">OFFICIAL TRANSACTIONS AUDIT REPORT</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 6px;">
                Filter: ${activeTab === 'all' ? 'All Types' : activeTab} • Date Filter: ${datePreset.toUpperCase()}
              </div>
            </div>
            <div class="meta-box">
              <div><strong>Generated Date:</strong> ${new Date().toLocaleString()}</div>
              <div><strong>Generated By:</strong> Super Admin System</div>
              <div><strong>Total Records:</strong> ${filtered.length} Transactions</div>
            </div>
          </div>

          <div class="summary-cards">
            <div class="card">
              <div class="card-title">Total Gross Deposits</div>
              <div class="card-val" style="color: #059669;">$${totalDeposits.toLocaleString()}</div>
            </div>
            <div class="card">
              <div class="card-title">Settled Withdrawals</div>
              <div class="card-val" style="color: #d97706;">$${totalWithdrawals.toLocaleString()}</div>
            </div>
            <div class="card">
              <div class="card-title">ROI Yield Distributed</div>
              <div class="card-val" style="color: #9A7B00;">$${totalRoi.toLocaleString()}</div>
            </div>
            <div class="card">
              <div class="card-title">Referral Bonuses</div>
              <div class="card-val" style="color: #2563eb;">$${totalReferral.toLocaleString()}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>TXN ID</th>
                <th>Investor</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Gateway / Channel</th>
                <th>Date & Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="footer">
            <div>CONFIDENTIAL — Internal Super Admin Ledger Document</div>
            <div>Horizon of Capital LLC • Smart Asset Management</div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Single Transaction Receipt Print Generator
  const handlePrintSingleReceipt = (t) => {
    const printWindow = window.open('', '_blank', 'width=750,height=800');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Horizon of Capital — Receipt #${t.id}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              color: #1e293b;
              margin: 0;
              padding: 40px;
              background: #ffffff;
            }
            .receipt-card {
              max-width: 600px;
              margin: 0 auto;
              border: 1px solid #e2e8f0;
              border-radius: 16px;
              padding: 32px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.05);
            }
            .logo {
              font-family: 'Outfit', sans-serif;
              font-size: 20px;
              font-weight: 700;
              color: #0f172a;
              text-align: center;
            }
            .gold-sub {
              font-size: 11px;
              color: #9A7B00;
              font-weight: 700;
              text-align: center;
              letter-spacing: 1px;
              margin-top: 2px;
            }
            .amount-box {
              background: #FFF9E6;
              border: 1px solid #FFE066;
              border-radius: 12px;
              padding: 20px;
              text-align: center;
              margin: 24px 0;
            }
            .amount {
              font-size: 32px;
              font-weight: 700;
              color: #0f172a;
            }
            .row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #f1f5f9;
              font-size: 13px;
            }
            .row-label { color: #64748b; }
            .row-val { font-weight: 600; color: #0f172a; }
            .footer {
              text-align: center;
              font-size: 11px;
              color: #94a3b8;
              margin-top: 28px;
            }
          </style>
        </head>
        <body>
          <div class="receipt-card">
            <div class="logo">HORIZON OF CAPITAL</div>
            <div class="gold-sub">OFFICIAL TRANSACTION RECEIPT</div>

            <div class="amount-box">
              <div style="font-size: 11px; color: #64748b; text-transform: uppercase;">Transaction Amount</div>
              <div class="amount">${t.amount}</div>
              <div style="font-size: 12px; font-weight: 600; color: #059669; margin-top: 4px;">Status: ${t.status}</div>
            </div>

            <div class="row">
              <span class="row-label">Transaction ID</span>
              <span class="row-val" style="font-family: monospace;">${t.id}</span>
            </div>
            <div class="row">
              <span class="row-label">Investor Name</span>
              <span class="row-val">${t.user}</span>
            </div>
            <div class="row">
              <span class="row-label">Investor ID</span>
              <span class="row-val">${t.userCustomId || 'HORIZON-USR-01'}</span>
            </div>
            <div class="row">
              <span class="row-label">Country</span>
              <span class="row-val">${t.country || 'United States'}</span>
            </div>
            <div class="row">
              <span class="row-label">Transaction Type</span>
              <span class="row-val">${t.type}</span>
            </div>
            <div class="row">
              <span class="row-label">Payment Gateway</span>
              <span class="row-val">${t.gateway || 'Direct Bank Wire'}</span>
            </div>
            <div class="row">
              <span class="row-label">Reference Number</span>
              <span class="row-val" style="font-family: monospace; font-size: 12px;">${t.referenceNo || 'REF-8891024512'}</span>
            </div>
            <div class="row">
              <span class="row-label">Date & Time</span>
              <span class="row-val">${t.date} ${t.time || ''}</span>
            </div>
            <div class="row">
              <span class="row-label">Processing Fee</span>
              <span class="row-val">${t.fee || '$0.00'}</span>
            </div>
            <div class="row" style="border-bottom: none; padding-top: 14px; font-size: 14px;">
              <span class="row-label" style="font-weight: 700; color: #0f172a;">Net Settled</span>
              <span class="row-val" style="color: #059669;">${t.netAmount || t.amount}</span>
            </div>

            <div class="footer">
              This receipt is electronically generated and verified by Horizon of Capital LLC.
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Dynamic Tabs with Live Counts
  const dynamicTabs = [
    { key: 'all', label: 'All Transactions', count: txnList.length },
    { key: 'Deposit', label: 'Deposits', count: txnList.filter(t => t.type === 'Deposit').length },
    { key: 'Withdrawal', label: 'Withdrawals', count: txnList.filter(t => t.type === 'Withdrawal').length },
    { key: 'ROI Return', label: 'ROI Returns', count: txnList.filter(t => t.type === 'ROI Return').length },
    { key: 'Referral Bonus', label: 'Referral Bonus', count: txnList.filter(t => t.type === 'Referral Bonus').length },
  ];

  if (loading) {
    return <SkeletonLoader type="table" rows={8} cols={7} />;
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8 font-poppins">
      {/* Header */}
      <PageHeader
        title="Transactions Audit Ledger"
        subtitle="Real-time ledger of deposits, withdrawals, streaming yields & referral bonuses"
        badge="Audit Engine"
        actions={
          <>
            {/* Date Range Button */}
            <Button
              variant="secondary"
              icon={<RiCalendarLine />}
              size="sm"
              onClick={() => setDateRangeModalOpen(true)}
            >
              {datePreset === 'all' ? 'Date Range' : `Date: ${datePreset.toUpperCase()}`}
            </Button>

            {/* Export CSV Button */}
            <Button
              variant="secondary"
              icon={<RiFileExcelLine className="text-emerald-600" />}
              size="sm"
              onClick={handleExportCSV}
              title="Download CSV Spreadsheet"
            >
              Export CSV
            </Button>

            {/* Print PDF Button (Outputs clean document of table data) */}
            <Button
              variant="secondary"
              icon={<RiPrinterLine className="text-blue-600" />}
              size="sm"
              onClick={handlePrintPDF}
              title="Print or Save PDF Table Report"
            >
              Print PDF
            </Button>

            {/* Clear All Button */}
            {txnList.length > 0 && (
              <Button
                variant="danger"
                icon={<RiDeleteBinLine />}
                size="sm"
                onClick={() => setClearAllModalOpen(true)}
              >
                Clear All
              </Button>
            )}
          </>
        }
      />

      {/* ──────────────── ROLLING ODOMETER KPI SUMMARY CARDS ──────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Gross Deposits"
          numericValue={totalDeposits || 445000}
          prefix="$"
          decimals={0}
          change="+18.4%"
          positive={true}
          icon="deposit"
        />
        <KPICard
          title="Total Settled Withdrawals"
          numericValue={totalWithdrawals || 15000}
          prefix="$"
          decimals={0}
          change="-4.2%"
          positive={false}
          icon="withdrawal"
        />
        <KPICard
          title="ROI Yield Distributed"
          numericValue={totalRoi || 11700}
          prefix="$"
          decimals={0}
          change="+22.1%"
          positive={true}
          icon="money"
        />
        <KPICard
          title="Referral Bonus Paid"
          numericValue={totalReferral || 1200}
          prefix="$"
          decimals={0}
          change="+12.0%"
          positive={true}
          icon="users"
        />
      </div>

      {/* Filter Tabs */}
      <TabsBar tabs={dynamicTabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Search Bar (With Perfect Icon Padding) */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <SearchBar
            placeholder="Search by TXN ID, investor name, custom ID (HORIZON-USR-01), gateway, or date..."
            value={search}
            onChange={setSearch}
            className="flex-1"
          />

          {datePreset !== 'all' && (
            <button
              onClick={() => { setDatePreset('all'); setCustomStartDate(''); setCustomEndDate(''); }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gold-50 text-gold-800 border border-gold-300 text-xs font-semibold whitespace-nowrap shadow-2xs hover:bg-gold-100 transition-colors"
            >
              <span>Date Filter Active</span>
              <RiCloseLine size={15} />
            </button>
          )}
        </div>
      </div>

      {/* ──────────────── TRANSACTIONS DATA TABLE ──────────────── */}
      <div className="card overflow-hidden">
        <div className="table-container">
          <table className="data-table font-poppins">
            <thead>
              <tr className="text-slate-400 font-medium text-xs tracking-wider">
                <th className="font-medium text-slate-500 whitespace-nowrap">TXN ID</th>
                <th className="font-medium text-slate-500 whitespace-nowrap">Investor</th>
                <th className="font-medium text-slate-500 whitespace-nowrap">Email</th>
                <th className="font-medium text-slate-500 whitespace-nowrap">Country</th>
                <th className="font-medium text-slate-500 whitespace-nowrap">Type</th>
                <th className="font-medium text-slate-500 whitespace-nowrap">Amount</th>
                <th className="font-medium text-slate-500 whitespace-nowrap">Gateway / Channel</th>
                <th className="font-medium text-slate-500 whitespace-nowrap">Date & Time</th>
                <th className="font-medium text-slate-500 whitespace-nowrap">Status</th>
                <th className="text-right pr-6 font-medium text-slate-500 whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered
                .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                .map((txn, i) => {
                const userCustomId = txn.userCustomId || 'HORIZON-USR-01';

                return (
                  <tr
                    key={txn.id}
                    className="animate-fade-in hover:bg-slate-50/70 transition-colors"
                    style={{ animationDelay: `${i * 35}ms` }}
                  >
                    {/* 1. TXN ID */}
                    <td className="whitespace-nowrap">
                      <span className="font-mono text-xs font-semibold text-slate-800 bg-slate-100/90 px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-2xs">
                        {txn.id}
                      </span>
                    </td>

                    {/* 2. Investor Details (Matching Users Table styling) */}
                    <td className="whitespace-nowrap">
                      <div className="flex items-center gap-3.5 font-poppins">
                        {/* Large Round Circle Avatar */}
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gold-300 via-gold-400 to-amber-500 text-slate-900 font-bold flex items-center justify-center flex-shrink-0 shadow-xs ring-2 ring-gold-200/80 text-xs font-poppins">
                          {txn.user.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate leading-tight font-poppins">
                            {txn.user}
                          </p>
                          <p className="text-[11px] font-medium text-gold-600 font-poppins tracking-tight mt-0.5">
                            {userCustomId}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* 3. Email */}
                    <td className="text-xs font-normal text-slate-500 font-poppins whitespace-nowrap">
                      {txn.userEmail || `${txn.user.toLowerCase().replace(/\s+/g, '.')}@investor.io`}
                    </td>

                    {/* 4. Country */}
                    <td className="text-xs font-medium text-slate-600 font-poppins whitespace-nowrap">
                      {txn.country || 'Global'}
                    </td>

                    {/* 5. Type */}
                    <td className="whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/90 text-slate-700 text-xs font-medium border border-slate-200/80 font-poppins">
                        {typeIcon(txn.type)}
                        {txn.type}
                      </span>
                    </td>

                    {/* 6. Amount */}
                    <td className="font-poppins text-xs font-bold text-slate-900 whitespace-nowrap">
                      {txn.amount}
                    </td>

                    {/* 7. Gateway */}
                    <td className="text-xs font-medium text-slate-600 font-poppins whitespace-nowrap">
                      {txn.gateway}
                    </td>

                    {/* 8. Date & Time */}
                    <td className="text-xs text-slate-500 font-normal font-poppins whitespace-nowrap">
                      <div className="font-medium text-slate-700">{txn.date}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{txn.time || '12:00 UTC'}</div>
                    </td>

                    {/* 9. Status */}
                    <td className="whitespace-nowrap">
                      <Badge variant={statusVariant(txn.status)}>
                        {txn.status}
                      </Badge>
                    </td>

                    {/* 10. Action: View & Delete */}
                    <td className="text-right pr-6 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2 font-poppins">
                        {/* View Button */}
                        <button
                          onClick={() => setSelectedTxn(txn)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-gold-50 text-slate-600 hover:text-gold-800 text-xs font-medium transition-all border border-slate-200/80 hover:border-gold-300 active:scale-95 shadow-2xs font-poppins"
                          title="View complete transaction audit details"
                        >
                          <RiEyeLine size={14} />
                          <span>View</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setTxnToDelete(txn)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 text-xs font-medium transition-all border border-red-200/70 hover:border-red-300 active:scale-95 shadow-2xs font-poppins"
                          title="Delete transaction log"
                        >
                          <RiDeleteBinLine size={14} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ──────────────── 20 ITEMS PER PAGE PAGINATION BAR ──────────────── */}
        <Pagination
          currentPage={currentPage}
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />

        {filtered.length === 0 && (
          <div className="p-12 text-center font-poppins">
            <p className="text-slate-400 font-normal">No transaction records found matching your filter criteria.</p>
          </div>
        )}
      </div>

      {/* ──────────────── View Transaction Details Slide-Over Drawer ──────────────── */}
      <Modal
        isOpen={!!selectedTxn}
        onClose={() => setSelectedTxn(null)}
        title="Transaction Ledger Audit"
        subtitle={selectedTxn ? `TXN: ${selectedTxn.id} • ${selectedTxn.date}` : ''}
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              icon={<RiPrinterLine />}
              onClick={() => handlePrintSingleReceipt(selectedTxn)}
            >
              Print Receipt
            </Button>
            <Button variant="primary" onClick={() => setSelectedTxn(null)}>
              Close
            </Button>
          </>
        }
      >
        {selectedTxn && (
          <div className="space-y-6 font-poppins">
            {/* Top Transaction Banner */}
            <div className="p-5 bg-gradient-to-r from-gold-50/90 via-amber-50/40 to-white rounded-2xl border border-gold-200/80 flex flex-col items-center justify-center text-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Transaction Amount
              </span>
              <h2 className="text-3xl font-bold text-slate-900 font-poppins">
                {selectedTxn.amount}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={statusVariant(selectedTxn.status)} size="md">
                  {selectedTxn.status}
                </Badge>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-white text-slate-700 border border-slate-200 shadow-2xs">
                  {typeIcon(selectedTxn.type)} {selectedTxn.type}
                </span>
              </div>
            </div>

            {/* Investor Profile Summary Card */}
            <div>
              <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2.5">
                Investor Account
              </h4>
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-300 via-gold-400 to-amber-500 text-slate-900 font-bold flex items-center justify-center flex-shrink-0 shadow-xs ring-2 ring-gold-200/80 text-sm font-poppins">
                    {selectedTxn.user.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-slate-800 font-poppins">{selectedTxn.user}</h5>
                    <p className="text-xs text-gold-600 font-medium font-poppins">
                      {selectedTxn.userCustomId || 'HORIZON-USR-01'}
                    </p>
                    <p className="text-xs text-slate-400 font-normal">{selectedTxn.userEmail || 'investor@horizoncap.io'}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                    <RiGlobalLine size={13} className="text-gold-600" />
                    {selectedTxn.country || 'United States'}
                  </span>
                </div>
              </div>
            </div>

            {/* Transaction Settlement Details Breakdown */}
            <div>
              <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2.5">
                Audit Breakdown
              </h4>
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <span className="text-slate-400">Transaction ID</span>
                  <span className="font-semibold text-slate-800 font-mono">{selectedTxn.id}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <span className="text-slate-400">Reference Hash / No</span>
                  <span className="font-medium text-slate-700 font-mono text-[11px]">
                    {selectedTxn.referenceNo || 'REF-8891024512'}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <span className="text-slate-400">Payment Gateway</span>
                  <span className="font-medium text-slate-800">{selectedTxn.gateway || 'JPMorgan Chase Wire'}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <span className="text-slate-400">Settlement Date</span>
                  <span className="font-medium text-slate-700">{selectedTxn.date} {selectedTxn.time ? `• ${selectedTxn.time}` : ''}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <span className="text-slate-400">Processing Fee</span>
                  <span className="font-medium text-slate-700">{selectedTxn.fee || '$0.00'}</span>
                </div>

                <div className="flex items-center justify-between pt-1 font-semibold text-sm">
                  <span className="text-slate-800">Net Settled Amount</span>
                  <span className="text-emerald-600 font-poppins">{selectedTxn.netAmount || selectedTxn.amount}</span>
                </div>

                {selectedTxn.rejectReason && (
                  <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-red-600 text-xs mt-2">
                    <strong>Rejection Reason:</strong> {selectedTxn.rejectReason}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ──────────────── Delete Transaction Confirmation Modal ──────────────── */}
      <Modal
        isOpen={!!txnToDelete}
        onClose={() => setTxnToDelete(null)}
        title="Confirm Transaction Deletion"
        subtitle="Permanent Action"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setTxnToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" icon={<RiDeleteBinLine />} onClick={handleDeleteTxn}>
              Confirm Delete
            </Button>
          </>
        }
      >
        {txnToDelete && (
          <div className="space-y-4 text-center py-2 font-poppins">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-xs">
              <RiAlertLine size={28} />
            </div>

            <div>
              <h4 className="text-base font-semibold text-slate-800 font-poppins">
                Delete Transaction Record?
              </h4>
              <p className="text-sm text-slate-500 mt-1 font-normal font-poppins">
                Transaction <strong className="text-gold-700 font-semibold">{txnToDelete.id}</strong> ({txnToDelete.amount} - {txnToDelete.type}) for investor <strong>{txnToDelete.user}</strong> will be permanently removed from this audit ledger.
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* ──────────────── Clear All Transactions Confirmation Modal ──────────────── */}
      <Modal
        isOpen={clearAllModalOpen}
        onClose={() => setClearAllModalOpen(false)}
        title="Purge All Transactions"
        subtitle="Irreversible Ledger Reset"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setClearAllModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" icon={<RiDeleteBinLine />} onClick={handleClearAll}>
              Purge All Records
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-center py-2 font-poppins">
          <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-xs">
            <RiAlertLine size={28} />
          </div>

          <div>
            <h4 className="text-base font-semibold text-slate-800 font-poppins">
              Are you sure you want to clear all transactions?
            </h4>
            <p className="text-sm text-slate-500 mt-1 font-normal font-poppins">
              All {txnList.length} transaction entries will be purged from the active view. This action cannot be undone.
            </p>
          </div>
        </div>
      </Modal>

      {/* ──────────────── Interactive Date Range Filter Modal ──────────────── */}
      <Modal
        isOpen={dateRangeModalOpen}
        onClose={() => setDateRangeModalOpen(false)}
        title="Filter Transactions by Date"
        subtitle="Select preset period or custom range"
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setDatePreset('all');
                setCustomStartDate('');
                setCustomEndDate('');
                setDateRangeModalOpen(false);
              }}
            >
              Reset to All
            </Button>
            <Button variant="primary" onClick={() => setDateRangeModalOpen(false)}>
              Apply Date Filter
            </Button>
          </>
        }
      >
        <div className="space-y-4 font-poppins">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Quick Preset Ranges
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'all', label: 'All Dates (Full Ledger)' },
                { id: 'today', label: 'Today (Aug 18, 2025)' },
                { id: 'last7', label: 'Last 7 Days' },
                { id: 'thisMonth', label: 'This Month (Aug 2025)' },
              ].map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setDatePreset(preset.id)}
                  className={`p-2.5 rounded-xl text-xs font-medium text-left border transition-all ${
                    datePreset === preset.id
                      ? 'bg-gold-50 border-gold-400 text-gold-900 font-semibold shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Custom Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[11px] text-slate-400 font-medium block mb-1">Start Date</span>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={e => {
                    setCustomStartDate(e.target.value);
                    setDatePreset('custom');
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 outline-none focus:border-gold-400 font-poppins"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium block mb-1">End Date</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={e => {
                    setCustomEndDate(e.target.value);
                    setDatePreset('custom');
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 outline-none focus:border-gold-400 font-poppins"
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
