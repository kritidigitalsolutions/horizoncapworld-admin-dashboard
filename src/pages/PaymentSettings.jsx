import React, { useState, useEffect, useRef } from 'react';
import {
  RiAddLine, RiQrCodeLine, RiWallet3Line, RiEditLine, RiDeleteBinLine,
  RiCheckLine, RiStarLine, RiGlobalLine, RiTimeLine, RiShieldCheckLine,
  RiAlertLine, RiCoinsLine, RiBankLine, RiFlashlightLine, RiArrowRightLine,
  RiInformationLine, RiUploadCloud2Line, RiBuildingLine, RiImageAddLine,
  RiCloseLine, RiSmartphoneLine, RiPhoneLine, RiIdCardLine,
  RiVideoLine, RiPlayCircleLine, RiMovieLine, RiYoutubeLine
} from 'react-icons/ri';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import SearchBar from '../components/ui/SearchBar';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import PageHeader from '../components/ui/PageHeader';
import { paymentMethods as initialMethods } from '../data/mockData';

export default function PaymentSettings() {
  const [loading, setLoading] = useState(true);
  const [methods, setMethods] = useState(() => {
    const saved = localStorage.getItem('horizon_payment_methods');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { /* ignore */ }
    }
    return initialMethods;
  });

  const updateMethodsList = (updatedList) => {
    setMethods(updatedList);
    localStorage.setItem('horizon_payment_methods', JSON.stringify(updatedList));
    window.dispatchEvent(new CustomEvent('horizon-payment-methods-change', { detail: updatedList }));
  };

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Drawer & Modals State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState(null);
  const [qrModalWallet, setQrModalWallet] = useState(null);
  const [walletToDelete, setWalletToDelete] = useState(null);

  // ──────── DEPOSIT VIDEO TUTORIAL STUDIO STATE ────────
  const defaultTutorialVideo = {
    title: 'Official Deposit Guide: How to deposit via EasyPaisa, JazzCash, Bank Transfer & Crypto',
    subtitle: 'Watch this 2-minute step-by-step video before transferring funds to ensure instant auto-credit and zero delays.',
    videoType: 'url', // 'url' or 'upload'
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    uploadedVideoName: 'horizon_official_deposit_tutorial.mp4',
    instructions: [
      'Choose your preferred deposit channel from the left menu (EasyPaisa, JazzCash, Bank Transfer, or Crypto).',
      'Copy the official account number, IBAN or wallet address, or scan the verified QR code.',
      'Complete the transfer through your banking or crypto app.',
      'Enter the amount sent and your Transaction ID (TID / Hash) or upload the bank transfer slip.',
      'Click "Submit deposit" — deposits are auto-credited or verified instantly by compliance.',
    ],
    status: 'Published',
    updatedAt: new Date().toISOString().split('T')[0],
  };

  const [tutorialVideo, setTutorialVideo] = useState(() => {
    const saved = localStorage.getItem('horizon_deposit_tutorial_video');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return defaultTutorialVideo;
  });

  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoPreviewOpen, setVideoPreviewOpen] = useState(false);
  const [videoForm, setVideoForm] = useState(tutorialVideo);
  const [videoSavedNotification, setVideoSavedNotification] = useState(false);
  const videoFileInputRef = useRef(null);

  const handleOpenVideoStudio = () => {
    setVideoForm(tutorialVideo);
    setVideoModalOpen(true);
  };

  const handleSaveVideoTutorial = () => {
    const updated = {
      ...videoForm,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setTutorialVideo(updated);
    localStorage.setItem('horizon_deposit_tutorial_video', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('horizon-deposit-video-change', { detail: updated }));
    setVideoSavedNotification(true);
    setVideoModalOpen(false);
    setTimeout(() => setVideoSavedNotification(false), 3000);
  };

  const handleVideoFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const videoObjectUrl = URL.createObjectURL(file);
    setVideoForm(prev => ({
      ...prev,
      videoType: 'upload',
      videoUrl: videoObjectUrl,
      uploadedVideoName: file.name,
    }));
  };

  // Form State
  const [category, setCategory] = useState('Mobile E-Wallet'); // 'Mobile E-Wallet', 'Crypto Digital Wallet', 'Indian Bank Account', 'International Bank Account'
  const [name, setName] = useState('');
  const [network, setNetwork] = useState('EasyPaisa Mobile Banking');
  const [networkCode, setNetworkCode] = useState('EASYPAISA');
  const [address, setAddress] = useState('');
  const [memo, setMemo] = useState('');
  const [minDeposit, setMinDeposit] = useState('PKR 1,500 (~$5 USD)');
  const [confirmationTime, setConfirmationTime] = useState('Instant / 5 Minutes');
  const [instructions, setInstructions] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [status, setStatus] = useState('Active');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  // Mobile E-Wallet Form Fields (EasyPaisa / JazzCash)
  const [ewalletProvider, setEwalletProvider] = useState('EasyPaisa');
  const [ewalletMobileNo, setEwalletMobileNo] = useState('');
  const [ewalletAccountTitle, setEwalletAccountTitle] = useState('');
  const [ewalletCnic, setEwalletCnic] = useState('');
  const [ewalletTillId, setEwalletTillId] = useState('');

  // Indian Bank Form Fields
  const [indianBankName, setIndianBankName] = useState('HDFC Bank Ltd');
  const [indianAccountNo, setIndianAccountNo] = useState('');
  const [indianIfsc, setIndianIfsc] = useState('');
  const [indianHolder, setIndianHolder] = useState('Horizon Capital India Pvt Ltd');
  const [indianAccountType, setIndianAccountType] = useState('Current Account');
  const [indianBranch, setIndianBranch] = useState('Mumbai, India');
  const [indianUpiId, setIndianUpiId] = useState('');

  // International Bank Form Fields
  const [intlBankName, setIntlBankName] = useState('JPMorgan Chase Bank, N.A.');
  const [intlAccountNo, setIntlAccountNo] = useState('');
  const [intlSwift, setIntlSwift] = useState('CHASUS33XXX');
  const [intlRouting, setIntlRouting] = useState('021000021');
  const [intlHolder, setIntlHolder] = useState('Horizon Capital Global Holdings LLC');
  const [intlAccountType, setIntlAccountType] = useState('Corporate Escrow Trust');
  const [intlBranch, setIntlBranch] = useState('270 Park Ave, New York, USA');

  // Crypto Supported Tokens & Minimum Deposits Breakdown
  const [cryptoMinDeposits, setCryptoMinDeposits] = useState([
    { token: 'BNB', min: '0.004' },
    { token: 'USDT', min: '5' },
    { token: 'USDC', min: '5' },
    { token: 'FDUSD', min: '5' },
  ]);

  const handleAddTokenRow = () => {
    setCryptoMinDeposits([...cryptoMinDeposits, { token: '', min: '5' }]);
  };

  const handleRemoveTokenRow = (idx) => {
    setCryptoMinDeposits(cryptoMinDeposits.filter((_, i) => i !== idx));
  };

  const handleTokenRowChange = (idx, field, value) => {
    const updated = [...cryptoMinDeposits];
    updated[idx] = { ...updated[idx], [field]: value };
    setCryptoMinDeposits(updated);
  };

  const handleApplyCryptoPreset = (presetKey) => {
    if (presetKey === 'bnb') {
      setName('BNB Smart Chain Depository');
      setNetwork('BNB Smart Chain (BEP-20)');
      setNetworkCode('BSC');
      setMinDeposit('$10 USD (0.004 BNB)');
      setCryptoMinDeposits([
        { token: 'BNB', min: '0.004' },
        { token: 'USDT', min: '5' },
        { token: 'USDC', min: '5' },
        { token: 'FDUSD', min: '5' },
      ]);
    } else if (presetKey === 'solana') {
      setName('Solana High-Speed Treasury');
      setNetwork('Solana Network (SPL)');
      setNetworkCode('SOL');
      setMinDeposit('$25 USD (0.02 SOL)');
      setCryptoMinDeposits([
        { token: 'SOL', min: '0.02' },
        { token: 'USDC', min: '5' },
        { token: 'USDT', min: '5' },
      ]);
    } else if (presetKey === 'tron') {
      setName('TRON Primary Treasury');
      setNetwork('TRON (TRC-20)');
      setNetworkCode('TRC20');
      setMinDeposit('$10 USD (20 TRX)');
      setCryptoMinDeposits([
        { token: 'TRX', min: '20' },
        { token: 'USDT', min: '10' },
        { token: 'USDD', min: '10' },
      ]);
    } else if (presetKey === 'eth') {
      setName('Ethereum Institutional Vault');
      setNetwork('Ethereum Mainnet (ERC-20)');
      setNetworkCode('ERC20');
      setMinDeposit('$50 USD (0.01 ETH)');
      setCryptoMinDeposits([
        { token: 'ETH', min: '0.01' },
        { token: 'USDT', min: '50' },
        { token: 'USDC', min: '50' },
        { token: 'DAI', min: '50' },
      ]);
    } else if (presetKey === 'polygon') {
      setName('Polygon PoS Depository');
      setNetwork('Polygon PoS (POL)');
      setNetworkCode('POL');
      setMinDeposit('$5 USD (10 POL)');
      setCryptoMinDeposits([
        { token: 'POL', min: '10' },
        { token: 'USDT', min: '5' },
        { token: 'USDC', min: '5' },
      ]);
    } else if (presetKey === 'opbnb') {
      setName('opBNB Layer-2 Fast Hub');
      setNetwork('opBNB Mainnet (L2)');
      setNetworkCode('OPBNB');
      setMinDeposit('$5 USD (0.005 BNB)');
      setCryptoMinDeposits([
        { token: 'BNB', min: '0.005' },
        { token: 'USDT', min: '5' },
        { token: 'FDUSD', min: '5' },
      ]);
    }
  };

  const fileInputRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  // Handle Image File Upload (Convert to Data URL for instant live preview)
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrCodeUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Open Create Drawer
  const openCreateDrawer = (defaultCat = 'Mobile E-Wallet') => {
    setEditingWallet(null);
    setCategory(defaultCat);
    setName('');
    setIsDefault(false);
    setStatus('Active');
    setQrCodeUrl('');

    if (defaultCat === 'Mobile E-Wallet') {
      setEwalletProvider('EasyPaisa');
      setEwalletMobileNo('');
      setEwalletAccountTitle('');
      setEwalletCnic('');
      setEwalletTillId('');
      setNetwork('EasyPaisa Mobile Banking');
      setNetworkCode('EASYPAISA');
      setMinDeposit('PKR 1,500 (~$5 USD)');
      setConfirmationTime('Instant / 5 Minutes');
      setInstructions('Send payment to this mobile number or scan QR code. Save transaction TRX ID as deposit proof.');
    } else if (defaultCat === 'Indian Bank Account') {
      setIndianBankName('HDFC Bank Ltd');
      setIndianAccountNo('');
      setIndianIfsc('HDFC0000128');
      setIndianHolder('Horizon Capital India Pvt Ltd');
      setIndianAccountType('Current Account');
      setIndianBranch('Nariman Point, Mumbai');
      setIndianUpiId('horizoncapital@hdfcbank');
      setNetwork('Indian Domestic (IMPS / NEFT / RTGS / UPI)');
      setNetworkCode('INR');
      setMinDeposit('₹5,000 INR (~$60 USD)');
      setConfirmationTime('Instant / 15 Minutes');
      setInstructions('Transfer via IMPS/NEFT/RTGS or UPI QR. Include user ID in remarks.');
    } else if (defaultCat === 'International Bank Account') {
      setIntlBankName('JPMorgan Chase Bank, N.A.');
      setIntlAccountNo('');
      setIntlSwift('CHASUS33XXX');
      setIntlRouting('021000021');
      setIntlHolder('Horizon Capital Global Holdings LLC');
      setIntlAccountType('Corporate Escrow Trust');
      setIntlBranch('270 Park Ave, New York, USA');
      setNetwork('Global Wire Transfer / SWIFT / FedNow');
      setNetworkCode('GLOBAL');
      setMinDeposit('$5,000 USD');
      setConfirmationTime('1-2 Business Days');
      setInstructions('Official USD custody escrow account. Specify User ID in Field 70 memo.');
    } else {
      setName('BNB Smart Chain Depository');
      setNetwork('BNB Smart Chain (BEP-20)');
      setNetworkCode('BSC');
      setAddress('');
      setMemo('');
      setMinDeposit('$10 USD (0.004 BNB)');
      setConfirmationTime('Instant (~3 Seconds)');
      setInstructions('Send only BEP-20 tokens (BNB, USDT, USDC, FDUSD) to this address. Verified automatically.');
      setCryptoMinDeposits([
        { token: 'BNB', min: '0.004' },
        { token: 'USDT', min: '5' },
        { token: 'USDC', min: '5' },
        { token: 'FDUSD', min: '5' },
      ]);
    }

    setDrawerOpen(true);
  };

  // Open Edit Drawer
  const openEditDrawer = (w) => {
    setEditingWallet(w);
    setCategory(w.category || 'Mobile E-Wallet');
    setName(w.name || '');
    setNetwork(w.network || '');
    setNetworkCode(w.networkCode || '');
    setAddress(w.address || '');
    setMemo(w.memo || '');
    setMinDeposit(w.minDeposit || '$50 USD');
    setConfirmationTime(w.confirmationTime || 'Instant');
    setInstructions(w.instructions || '');
    setIsDefault(!!w.isDefault);
    setStatus(w.status || 'Active');
    setQrCodeUrl(w.qrCodeUrl || '');

    if (w.minDeposits && Array.isArray(w.minDeposits) && w.minDeposits.length > 0) {
      setCryptoMinDeposits(w.minDeposits);
    } else if (w.tokens && Array.isArray(w.tokens)) {
      setCryptoMinDeposits(w.tokens.map(t => ({ token: t, min: '5' })));
    } else {
      setCryptoMinDeposits([
        { token: 'BNB', min: '0.004' },
        { token: 'USDT', min: '5' },
        { token: 'USDC', min: '5' },
        { token: 'FDUSD', min: '5' },
      ]);
    }

    if (w.category === 'Mobile E-Wallet') {
      setEwalletProvider(w.provider || 'EasyPaisa');
      setEwalletMobileNo(w.accountNo || '');
      setEwalletAccountTitle(w.accountHolder || '');
      setEwalletCnic(w.cnic || w.memo?.replace('CNIC: ', '') || '');
      setEwalletTillId(w.tillId || '');
    } else if (w.category === 'Indian Bank Account') {
      setIndianBankName(w.bankName || 'HDFC Bank Ltd');
      setIndianAccountNo(w.accountNo || '');
      setIndianIfsc(w.ifsc || 'HDFC0000128');
      setIndianHolder(w.accountHolder || 'Horizon Capital India Pvt Ltd');
      setIndianAccountType(w.accountType || 'Current Account');
      setIndianBranch(w.bankBranch || 'Mumbai, India');
      setIndianUpiId(w.upiId || w.memo?.replace('UPI: ', '') || '');
    } else if (w.category === 'International Bank Account') {
      setIntlBankName(w.bankName || 'JPMorgan Chase Bank, N.A.');
      setIntlAccountNo(w.accountNo || '');
      setIntlSwift(w.swiftCode || w.memo?.replace('SWIFT: ', '') || 'CHASUS33XXX');
      setIntlRouting(w.routingNo || '021000021');
      setIntlHolder(w.accountHolder || 'Horizon Capital Global Holdings LLC');
      setIntlAccountType(w.accountType || 'Corporate Escrow Trust');
      setIntlBranch(w.bankBranch || '270 Park Ave, New York, USA');
    }

    setDrawerOpen(true);
  };

  // Save / Update Wallet
  const handleSaveWallet = () => {
    let finalName = name;
    let finalAddress = address;
    let finalMemo = memo;
    let finalNetwork = network;
    let finalCode = networkCode;

    if (category === 'Mobile E-Wallet') {
      finalName = `${ewalletProvider} Official Merchant Wallet`;
      finalAddress = `Mobile No: ${ewalletMobileNo || '0300 0000000'} • Title: ${ewalletAccountTitle || 'Horizon Agent'}`;
      finalMemo = ewalletCnic ? `CNIC: ${ewalletCnic}` : (ewalletTillId ? `Till ID: ${ewalletTillId}` : '');
      finalNetwork = `${ewalletProvider} Mobile Banking`;
      finalCode = ewalletProvider.toUpperCase().replace(/\s+/g, '');
    } else if (category === 'Indian Bank Account') {
      finalName = `${indianBankName} Corporate Account`;
      finalAddress = `A/C: ${indianAccountNo || '50200084920194'} • IFSC: ${indianIfsc || 'HDFC0000128'}`;
      finalMemo = indianUpiId ? `UPI: ${indianUpiId}` : '';
      finalNetwork = 'Indian Domestic (IMPS / NEFT / RTGS / UPI)';
      finalCode = 'INR';
    } else if (category === 'International Bank Account') {
      finalName = `${intlBankName} Institutional Wire`;
      finalAddress = `A/C: ${intlAccountNo || '109288492019'} • Routing: ${intlRouting || '021000021'}`;
      finalMemo = intlSwift ? `SWIFT: ${intlSwift}` : '';
      finalNetwork = 'Global Wire Transfer / SWIFT / FedNow';
      finalCode = 'GLOBAL';
    }

    if (!finalName.trim() || !finalAddress.trim()) return;

    const validMinDeposits = cryptoMinDeposits.filter(d => d.token && d.token.trim());
    const validTokens = validMinDeposits.map(d => d.token.trim().toUpperCase());

    if (editingWallet) {
      const updated = methods.map(m => m.id === editingWallet.id ? {
        ...m,
        category,
        name: finalName,
        network: finalNetwork,
        networkCode: finalCode,
        address: finalAddress,
        memo: finalMemo,
        minDeposit,
        confirmationTime,
        instructions,
        qrCodeUrl,
        tokens: validTokens.length > 0 ? validTokens : m.tokens,
        minDeposits: validMinDeposits.length > 0 ? validMinDeposits : m.minDeposits,
        provider: ewalletProvider,
        accountNo: category === 'Mobile E-Wallet' ? ewalletMobileNo : (category === 'Indian Bank Account' ? indianAccountNo : intlAccountNo),
        accountHolder: category === 'Mobile E-Wallet' ? ewalletAccountTitle : (category === 'Indian Bank Account' ? indianHolder : intlHolder),
        cnic: ewalletCnic,
        tillId: ewalletTillId,
        bankName: category === 'Indian Bank Account' ? indianBankName : intlBankName,
        ifsc: indianIfsc,
        routingNo: intlRouting,
        swiftCode: intlSwift,
        accountType: category === 'Indian Bank Account' ? indianAccountType : intlAccountType,
        bankBranch: category === 'Indian Bank Account' ? indianBranch : intlBranch,
        upiId: indianUpiId,
        status,
        isDefault,
      } : (isDefault ? { ...m, isDefault: false } : m));
      updateMethodsList(updated);
    } else {
      const newWallet = {
        id: `wallet-${Date.now()}`,
        category,
        name: finalName,
        network: finalNetwork,
        networkCode: finalCode,
        address: finalAddress,
        memo: finalMemo,
        minDeposit,
        confirmationTime,
        instructions,
        qrCodeUrl,
        tokens: validTokens,
        minDeposits: validMinDeposits,
        provider: ewalletProvider,
        accountNo: category === 'Mobile E-Wallet' ? ewalletMobileNo : (category === 'Indian Bank Account' ? indianAccountNo : intlAccountNo),
        accountHolder: category === 'Mobile E-Wallet' ? ewalletAccountTitle : (category === 'Indian Bank Account' ? indianHolder : intlHolder),
        cnic: ewalletCnic,
        tillId: ewalletTillId,
        bankName: category === 'Indian Bank Account' ? indianBankName : intlBankName,
        ifsc: indianIfsc,
        routingNo: intlRouting,
        swiftCode: intlSwift,
        accountType: category === 'Indian Bank Account' ? indianAccountType : intlAccountType,
        bankBranch: category === 'Indian Bank Account' ? indianBranch : intlBranch,
        upiId: indianUpiId,
        status,
        isDefault,
      };

      if (isDefault) {
        updateMethodsList([newWallet, ...methods.map(m => ({ ...m, isDefault: false }))]);
      } else {
        updateMethodsList([newWallet, ...methods]);
      }
    }

    setDrawerOpen(false);
  };

  // Set Default Wallet
  const handleSetDefault = (id) => {
    updateMethodsList(methods.map(m => ({
      ...m,
      isDefault: m.id === id,
    })));
  };

  // Delete Wallet
  const handleDeleteWallet = () => {
    if (!walletToDelete) return;
    updateMethodsList(methods.filter(m => m.id !== walletToDelete.id));
    setWalletToDelete(null);
  };

  // Filter Logic
  const filtered = methods.filter(m => {
    const q = search.trim().toLowerCase();
    const matchCat =
      categoryFilter === 'all' ||
      (categoryFilter === 'E-Wallet' && m.category.includes('Mobile')) ||
      (categoryFilter === 'Crypto' && m.category.includes('Crypto')) ||
      (categoryFilter === 'Indian' && m.category.includes('Indian')) ||
      (categoryFilter === 'International' && m.category.includes('International'));

    const matchSearch = !q ||
      m.name.toLowerCase().includes(q) ||
      m.network.toLowerCase().includes(q) ||
      m.address.toLowerCase().includes(q) ||
      (m.networkCode || '').toLowerCase().includes(q) ||
      (m.accountHolder || '').toLowerCase().includes(q);

    return matchCat && matchSearch;
  });

  // Icon Resolver for clean circular badge (no squished text in circle)
  const getChannelBadgeVisual = (wallet) => {
    const cat = wallet.category;
    if (cat.includes('Mobile')) {
      return {
        icon: <RiSmartphoneLine size={22} />,
        bgColor: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        tagBg: 'bg-emerald-100/80 text-emerald-800 border-emerald-300',
      };
    }
    if (cat.includes('Indian')) {
      return {
        icon: <RiBankLine size={22} />,
        bgColor: 'bg-orange-50 text-orange-600 border-orange-200',
        tagBg: 'bg-orange-100/80 text-orange-800 border-orange-300',
      };
    }
    if (cat.includes('International')) {
      return {
        icon: <RiGlobalLine size={22} />,
        bgColor: 'bg-indigo-50 text-indigo-600 border-indigo-200',
        tagBg: 'bg-indigo-100/80 text-indigo-800 border-indigo-300',
      };
    }
    return {
      icon: <RiCoinsLine size={22} />,
      bgColor: 'bg-gold-50 text-gold-700 border-gold-300',
      tagBg: 'bg-gold-100/80 text-gold-900 border-gold-300',
    };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton w-64 h-8 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonLoader type="card" count={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8 font-poppins">
      {/* Header */}
      <PageHeader
        title="Payment Gateways & Accounts"
        subtitle="Manage Mobile E-Wallets (EasyPaisa, JazzCash), Indian domestic banks, International wire & crypto addresses"
        badge="Gateway Engine"
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              icon={<RiVideoLine className="text-gold-600" />}
              onClick={handleOpenVideoStudio}
            >
              Deposit Video Studio
            </Button>
            <Button
              variant="primary"
              icon={<RiAddLine />}
              onClick={() => openCreateDrawer('Mobile E-Wallet')}
            >
              Add Gateway / Account
            </Button>
          </div>
        }
      />

      {videoSavedNotification && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in shadow-xs">
          <RiCheckLine size={18} className="text-emerald-600" />
          Deposit tutorial video guide updated and broadcasted to user dashboards successfully!
        </div>
      )}

      {/* ──────────────── DEPOSIT TUTORIAL VIDEO STUDIO BANNER CARD ──────────────── */}
      <div className="card p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-gold-500/5 to-white border-2 border-gold-300 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-400 via-gold-500 to-amber-600 text-slate-950 flex items-center justify-center flex-shrink-0 shadow-gold">
            <RiVideoLine size={24} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 font-display">
                User Deposit Video Tutorial & Interactive Guide
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-300">
                ● Live on User App
              </span>
            </div>
            <p className="text-xs text-slate-600 font-poppins mt-1 line-clamp-1">
              <strong>Title:</strong> {tutorialVideo.title}
            </p>
            <p className="text-[11px] text-slate-400 font-poppins mt-0.5">
              Users can click <span className="text-gold-700 font-bold">"▶ How to deposit? Watch guide"</span> on the User Deposit Page to watch this tutorial.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0 self-end lg:self-auto">
          <Button
            variant="secondary"
            icon={<RiPlayCircleLine className="text-gold-700" />}
            size="sm"
            onClick={() => setVideoPreviewOpen(true)}
          >
            Preview Video
          </Button>
          <Button
            variant="primary"
            icon={<RiUploadCloud2Line />}
            size="sm"
            onClick={handleOpenVideoStudio}
          >
            Edit / Upload Video
          </Button>
        </div>
      </div>

      {/* ──────────────── TOP SUMMARY METRICS ──────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card p-4 flex items-center gap-3.5 border-l-4 border-l-emerald-500 shadow-2xs">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <RiSmartphoneLine size={22} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Mobile E-Wallets</p>
            <p className="text-base font-bold text-slate-800 font-poppins mt-0.5">
              {methods.filter(m => m.category.includes('Mobile')).length} Active Wallets
            </p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-3.5 border-l-4 border-l-gold-400 shadow-2xs">
          <div className="w-11 h-11 rounded-2xl bg-gold-50 text-gold-700 flex items-center justify-center flex-shrink-0">
            <RiCoinsLine size={22} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Crypto Digital Treasury</p>
            <p className="text-base font-bold text-slate-800 font-poppins mt-0.5">
              {methods.filter(m => m.category.includes('Crypto')).length} Active Vaults
            </p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-3.5 border-l-4 border-l-orange-500 shadow-2xs">
          <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0">
            <RiBankLine size={22} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Indian Banking & UPI</p>
            <p className="text-base font-bold text-slate-800 font-poppins mt-0.5">
              {methods.filter(m => m.category.includes('Indian')).length} Bank Accounts
            </p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-3.5 border-l-4 border-l-indigo-500 shadow-2xs">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <RiGlobalLine size={22} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Global Wire Depository</p>
            <p className="text-base font-bold text-slate-800 font-poppins mt-0.5">
              {methods.filter(m => m.category.includes('International')).length} SWIFT Depository
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchBar
            placeholder="Search by wallet name (EasyPaisa, JazzCash, HDFC), account/phone number, or network..."
            value={search}
            onChange={setSearch}
            className="flex-1"
          />
          <div className="flex gap-2 overflow-x-auto font-poppins">
            {[
              { id: 'all', label: `All Channels (${methods.length})` },
              { id: 'E-Wallet', label: 'Mobile E-Wallets' },
              { id: 'Crypto', label: 'Crypto Wallets' },
              { id: 'Indian', label: 'Indian Bank Accounts' },
              { id: 'International', label: 'International Banks' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                  categoryFilter === cat.id
                    ? 'bg-gold-400 text-slate-900 font-semibold shadow-gold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ──────────────── GATEWAY & WALLET CARDS GRID ──────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {filtered.map((wallet, i) => {
          const isMobile = wallet.category.includes('Mobile');
          const isCrypto = wallet.category.includes('Crypto');
          const isIndian = wallet.category.includes('Indian');
          const isIntl = wallet.category.includes('International');
          const visual = getChannelBadgeVisual(wallet);

          return (
            <div
              key={wallet.id}
              className={`card p-5 animate-slide-up hover:shadow-card-hover transition-all flex flex-col justify-between border ${
                wallet.isDefault ? 'border-gold-300 bg-gradient-to-br from-gold-50/40 via-white to-white' : 'border-slate-200'
              }`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="space-y-4">
                {/* Card Top: Clean Icon Badge + Title & Network Pill */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Fixed Circle Badge (Clean SVG Icon, no overflowing text) */}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-2xs flex-shrink-0 ${visual.bgColor}`}>
                      {visual.icon}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-slate-800 font-poppins leading-tight">
                          {wallet.name}
                        </h3>
                        {wallet.isDefault && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold-400 text-slate-900 text-[10px] font-bold shadow-2xs">
                            <RiStarLine size={11} /> Default
                          </span>
                        )}
                      </div>

                      {/* Network & Tag Row */}
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide border shadow-2xs ${visual.tagBg}`}>
                          {wallet.networkCode || 'CHANNEL'}
                        </span>
                        <span className="text-xs text-slate-400 font-normal">
                          {wallet.network}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Badge variant={wallet.status === 'Active' ? 'success' : 'danger'} size="sm">
                    {wallet.status}
                  </Badge>
                </div>

                {/* Uploaded QR Code & Account Address Box */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center gap-3.5">
                  {/* Uploaded QR Code Thumbnail */}
                  {wallet.qrCodeUrl ? (
                    <div
                      onClick={() => setQrModalWallet(wallet)}
                      className="w-16 h-16 rounded-xl bg-white border border-slate-200 p-1 flex-shrink-0 shadow-2xs cursor-pointer hover:border-gold-400 transition-colors group relative"
                      title="Click to view full QR code"
                    >
                      <img
                        src={wallet.qrCodeUrl}
                        alt="Uploaded QR Code"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-slate-900/40 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                        <RiQrCodeLine size={16} />
                      </div>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-300 flex-shrink-0">
                      {isMobile ? <RiSmartphoneLine size={24} /> : (isIndian || isIntl ? <RiBankLine size={24} /> : <RiWallet3Line size={24} />)}
                    </div>
                  )}

                  {/* Public Receiving Identifier */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      {isMobile ? 'Mobile Number & Account Title' : (isCrypto ? 'Receiving Wallet Address' : (isIndian ? 'Indian Account & IFSC' : 'Global IBAN / Wire Account'))}
                    </p>
                    <p className="text-xs font-mono font-medium text-slate-800 break-all leading-tight bg-white p-2 rounded-lg border border-slate-200/80 select-all">
                      {wallet.address}
                    </p>
                    {wallet.memo && (
                      <p className="text-[11px] font-mono text-gold-700">
                        {wallet.memo}
                      </p>
                    )}
                  </div>
                </div>

                {/* Specifications: Min Deposit & Settlement Speed */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Min. Deposit</span>
                    <span className="font-semibold text-slate-800">{wallet.minDeposit || 'No Min.'}</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Settlement Speed</span>
                    <span className="font-medium text-slate-700">{wallet.confirmationTime || 'Instant'}</span>
                  </div>
                </div>

                {/* Instructions */}
                {wallet.instructions && (
                  <p className="text-[11px] text-slate-500 leading-relaxed font-normal bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/60 flex items-start gap-1.5">
                    <RiInformationLine size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>{wallet.instructions}</span>
                  </p>
                )}
              </div>

              {/* ──────────────── ACTION CONTROLS FOOTER (ONLY EDIT & DELETE & SET DEFAULT) ──────────────── */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <div>
                  {!wallet.isDefault && (
                    <button
                      onClick={() => handleSetDefault(wallet.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-gold-50 text-slate-600 hover:text-gold-800 text-xs font-medium border border-slate-200 transition-colors shadow-2xs"
                      title="Set as Default Deposit Gateway"
                    >
                      Set Default
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Edit Button */}
                  <button
                    onClick={() => openEditDrawer(wallet)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-gold-50 text-slate-700 hover:text-gold-800 text-xs font-medium border border-slate-200 transition-colors shadow-2xs"
                    title="Edit Gateway Settings"
                  >
                    <RiEditLine size={14} />
                    <span>Edit</span>
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => setWalletToDelete(wallet)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 text-xs font-medium border border-red-200 transition-colors shadow-2xs"
                    title="Delete Gateway"
                  >
                    <RiDeleteBinLine size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card p-12 text-center font-poppins">
          <p className="text-slate-400 font-normal">No gateways or bank accounts found matching your search.</p>
        </div>
      )}

      {/* ──────────────── ADD / EDIT SLIDE-OVER DRAWER ──────────────── */}
      <Modal
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={
          editingWallet
            ? `Edit ${category === 'Mobile E-Wallet' ? 'Mobile E-Wallet' : category === 'Indian Bank Account' ? 'Indian Bank' : category === 'International Bank Account' ? 'International Bank' : 'Digital Wallet'}`
            : `Add New ${category === 'Mobile E-Wallet' ? 'Mobile E-Wallet' : category === 'Indian Bank Account' ? 'Indian Bank Account' : category === 'International Bank Account' ? 'International Bank Account' : 'Digital Wallet'}`
        }
        subtitle="Configure receiving credentials, custom QR codes, and investor deposit instructions"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDrawerOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              icon={<RiCheckLine />}
              onClick={handleSaveWallet}
            >
              {editingWallet ? 'Save Changes' : 'Activate Channel'}
            </Button>
          </>
        }
      >
        <div className="space-y-4 font-poppins">
          {/* Gateway Type Selector (4 Types) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Gateway Category *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'Mobile E-Wallet', label: 'Mobile E-Wallet' },
                { id: 'Crypto Digital Wallet', label: 'Crypto Wallet' },
                { id: 'Indian Bank Account', label: 'Indian Bank' },
                { id: 'International Bank Account', label: 'International Bank' },
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`p-2.5 rounded-xl text-xs font-medium text-center border transition-all ${
                    category === cat.id
                      ? 'bg-gold-50 border-gold-400 text-gold-900 font-semibold shadow-2xs ring-1 ring-gold-300'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* ──────────────── 1. MOBILE E-WALLET (EASYPAISA / JAZZCASH / SADAPAY) ──────────────── */}
          {category === 'Mobile E-Wallet' && (
            <div className="space-y-3.5 p-4 bg-emerald-50/40 rounded-2xl border border-emerald-200/80">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <RiSmartphoneLine size={16} className="text-emerald-600" />
                Mobile E-Wallet (EasyPaisa / JazzCash / SadaPay / NayaPay)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">E-Wallet Provider *</label>
                  <select
                    value={ewalletProvider}
                    onChange={e => setEwalletProvider(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-gold-400 outline-none"
                  >
                    <option value="EasyPaisa">EasyPaisa</option>
                    <option value="JazzCash">JazzCash</option>
                    <option value="SadaPay">SadaPay</option>
                    <option value="NayaPay">NayaPay</option>
                    <option value="PayTM">PayTM</option>
                    <option value="PhonePe">PhonePe</option>
                    <option value="Google Pay">Google Pay</option>
                    <option value="Custom E-Wallet">Custom Mobile Wallet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Account Holder / Receiver Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Muhammad Ali, Horizon Agent"
                    value={ewalletAccountTitle}
                    onChange={e => setEwalletAccountTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-gold-400 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Mobile Number *</label>
                  <input
                    type="text"
                    placeholder="e.g. 0302 9845120 or +92 300 1234567"
                    value={ewalletMobileNo}
                    onChange={e => setEwalletMobileNo(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:border-gold-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">CNIC / National ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 35201-9842109-3"
                    value={ewalletCnic}
                    onChange={e => setEwalletCnic(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:border-gold-400 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Merchant Till ID / Sub-Agent Code (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Till No: 0098214"
                  value={ewalletTillId}
                  onChange={e => setEwalletTillId(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:border-gold-400 outline-none"
                />
              </div>
            </div>
          )}

          {/* ──────────────── 2. INDIAN BANK ACCOUNT FORM FIELDS ──────────────── */}
          {category === 'Indian Bank Account' && (
            <div className="space-y-3.5 p-4 bg-orange-50/40 rounded-2xl border border-orange-200/80">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <RiBuildingLine size={16} className="text-orange-600" />
                Indian Domestic Bank & UPI Details
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC Bank, State Bank of India, ICICI Bank"
                    value={indianBankName}
                    onChange={e => setIndianBankName(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-gold-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Account Holder Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Horizon Capital India Pvt Ltd"
                    value={indianHolder}
                    onChange={e => setIndianHolder(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-gold-400 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Account Number *</label>
                  <input
                    type="text"
                    placeholder="e.g. 50200084920194"
                    value={indianAccountNo}
                    onChange={e => setIndianAccountNo(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:border-gold-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">IFSC Code *</label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC0000128"
                    value={indianIfsc}
                    onChange={e => setIndianIfsc(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-mono uppercase text-slate-800 focus:border-gold-400 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Account Type</label>
                  <select
                    value={indianAccountType}
                    onChange={e => setIndianAccountType(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 focus:border-gold-400 outline-none"
                  >
                    <option value="Current Account">Current Account</option>
                    <option value="Savings Account">Savings Account</option>
                    <option value="Escrow Account">Escrow Account</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">UPI ID / VPA (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. horizoncap@hdfcbank"
                    value={indianUpiId}
                    onChange={e => setIndianUpiId(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:border-gold-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Branch Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Nariman Point, Mumbai"
                    value={indianBranch}
                    onChange={e => setIndianBranch(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-gold-400 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ──────────────── 3. INTERNATIONAL BANK ACCOUNT FORM FIELDS ──────────────── */}
          {category === 'International Bank Account' && (
            <div className="space-y-3.5 p-4 bg-indigo-50/40 rounded-2xl border border-indigo-200/80">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <RiGlobalLine size={16} className="text-indigo-600" />
                International Institutional Bank / SWIFT Wire
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. JPMorgan Chase Bank, Barclays, Standard Chartered"
                    value={intlBankName}
                    onChange={e => setIntlBankName(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-gold-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Account Holder Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Horizon Capital Global Holdings LLC"
                    value={intlHolder}
                    onChange={e => setIntlHolder(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-gold-400 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Account Number / IBAN *</label>
                  <input
                    type="text"
                    placeholder="e.g. 109288492019 or GB29NWBK60161331926819"
                    value={intlAccountNo}
                    onChange={e => setIntlAccountNo(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:border-gold-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">SWIFT / BIC Code *</label>
                  <input
                    type="text"
                    placeholder="e.g. CHASUS33XXX, BARCGB22"
                    value={intlSwift}
                    onChange={e => setIntlSwift(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-mono uppercase text-slate-800 focus:border-gold-400 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Routing / ABA / Sort Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 021000021"
                    value={intlRouting}
                    onChange={e => setIntlRouting(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:border-gold-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Account Type</label>
                  <select
                    value={intlAccountType}
                    onChange={e => setIntlAccountType(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 focus:border-gold-400 outline-none"
                  >
                    <option value="Corporate Escrow Trust">Corporate Escrow Trust</option>
                    <option value="Current Account">Current Account</option>
                    <option value="Multi-Currency Custody">Multi-Currency Custody</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Address / Country</label>
                  <input
                    type="text"
                    placeholder="e.g. 270 Park Ave, New York, USA"
                    value={intlBranch}
                    onChange={e => setIntlBranch(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-gold-400 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ──────────────── 4. CRYPTO DIGITAL WALLET FIELDS ──────────────── */}
          {category === 'Crypto Digital Wallet' && (
            <>
              {/* Wallet Display Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Wallet Display Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Primary Treasury USDT (TRC-20), Solana Treasury..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:border-gold-400 outline-none font-poppins"
                />
              </div>

              {/* Network Presets Quick Bar */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Quick Network Templates
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {[
                    { id: 'bnb', label: 'BNB Chain (BEP-20)' },
                    { id: 'solana', label: 'Solana (SPL)' },
                    { id: 'tron', label: 'TRON (TRC-20)' },
                    { id: 'eth', label: 'Ethereum (ERC-20)' },
                    { id: 'polygon', label: 'Polygon (POL)' },
                    { id: 'opbnb', label: 'opBNB (L2)' },
                  ].map(preset => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyCryptoPreset(preset.id)}
                      className="px-2.5 py-1 rounded-lg bg-gold-50 hover:bg-gold-100 text-gold-900 border border-gold-300 text-[11px] font-bold cursor-pointer transition-colors shadow-2xs font-poppins"
                    >
                      ⚡ {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Network & Chain */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Blockchain / Network *
                  </label>
                  <input
                    type="text"
                    value={network}
                    onChange={e => setNetwork(e.target.value)}
                    placeholder="e.g. BNB Smart Chain (BEP-20) or Solana Network (SPL)"
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:border-gold-400 outline-none font-poppins"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Network Short Tag (e.g. BSC, SOL, TRC20)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BSC, SOL, TRC20, ERC20"
                    value={networkCode}
                    onChange={e => setNetworkCode(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 focus:border-gold-400 outline-none font-poppins font-mono uppercase"
                  />
                </div>
              </div>

              {/* Public Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Public Receiving Address / Identifier *
                </label>
                <input
                  type="text"
                  placeholder="e.g. TX78rQw9pL29Ym82K1vNx4B8zQc12aE9mP or 0x71C..."
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-mono font-medium text-slate-800 focus:border-gold-400 outline-none font-poppins"
                />
              </div>

              {/* Memo */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Deposit Memo / Tag (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Leave blank if not required"
                  value={memo}
                  onChange={e => setMemo(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 focus:border-gold-400 outline-none font-poppins font-mono"
                />
              </div>

              {/* ──────────────── DYNAMIC SUPPORTED TOKENS & MIN DEPOSITS MANAGER ──────────────── */}
              <div className="p-4 bg-gold-50/50 rounded-2xl border border-gold-200/80 space-y-3 font-poppins">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <RiCoinsLine size={16} className="text-gold-700" />
                      Supported Tokens & Minimum Deposits (Per Token)
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Configure tokens (e.g. BNB, USDT, USDC, FDUSD) and their exact minimum deposit thresholds.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddTokenRow}
                    className="px-3 py-1.5 rounded-xl bg-gold-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-2xs hover:bg-gold-500 cursor-pointer transition-colors"
                  >
                    <RiAddLine size={14} /> Add Token
                  </button>
                </div>

                {/* Tokens Table List */}
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                    <div className="col-span-6">Token Symbol</div>
                    <div className="col-span-5">Min. Deposit Amount</div>
                    <div className="col-span-1 text-center">Del</div>
                  </div>

                  {cryptoMinDeposits.map((row, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-6">
                        <input
                          type="text"
                          value={row.token}
                          onChange={e => handleTokenRowChange(idx, 'token', e.target.value.toUpperCase())}
                          placeholder="e.g. BNB, USDT, USDC"
                          className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:border-gold-400 outline-none"
                        />
                      </div>
                      <div className="col-span-5">
                        <input
                          type="text"
                          value={row.min}
                          onChange={e => handleTokenRowChange(idx, 'min', e.target.value)}
                          placeholder="e.g. 0.004 or 5"
                          className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:border-gold-400 outline-none"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveTokenRow(idx)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Remove token row"
                        >
                          <RiDeleteBinLine size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Real-time Visual Pill Preview */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Live Investor Card Preview:
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold text-slate-500">SUPPORTED:</span>
                    {cryptoMinDeposits.filter(d => d.token).map((d, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[10px] font-mono font-bold border border-slate-200">
                        {d.token}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-mono font-bold text-slate-700 flex-wrap">
                    <span className="text-[10px] font-bold text-slate-500 font-poppins">MIN. DEPOSIT:</span>
                    {cryptoMinDeposits.filter(d => d.token).map((d, i) => (
                      <span key={i}>
                        <span className="text-slate-400 font-normal">{d.token}:</span> {d.min}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ──────────────── 5. UPLOAD CUSTOM QR CODE SECTION ──────────────── */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Upload Custom QR Code Image *
                </label>
                <p className="text-[11px] text-slate-400">Upload your official QR code image (EasyPaisa/JazzCash QR, UPI QR, or Crypto QR)</p>
              </div>

              {qrCodeUrl && (
                <button
                  type="button"
                  onClick={() => setQrCodeUrl('')}
                  className="text-xs font-medium text-red-600 hover:text-red-700 inline-flex items-center gap-1"
                >
                  <RiCloseLine size={14} /> Remove QR
                </button>
              )}
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Upload Drag/Click Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-gold-400 bg-white rounded-2xl p-4 text-center cursor-pointer transition-colors group"
            >
              {qrCodeUrl ? (
                <div className="flex items-center justify-center gap-4">
                  <div className="w-20 h-20 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                    <img src={qrCodeUrl} alt="Uploaded QR" className="w-full h-full object-cover rounded-lg" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800 group-hover:text-gold-700">QR Code Ready & Verified</p>
                    <p className="text-[11px] text-slate-400">Click to change/replace with a new QR image</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 py-2">
                  <div className="w-10 h-10 rounded-xl bg-gold-50 text-gold-700 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <RiUploadCloud2Line size={22} />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">Click to Upload QR Code Image</p>
                  <p className="text-[11px] text-slate-400">Supports PNG, JPG, WEBP, or SVG</p>
                </div>
              )}
            </div>

            {/* Or Paste Direct URL */}
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Or paste direct image URL (https://...)"
                value={qrCodeUrl}
                onChange={e => setQrCodeUrl(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 focus:border-gold-400 outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setQrCodeUrl('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300&auto=format&fit=crop')}
                className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-gold-50 text-[11px] font-medium rounded-xl whitespace-nowrap"
              >
                Sample QR
              </button>
            </div>
          </div>

          {/* Limits & Speed */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Minimum Deposit Limit
              </label>
              <input
                type="text"
                placeholder="e.g. PKR 1,500 (~$5 USD) or ₹5,000 INR"
                value={minDeposit}
                onChange={e => setMinDeposit(e.target.value)}
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 focus:border-gold-400 outline-none font-poppins"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Settlement Confirmation Speed
              </label>
              <input
                type="text"
                placeholder="e.g. Instant / 5 Minutes / 1-2 Days"
                value={confirmationTime}
                onChange={e => setConfirmationTime(e.target.value)}
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 focus:border-gold-400 outline-none font-poppins"
              />
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Investor Deposit Notice / Guidelines
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Send payment to this mobile number or scan QR code. Save transaction TRX ID as deposit proof."
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              className="w-full p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 focus:border-gold-400 outline-none font-poppins resize-none"
            />
          </div>

          {/* Default Switch */}
          <div className="flex items-center justify-between p-3.5 bg-gold-50/60 rounded-xl border border-gold-200/80">
            <div>
              <p className="text-xs font-semibold text-slate-800">Set as Primary Receiving Channel</p>
              <p className="text-[11px] text-slate-500">Show this channel as the default choice on investor portals</p>
            </div>
            <input
              type="checkbox"
              checked={isDefault}
              onChange={e => setIsDefault(e.target.checked)}
              className="w-4 h-4 text-gold-500 rounded focus:ring-gold-400 cursor-pointer"
            />
          </div>
        </div>
      </Modal>

      {/* ──────────────── HIGH-RES SCAN-TO-PAY QR CODE MODAL ──────────────── */}
      <Modal
        isOpen={!!qrModalWallet}
        onClose={() => setQrModalWallet(null)}
        title="Deposit QR Code"
        subtitle={qrModalWallet ? `${qrModalWallet.name} • ${qrModalWallet.network}` : ''}
        size="sm"
        footer={
          <Button variant="primary" onClick={() => setQrModalWallet(null)}>
            Done
          </Button>
        }
      >
        {qrModalWallet && (
          <div className="space-y-4 text-center py-2 font-poppins">
            {/* Large High-Res Uploaded QR Image Card */}
            <div className="w-52 h-52 bg-white p-3 border-2 border-gold-300 rounded-3xl mx-auto shadow-gold">
              <img
                src={qrModalWallet.qrCodeUrl}
                alt="Uploaded QR Code"
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-800 font-poppins">{qrModalWallet.name}</h4>
              <span className="inline-block text-[11px] font-bold text-gold-700 bg-gold-50 border border-gold-200 px-2.5 py-0.5 rounded-full mt-1">
                {qrModalWallet.network}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Receiving Details</p>
              <p className="text-xs font-mono font-medium text-slate-800 break-all select-all mt-0.5">
                {qrModalWallet.address}
              </p>
            </div>

            {qrModalWallet.instructions && (
              <p className="text-[11px] text-slate-500 italic">
                {qrModalWallet.instructions}
              </p>
            )}
          </div>
        )}
      </Modal>

      {/* ──────────────── DELETE WALLET CONFIRMATION MODAL ──────────────── */}
      <Modal
        isOpen={!!walletToDelete}
        onClose={() => setWalletToDelete(null)}
        title="Confirm Gateway Deletion"
        subtitle="Permanent Action"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setWalletToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" icon={<RiDeleteBinLine />} onClick={handleDeleteWallet}>
              Confirm Delete
            </Button>
          </>
        }
      >
        {walletToDelete && (
          <div className="space-y-4 text-center py-2 font-poppins">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-xs">
              <RiAlertLine size={28} />
            </div>

            <div>
              <h4 className="text-base font-semibold text-slate-800 font-poppins">
                Delete Payment Gateway?
              </h4>
              <p className="text-sm text-slate-500 mt-1 font-normal font-poppins">
                Channel <strong className="text-slate-800">{walletToDelete.name}</strong> ({walletToDelete.network}) will be permanently removed.
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* ──────────────── VIDEO TUTORIAL STUDIO MODAL ──────────────── */}
      <Modal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        title="Deposit Video Tutorial Studio"
        subtitle="Upload or link video guide shown to investors on the Deposit page"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setVideoModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              icon={<RiCheckLine />}
              onClick={handleSaveVideoTutorial}
            >
              Save & Broadcast to Users
            </Button>
          </>
        }
      >
        <div className="space-y-5 font-poppins">
          {/* Tutorial Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tutorial Video Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={videoForm.title}
              onChange={e => setVideoForm({ ...videoForm, title: e.target.value })}
              placeholder="e.g. Official Deposit Guide: How to deposit via EasyPaisa, JazzCash, Bank Transfer & Crypto"
              className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-sm font-medium text-slate-800 outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-200/60"
            />
          </div>

          {/* Subtitle / Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Guide Subtitle / Description
            </label>
            <textarea
              rows={2}
              value={videoForm.subtitle}
              onChange={e => setVideoForm({ ...videoForm, subtitle: e.target.value })}
              placeholder="Short explanation shown above video..."
              className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-normal text-slate-800 outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-200/60"
            />
          </div>

          {/* Video Source Option Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Video Source Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVideoForm({ ...videoForm, videoType: 'upload' })}
                className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                  videoForm.videoType === 'upload'
                    ? 'card-gold border-gold-400 ring-2 ring-gold-200 shadow-xs'
                    : 'card hover:border-slate-300'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-gold-100 text-gold-700 flex items-center justify-center font-bold">
                  <RiUploadCloud2Line size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Upload Video File</p>
                  <p className="text-[10px] text-slate-400">MP4, WebM, MOV from device</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setVideoForm({ ...videoForm, videoType: 'url' })}
                className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                  videoForm.videoType === 'url'
                    ? 'card-gold border-gold-400 ring-2 ring-gold-200 shadow-xs'
                    : 'card hover:border-slate-300'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold">
                  <RiYoutubeLine size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Video Link / YouTube</p>
                  <p className="text-[10px] text-slate-400">Direct MP4 or YouTube embed</p>
                </div>
              </button>
            </div>
          </div>

          {/* Conditional Video Input */}
          {videoForm.videoType === 'upload' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Upload Video File (MP4/WebM)
              </label>
              <input
                type="file"
                ref={videoFileInputRef}
                accept="video/mp4,video/webm,video/ogg,video/quicktime"
                onChange={handleVideoFileUpload}
                className="hidden"
              />
              <div
                onClick={() => videoFileInputRef.current?.click()}
                className="border-2 border-dashed border-gold-300 bg-gold-50/40 rounded-2xl p-6 text-center cursor-pointer hover:bg-gold-50/80 transition-all"
              >
                <RiFolderVideoLine size={36} className="text-gold-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800">
                  {videoForm.uploadedVideoName ? `Selected: ${videoForm.uploadedVideoName}` : 'Click to Browse Video File from Computer'}
                </p>
                <p className="text-xs text-slate-400 mt-1">Supports MP4, WebM, MOV format</p>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Direct Video MP4 URL or YouTube Link
              </label>
              <input
                type="url"
                value={videoForm.videoUrl}
                onChange={e => setVideoForm({ ...videoForm, videoUrl: e.target.value })}
                placeholder="https://example.com/videos/deposit-guide.mp4 or https://youtube.com/..."
                className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-sm font-mono text-slate-800 outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-200/60"
              />
            </div>
          )}

          {/* Live Video Preview Box */}
          {videoForm.videoUrl && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-700">Live Video Player Preview:</p>
              <div className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-md aspect-video max-h-56 w-full flex items-center justify-center">
                <video
                  src={videoForm.videoUrl}
                  controls
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}

          {/* Step-by-Step Instructions */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Step-by-Step Checklist (1 step per line)
            </label>
            <textarea
              rows={4}
              value={Array.isArray(videoForm.instructions) ? videoForm.instructions.join('\n') : videoForm.instructions}
              onChange={e => setVideoForm({ ...videoForm, instructions: e.target.value.split('\n') })}
              placeholder="1. Select gateway...&#10;2. Copy official account number...&#10;3. Submit TID / Hash"
              className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-normal text-slate-800 outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-200/60"
            />
          </div>
        </div>
      </Modal>

      {/* ──────────────── VIDEO PREVIEW MODAL ──────────────── */}
      <Modal
        isOpen={videoPreviewOpen}
        onClose={() => setVideoPreviewOpen(false)}
        title={tutorialVideo.title}
        subtitle="Investor Deposit Video Tutorial Player"
        size="lg"
        footer={
          <Button variant="primary" onClick={() => setVideoPreviewOpen(false)}>
            Close Preview
          </Button>
        }
      >
        <div className="space-y-5 font-poppins">
          <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-card aspect-video w-full flex items-center justify-center">
            <video
              src={tutorialVideo.videoUrl}
              controls
              autoPlay
              className="w-full h-full object-contain"
            />
          </div>

          <div className="p-4 rounded-xl bg-gold-50/70 border border-gold-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Step-by-Step Deposit Instructions:
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-700 font-poppins">
              {(tutorialVideo.instructions || []).map((step, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-gold-400 text-slate-950 font-extrabold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
}
