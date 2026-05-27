/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coffee, 
  ShoppingBag, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Star, 
  Search, 
  User, 
  Smartphone, 
  Tag, 
  Info, 
  PhoneCall, 
  Trash2, 
  Plus, 
  Minus, 
  X, 
  Check, 
  Compass, 
  HelpCircle, 
  AlertTriangle,
  FileText,
  Copy,
  LayoutDashboard,
  Moon,
  Sun,
  XCircle,
  Clock3,
  CheckCircle2,
  DollarSign,
  UtensilsCrossed
} from 'lucide-react';

import { MENU_ITEMS, PROMO_CODES } from './data';
import { MenuItem, CartItem, Order, PromoCode, Category, CustomizeOptions } from './types';
import CustomizeModal from './components/CustomizeModal';
import ReceiptModal from './components/ReceiptModal';
import CashierDashboard from './components/CashierDashboard';

export default function App() {
  // --- Persistent States ---
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('kopikini_menu');
    return saved ? JSON.parse(saved) : MENU_ITEMS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('kopikini_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('kopikini_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('kopikini_theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  // --- UI Layout state ---
  const [userMode, setUserMode] = useState<'customer' | 'cashier'>('customer');
  const [activeTab, setActiveTab] = useState<'home' | 'menu' | 'promo' | 'about' | 'contact'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // --- Modals State ---
  const [selectedCustomizeItem, setSelectedCustomizeItem] = useState<MenuItem | null>(null);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  
  const [activeReceiptOrder, setActiveReceiptOrder] = useState<Order | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // --- Customer Checkout Input States ---
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('03');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'QRIS'>('QRIS');
  const [cashPaidAmount, setCashPaidAmount] = useState<string>('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  // --- Effects to save to localStorage ---
  useEffect(() => {
    localStorage.setItem('kopikini_menu', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('kopikini_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('kopikini_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('kopikini_theme', themeMode);
  }, [themeMode]);

  // --- Card Item Math ---
  const getCartItemPrice = (item: CartItem) => {
    const basePrice = item.menuItem.price;
    const sizeSurplus = item.customizeOption.size === 'Large' ? 5000 : 0;
    return basePrice + sizeSurplus;
  };

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + getCartItemPrice(item) * item.quantity, 0);
  };

  const getDiscountAmount = () => {
    if (!appliedPromo) return 0;
    const subtotal = getSubtotal();
    if (subtotal < appliedPromo.minSpend) return 0;
    
    // discount capped at 25,000 IDR for maximum coupon safety
    const theoreticalDiscount = (subtotal * appliedPromo.discountPercentage) / 100;
    return Math.min(theoreticalDiscount, 25000);
  };

  const getTaxAmount = () => {
    const subtotal = getSubtotal();
    const discount = getDiscountAmount();
    // 11% PPN on the taxable amount after discount
    return Math.round((subtotal - discount) * 0.11);
  };

  const getTotal = () => {
    const subtotal = getSubtotal();
    const discount = getDiscountAmount();
    const tax = getTaxAmount();
    return Math.max(0, subtotal - discount + tax);
  };

  // --- Handlers ---
  const handleToggleTheme = () => {
    setThemeMode(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleOpenCustomize = (item: MenuItem) => {
    if (!item.isAvailable) return;
    setSelectedCustomizeItem(item);
    setIsCustomizeOpen(true);
  };

  const handleAddCustomizeToCart = (options: CustomizeOptions) => {
    if (!selectedCustomizeItem) return;
    
    // Create a unique cartId based on item + options
    const cartId = `${selectedCustomizeItem.id}-${options.size}-${options.sweetness}-${options.ice}`;
    
    setCart(prevCart => {
      const matchIndex = prevCart.findIndex(i => i.cartId === cartId);
      if (matchIndex > -1) {
        // Increment quantity if identical drink already selected
        const updated = [...prevCart];
        updated[matchIndex].quantity += 1;
        return updated;
      } else {
        // Construct new item
        return [
          ...prevCart,
          {
            cartId,
            menuItem: selectedCustomizeItem,
            quantity: 1,
            customizeOption: options
          }
        ];
      }
    });

    // Simple toast effect (can be refined visually)
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (cartId: string) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  const handleModifyQuantity = (cartId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.cartId === cartId) {
        const newQty = item.quantity + delta;
        return { ...item, quantity: Math.max(1, newQty) };
      }
      return item;
    }));
  };

  const handleApplyPromoCode = () => {
    setPromoError('');
    setPromoSuccess('');
    const sanitized = promoInput.toUpperCase().trim();
    const promo = PROMO_CODES.find(p => p.code === sanitized);

    if (!promo) {
      setPromoError('Kode voucher tidak valid.');
      return;
    }

    const subtotal = getSubtotal();
    if (subtotal < promo.minSpend) {
      setPromoError(`Minimal pembelian untuk ${promo.code} adalah Rp ${promo.minSpend.toLocaleString('id-ID')}.`);
      return;
    }

    setAppliedPromo(promo);
    setPromoSuccess(`Voucher ${promo.code} berhasil dipasang! Diskon ${promo.discountPercentage}% diaplikasikan.`);
  };

  const handleRemovePromoCode = () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoSuccess('');
    setPromoError('');
  };

  // --- Toggle Availability as Cashier ---
  const handleToggleAvailability = (id: string) => {
    setMenuItems(prev => prev.map(item => {
      if (item.id === id) {
        // Toggle isAvailable
        const updatedStatus = !item.isAvailable;
        
        // If made unavailable, remove occurrences from active cart to avoid errors!
        if (!updatedStatus) {
          setCart(prevCart => prevCart.filter(c => c.menuItem.id !== id));
        }
        
        return { ...item, isAvailable: updatedStatus };
      }
      return item;
    }));
  };

  // --- Updates status of historic orders ---
  const handleUpdateOrderStatus = (orderId: string, status: 'pending' | 'completed' | 'cancelled') => {
    setOrders(prev => prev.map(o => {
      if (o.orderId === orderId) {
        return { ...o, status };
      }
      return o;
    }));
  };

  // --- Process Payment / Invoice Submit ---
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert('Keranjang Anda kosong!');
      return;
    }

    const subtotal = getSubtotal();
    const discount = getDiscountAmount();
    const tax = getTaxAmount();
    const totalPay = getTotal();

    // Cash validation check
    let parsedCashPaid = totalPay;
    if (paymentMethod === 'Cash') {
      parsedCashPaid = parseFloat(cashPaidAmount.replace(/[^0-9]/g, '')) || 0;
      if (parsedCashPaid < totalPay) {
        alert('Jumlah uang tunai yang dibayarkan kurang dari total pembayaran!');
        return;
      }
    }

    // Generate Invoice ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `INV-${randomSuffix}`;
    const orderId = `order_${Date.now()}_${randomSuffix}`;

    const newOrder: Order = {
      orderId,
      invoiceNumber,
      customerName: customerName.trim() || 'Pelanggan Walk-In',
      tableNumber: tableNumber === 'Takeaway' ? 'Takeaway' : `#${tableNumber}`,
      items: [...cart],
      subtotal,
      tax,
      discount,
      total: totalPay,
      paymentMethod,
      cashAmountPaid: paymentMethod === 'Cash' ? parsedCashPaid : undefined,
      changeAmount: paymentMethod === 'Cash' ? (parsedCashPaid - totalPay) : undefined,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    // Save to orders list, reset cart, clear forms, show success receipt!
    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
    setCustomerName('');
    setCashPaidAmount('');
    setAppliedPromo(null);
    setPromoInput('');
    setIsCartOpen(false);

    // Open receipt modal!
    setActiveReceiptOrder(newOrder);
    setIsReceiptOpen(true);
  };

  // --- Preloaded categories for slider menu ---
  const filteredProducts = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate dynamic change amount for customer preview
  const liveChangeAmount = () => {
    const totalVal = getTotal();
    const inputVal = parseFloat(cashPaidAmount.replace(/[^0-9]/g, '')) || 0;
    return Math.max(0, inputVal - totalVal);
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans border-0 outline-0 ${
      themeMode === 'dark' 
        ? 'bg-brand-cozy-dark text-stone-100' 
        : 'bg-brand-cream-light text-stone-800'
    }`}>
      {/* BACKGROUND DECORATIONS (WARM BLUR GLOW COZY FEEL) */}
      <div className="fixed top-0 inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[10%] left-[5%] w-[40vw] h-[40vw] max-w-[500px] rounded-full bg-orange-950/20 blur-[120px] opacity-70" />
        <div className="absolute bottom-[10%] right-[10%] w-[35vw] h-[35vw] max-w-[450px] rounded-full bg-amber-950/20 blur-[100px] opacity-60" />
      </div>

      {/* HEADER NAVBAR */}
      <nav id="navbar-main" className={`sticky top-0 z-40 transition-all border-b ${
        themeMode === 'dark' 
          ? 'bg-brand-cozy-dark/85 border-amber-950/20 backdrop-blur-md' 
          : 'bg-brand-cream-light/90 border-stone-200/60 backdrop-blur-md'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* LOGO */}
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-600 to-amber-900 shadow-lg text-white">
                <Coffee size={24} className="animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-black font-sans tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-700">
                  KOPIKINI
                </h1>
                <p className="text-[9px] font-bold text-stone-400 tracking-widest uppercase leading-none">Coffee Shop & POS</p>
              </div>
            </div>

            {/* MAIN NAVIGATION (CUSTOMER OPTIONS) */}
            <div className="hidden md:flex items-center gap-1.5 bg-stone-900/5 dark:bg-stone-950/40 p-1.5 rounded-full border border-stone-800/10 dark:border-stone-800/40">
              {(['home', 'menu', 'promo', 'about', 'contact'] as const).map((tab) => (
                <button
                  id={`nav-tab-${tab}`}
                  key={tab}
                  onClick={() => {
                    setUserMode('customer');
                    setActiveTab(tab);
                  }}
                  className={`px-5 py-2 text-xs font-bold rounded-full uppercase tracking-wider transition ${
                    userMode === 'customer' && activeTab === tab
                      ? 'bg-amber-800 text-amber-50 shadow-md shadow-amber-950/30 font-extrabold'
                      : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-100 hover:bg-stone-500/10'
                  }`}
                >
                  {tab === 'home' && 'Beranda'}
                  {tab === 'menu' && 'Daftar Menu'}
                  {tab === 'promo' && 'Kupon Promo'}
                  {tab === 'about' && 'Tentang Kami'}
                  {tab === 'contact' && 'Kontak'}
                </button>
              ))}
            </div>

            {/* ACTION TRIGGERS */}
            <div className="flex items-center gap-3">
              
              {/* Theme Toggle */}
              <button
                id="btn-theme-toggle"
                onClick={handleToggleTheme}
                aria-label="Toggle Theme"
                className={`p-2.5 rounded-xl border transition cursor-pointer ${
                  themeMode === 'dark'
                    ? 'bg-stone-900/40 border-stone-800 text-yellow-500 hover:bg-stone-800'
                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                {themeMode === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
              </button>

              {/* Shopping Cart Button */}
              <button
                id="btn-cart-toggle"
                onClick={() => setIsCartOpen(!isCartOpen)}
                className={`relative p-2.5 rounded-xl border transition flex items-center gap-2 cursor-pointer ${
                  themeMode === 'dark'
                    ? 'bg-stone-900/40 border-stone-800 text-amber-400 hover:bg-stone-800'
                    : 'bg-white border-stone-200 text-amber-700 hover:bg-stone-50'
                }`}
              >
                <ShoppingBag size={17} />
                {cart.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-md animate-bounce">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
                <span className="hidden sm:inline text-xs font-bold font-sans">Keranjang</span>
              </button>

              {/* MODE TOGGLER: CUSTOMER VS PROFESSIONAL CASHIER POS */}
              <button
                id="btn-mode-toggle"
                onClick={() => {
                  if (userMode === 'customer') {
                    setUserMode('cashier');
                  } else {
                    setUserMode('customer');
                    setActiveTab('home');
                  }
                }}
                className={`px-4 py-2.5 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md ${
                  userMode === 'cashier'
                    ? 'bg-gradient-to-r from-amber-600 to-amber-800 text-white border-amber-600 shadow-amber-950/20'
                    : 'bg-stone-950/40 border-stone-800/80 text-stone-400 hover:text-stone-200'
                }`}
              >
                <LayoutDashboard size={14} />
                <span>{userMode === 'cashier' ? 'Kasir POS On' : 'Ubah ke Kasir'}</span>
              </button>

            </div>
          </div>
        </div>
      </nav>

      {/* RENDER BODY CONTENTS */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 z-10">
        
        {/* ======================================================= */}
        {/* 1. PROFESSIONAL CASHIER POS VIEW */}
        {/* ======================================================= */}
        {userMode === 'cashier' ? (
          <motion.div
            id="view-cashier-pos"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Header banner */}
            <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-amber-900/35 via-stone-900/40 to-stone-950/50 border border-amber-500/10 shadow-2xl relative overflow-hidden backdrop-blur-md">
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <span className="px-3 py-1 font-bold font-mono tracking-widest text-[9px] text-amber-400 bg-amber-950/60 rounded-full border border-amber-500/15 uppercase">
                    Administrasi Coffee Shop
                  </span>
                  <h1 className="text-3xl font-extrabold font-sans text-white">Dashboard Portal Kasir</h1>
                  <p className="text-xs text-stone-400">Kelola operasional KopiKini secara hands-on. Atur persediaan menu dan lacak arus keuangan harian.</p>
                </div>
                
                {/* Back to Customer Menu Shortcut */}
                <button
                  id="btn-back-to-menu-pos"
                  onClick={() => {
                    setUserMode('customer');
                    setActiveTab('menu');
                  }}
                  className="px-5 py-3 rounded-2xl bg-white text-stone-950 font-bold hover:bg-stone-100 transition text-xs shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <Coffee size={14} className="text-amber-800" />
                  <span>Buka Menu Pemesanan</span>
                </button>
              </div>
            </div>

            {/* Core analytics page */}
            <CashierDashboard
              orders={orders}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              menuItems={menuItems}
              onToggleAvailability={handleToggleAvailability}
              onViewOrder={(ord) => {
                setActiveReceiptOrder(ord);
                setIsReceiptOpen(true);
              }}
            />

          </motion.div>
        ) : (
          /* ======================================================= */
          /* 2. CUSTOMER / ORDERING VIEW SYSTEM */
          /* ======================================================= */
          <div className="space-y-16">
            
            {/* ACTIVE TAB: HOME */}
            {activeTab === 'home' && (
              <motion.div
                id="view-home"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-16"
              >
                {/* HERO SECTION */}
                <div className="relative rounded-3xl overflow-hidden min-h-[500px] flex items-center p-6 md:p-12 lg:p-16 border border-amber-990/10 shadow-2xl">
                  {/* Hero background image */}
                  <div className="absolute inset-0 z-0">
                    <img
                      src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1920&auto=format&fit=crop"
                      alt="Atmospheric warm cafe bar"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover scale-102 hover:scale-105 duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/80 to-stone-950/20 opacity-85" />
                  </div>

                  {/* Hero content */}
                  <div className="relative z-10 max-w-xl space-y-6">
                    <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-amber-400 bg-amber-950/60 border border-amber-500/20 rounded-full backdrop-blur-md">
                      <Clock3 size={11} className="text-amber-400" />
                      <span>Jam Buka: 08.00 - 22.00 WIB</span>
                    </span>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight">
                      Fresh Coffee Everyday, <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-700 font-sans font-black italic">
                        Handcrafted with Love.
                      </span>
                    </h1>
                    <p className="text-sm text-stone-300 leading-relaxed font-sans font-light">
                      Sensasi kopi otentik Jepang minimalis dipadukan dengan kenyamanan modern. Kami menyeduh setiap cangkir dengan presisi ekstrem menggunakan biji kopi arabika pilihan Nusantara.
                    </p>
                    
                    <div className="flex flex-wrap gap-4 pt-2">
                      <button
                        id="btn-hero-order"
                        onClick={() => setActiveTab('menu')}
                        className="px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 font-bold hover:shadow-lg hover:shadow-amber-500/20 text-stone-950 hover:text-black transition active:scale-95 flex items-center gap-2 cursor-pointer text-sm"
                      >
                        <span>Pesan Sekarang</span>
                        <ChevronRight size={16} />
                      </button>
                      <button
                        id="btn-hero-promo"
                        onClick={() => setActiveTab('promo')}
                        className="px-6 py-4 rounded-2xl bg-stone-900/60 border border-stone-850 hover:bg-stone-800 text-stone-200 hover:text-white transition text-sm cursor-pointer"
                      >
                        Lihat Kupon Promo
                      </button>
                    </div>
                  </div>
                </div>

                {/* DYNAMIC PROMO SLIDER SECTION */}
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <h2 className="text-2xl font-bold font-serif text-amber-500">Penawaran Menarik Minggu Ini</h2>
                      <p className="text-xs text-stone-400 mt-1">Gunakan kode kupon di bawah saat checkout dan nikmati potongan harga kopi eksklusif.</p>
                    </div>
                    <button
                      id="btn-more-promos"
                      onClick={() => setActiveTab('promo')}
                      className="text-xs font-bold text-amber-600 hover:text-amber-500 flex items-center gap-1 transition"
                    >
                      <span>Semua Kupon ({PROMO_CODES.length})</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {PROMO_CODES.slice(0, 4).map((promo) => (
                      <div
                        id={`promo-${promo.code}`}
                        key={promo.code}
                        className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 shadow-xl relative overflow-hidden backdrop-blur-md transition-all ${
                          themeMode === 'dark' 
                            ? 'glass-card-dark border-amber-950/20' 
                            : 'glass-card-light'
                        }`}
                      >
                        <div className="absolute top-0 right-0 h-16 w-16 opacity-5 pointer-events-none translate-x-4 -translate-y-4">
                          <Tag size={64} className="text-amber-500" />
                        </div>
                        <div className="space-y-1">
                          <div className="px-2.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-500/10 text-[9px] font-bold tracking-widest uppercase inline-block font-mono">
                            Diskon {promo.discountPercentage}%
                          </div>
                          <h3 className="text-sm font-bold text-white line-clamp-1">{promo.code}</h3>
                          <p className="text-[10px] text-stone-400 line-clamp-2">{promo.description}</p>
                        </div>
                        <button
                          id={`copy-code-${promo.code}`}
                          onClick={() => {
                            setPromoInput(promo.code);
                            setAppliedPromo(promo);
                            alert(`Voucher ${promo.code} otomatis terpasang di keranjang checkout!`);
                          }}
                          className="w-full text-center py-2 bg-stone-950 hover:bg-stone-900 border border-stone-800 hover:border-amber-500/30 rounded-xl text-[10px] font-bold text-amber-400 transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Copy size={11} />
                          <span>Pasang Voucher</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* POPULAR PRODUCTS CARDS Row */}
                <div className="space-y-5">
                  <div className="flex justify-between items-end">
                    <div>
                      <h2 className="text-2xl font-bold font-serif text-amber-500">Popular Signature Cups</h2>
                      <p className="text-xs text-stone-400 mt-1 font-sans">Kreasi terlaris barista handal KopiKini yang paling dicari para penikmat kopi.</p>
                    </div>
                    <button
                      id="btn-all-menu"
                      onClick={() => {
                        setSelectedCategory('All');
                        setActiveTab('menu');
                      }}
                      className="text-xs font-bold text-amber-600 hover:text-amber-500 flex items-center gap-1 transition"
                    >
                      <span>Lihat Seluruh Menu</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {menuItems.filter(p => p.isPopular).slice(0, 4).map((p) => (
                      <div
                        id={`popular-item-${p.id}`}
                        key={p.id}
                        className={`group rounded-3xl overflow-hidden shadow-xl border flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-1.5 ${
                          themeMode === 'dark' 
                            ? 'bg-amber-950/20 dark:bg-stone-900/40 border-amber-950/15' 
                            : 'bg-white border-stone-200'
                        }`}
                      >
                        {/* Img wrapper with overlay */}
                        <div className="relative h-48 w-full overflow-hidden">
                          <img
                            src={p.image}
                            alt={p.name}
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute top-3 left-3 flex justify-between items-center w-[calc(100%-24px)] pointer-events-none">
                            <span className="px-2.5 py-0.5 text-[9px] font-semibold text-amber-300 bg-amber-950/80 border border-amber-500/20 rounded-full font-mono uppercase tracking-wider backdrop-blur-sm">
                              {p.category}
                            </span>
                            <span className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-semibold text-stone-900 bg-amber-400 rounded-full font-sans tracking-wide">
                              <Star size={10} fill="currentColor" />
                              <span>{p.rating}</span>
                            </span>
                          </div>
                          {!p.isAvailable && (
                            <div className="absolute inset-0 bg-neutral-900/80 flex items-center justify-center backdrop-blur-xs">
                              <span className="px-4 py-2 bg-red-800 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg border border-red-500/25 rotate-[-5deg]">
                                Sold Out / Habis
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Text */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-1">
                            <h3 className="font-bold text-base text-stone-100 group-hover:text-amber-400 transition-colors line-clamp-1">
                              {p.name}
                            </h3>
                            <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed font-sans">{p.description}</p>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className="font-sans font-black text-amber-500 text-base">
                              Rp {p.price.toLocaleString('id-ID')}
                            </span>

                            <button
                              id={`add-popular-${p.id}`}
                              onClick={() => {
                                if (p.isAvailable) handleOpenCustomize(p);
                              }}
                              disabled={!p.isAvailable}
                              className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase transition flex items-center gap-1 cursor-pointer ${
                                p.isAvailable
                                  ? 'bg-amber-600 hover:bg-amber-500 text-stone-950 hover:text-black shadow shadow-amber-950/20'
                                  : 'bg-stone-800 text-stone-500 cursor-not-allowed border-stone-800'
                              }`}
                            >
                              <span>Tambah</span>
                              <Plus size={10} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>
            )}

            {/* ACTIVE TAB: MENU */}
            {activeTab === 'menu' && (
              <motion.div
                id="view-menu"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                {/* Search and Category Filter Headers */}
                <div className={`p-6 rounded-3xl border ${
                  themeMode === 'dark' 
                    ? 'bg-stone-900/35 border-stone-850/60 backdrop-blur-md' 
                    : 'bg-white border-stone-200'
                } flex flex-col md:flex-row justify-between items-center gap-6`}>
                  
                  {/* Category sliders */}
                  <div className="flex flex-wrap gap-1 bg-stone-950/20 p-1 rounded-2xl border border-stone-800/10 dark:border-stone-800/50">
                    {(['All', 'Coffee', 'Non Coffee', 'Tea', 'Dessert', 'Snack'] as const).map((cat) => (
                      <button
                        id={`menu-cat-${cat.replace(' ', '-')}`}
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          selectedCategory === cat
                            ? 'bg-amber-800 text-amber-50 shadow font-extrabold'
                            : 'text-stone-400 hover:text-stone-100'
                        }`}
                      >
                        {cat === 'All' && <Compass size={13} />}
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Realtime Search bar */}
                  <div className="relative w-full md:max-w-xs">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 h-4 w-4" />
                    <input
                      id="search-menu-input"
                      type="text"
                      placeholder="Cari kopi, matcha, kue..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 transition ${
                        themeMode === 'dark'
                          ? 'bg-stone-950 border-stone-800 text-white placeholder-stone-500'
                          : 'bg-stone-100 border-stone-200 text-stone-900 placeholder-stone-400'
                      }`}
                    />
                    {searchQuery && (
                      <button
                        id="clear-search"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                </div>

                {/* Grid of Menus */}
                {filteredProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-stone-500 space-y-3 font-sans">
                    <AlertTriangle size={40} className="text-amber-500 animate-bounce" />
                    <h3 className="text-base font-bold">Tidak menemukan menu coffee yang cocok.</h3>
                    <p className="text-xs text-stone-400">Silakan ganti kata kunci pencarian atau bersihkan filter.</p>
                    <button
                      id="btn-reset-filters"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('All');
                      }}
                      className="px-4 py-2 mt-2 bg-amber-800 text-stone-100 text-xs font-bold rounded-xl"
                    >
                      Reset Filter
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredProducts.map((p) => (
                      <div
                        id={`menu-card-${p.id}`}
                        key={p.id}
                        className={`group rounded-3xl overflow-hidden shadow-xl border flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-1 ${
                          themeMode === 'dark' 
                            ? 'bg-amber-950/20 dark:bg-stone-900/40 border-amber-950/15' 
                            : 'bg-white border-stone-200'
                        }`}
                      >
                        {/* Image banner with tags */}
                        <div className="relative h-44 w-full overflow-hidden">
                          <img
                            src={p.image}
                            alt={p.name}
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute top-3 left-3 flex justify-between items-center w-[calc(100%-24px)] pointer-events-none">
                            <span className="px-2.5 py-0.5 text-[9px] font-semibold text-amber-300 bg-amber-950/80 border border-amber-500/20 rounded-full font-mono uppercase tracking-wider backdrop-blur-sm">
                              {p.category}
                            </span>
                            <span className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-semibold text-stone-900 bg-amber-400 rounded-full font-sans tracking-wide">
                              <Star size={10} fill="currentColor" />
                              <span>{p.rating}</span>
                            </span>
                          </div>
                          {!p.isAvailable && (
                            <div className="absolute inset-0 bg-neutral-900/80 flex items-center justify-center backdrop-blur-xs">
                              <span className="px-4 py-2 bg-red-800 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg border border-red-500/25 rotate-[-5deg]">
                                Sold Out / Habis
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Description contents */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-1">
                            <h3 className="font-bold text-base text-stone-100 group-hover:text-amber-400 transition-colors line-clamp-1">
                              {p.name}
                            </h3>
                            <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed font-sans">{p.description}</p>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className="font-sans font-black text-amber-500 text-base">
                              Rp {p.price.toLocaleString('id-ID')}
                            </span>

                            <button
                              id={`add-menu-cart-${p.id}`}
                              onClick={() => {
                                if (p.isAvailable) handleOpenCustomize(p);
                              }}
                              disabled={!p.isAvailable}
                              className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase transition flex items-center gap-1 cursor-pointer ${
                                p.isAvailable
                                  ? 'bg-amber-600 hover:bg-amber-500 text-stone-950 hover:text-black shadow shadow-amber-950/20'
                                  : 'bg-stone-800 text-stone-500 cursor-not-allowed border-stone-800'
                              }`}
                            >
                              <span>Tambah</span>
                              <Plus size={10} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ACTIVE TAB: PROMO */}
            {activeTab === 'promo' && (
              <motion.div
                id="view-promo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                {/* Banner header */}
                <div className="p-8 rounded-3xl bg-amber-950/20 border border-amber-500/10 shadow-xl backdrop-blur-md text-center max-w-4xl mx-auto space-y-3">
                  <Tag className="mx-auto text-amber-500 h-10 w-10 animate-pulse" />
                  <h2 className="text-2xl font-bold font-serif text-white">Voucher Kopi & Kudapan Spesial</h2>
                  <p className="text-xs text-stone-400 max-w-lg mx-auto">
                    Dapatkan potongan harga menarik hingga 25% setiap transaksi coffee shop Anda. Cukup klik pasang di bawah ini untuk menggunakannya di keranjang kasir belanja digital Anda!
                  </p>
                </div>

                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                  {PROMO_CODES.map((promo) => (
                    <div
                      id={`promo-page-card-${promo.code}`}
                      key={promo.code}
                      className={`p-6 rounded-3xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl relative overflow-hidden backdrop-blur-md transition-all ${
                        themeMode === 'dark' 
                          ? 'glass-card-dark border-amber-950/20 hover:border-amber-500/25' 
                          : 'glass-card-light hover:border-stone-400/30'
                      }`}
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded bg-amber-950 text-amber-400 border border-amber-500/10 text-xs font-bold tracking-wider font-mono">
                            Diskon {promo.discountPercentage}%
                          </span>
                          {promo.minSpend > 0 ? (
                            <span className="text-[10px] text-stone-500 font-mono">Min. Belanja: Rp {promo.minSpend.toLocaleString('id-ID')}</span>
                          ) : (
                            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/40 px-1.5 rounded uppercase font-mono border border-emerald-500/10">No Min. Spend</span>
                          )}
                        </div>
                        <h3 className="text-base font-extrabold text-white">{promo.code}</h3>
                        <p className="text-xs text-stone-400 leading-relaxed font-sans">{promo.description}</p>
                      </div>

                      <button
                        id={`install-promo-code-${promo.code}`}
                        onClick={() => {
                          setPromoInput(promo.code);
                          setAppliedPromo(promo);
                          alert(`Sip! Kupon ${promo.code} berhasil dipasang.`);
                        }}
                        className="px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 hover:text-black font-extrabold text-xs transition cursor-pointer flex items-center gap-1.5 shrink-0 w-full md:w-auto justify-center"
                      >
                        <Copy size={12} />
                        <span>Gunakan Kupon</span>
                      </button>
                    </div>
                  ))}
                </div>

              </motion.div>
            )}

            {/* ACTIVE TAB: ABOUT */}
            {activeTab === 'about' && (
              <motion.div
                id="view-about"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-4xl mx-auto space-y-12"
              >
                {/* Visual Image Banner */}
                <div className="h-64 rounded-3xl overflow-hidden relative border border-stone-800">
                  <img
                    src="https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=1200"
                    alt="Espresso extraction from portafilter"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-stone-950/80 backdrop-grayscale-md" />
                  <div className="absolute inset-x-6 bottom-6 text-center space-y-1">
                    <h2 className="text-2xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-700">KopiKini Story</h2>
                    <p className="text-xs text-stone-300">Menyajikan Kopi Premium Nusantara dengan Konsep Estetika Cafe Jepang Minimalis</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans text-sm leading-relaxed text-stone-300">
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white font-serif flex items-center gap-2">
                      <Coffee className="text-amber-500" />
                      <span>Filosofi Menyeduh Kami</span>
                    </h3>
                    <p>
                      Berdiri sejak awal tahun 2024, KopiKini didirikan atas dasar kecintaan yang mendalam terhadap seni kopi spesialti (specialty coffee) dan kesederhanaan desain ala Jepang. Kami percaya bahwa secangkir kopi yang sempurna berawal dari perjalanan yang jujur: dari tangan para petani lokal hebat hingga disajikan hangat ke meja Anda.
                    </p>
                    <p>
                      Biji kopi kami adalah arabika 100% yang disangrai dengan profil sedang-ke-gelap guna menonjolkan keunikan rasa cokelat manis alami dan karamel hangat yang kaya tanpa keasaman berlebih.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white font-serif flex items-center gap-2">
                      <MapPin className="text-amber-500" />
                      <span>Bahan Baku Premium Alami</span>
                    </h3>
                    <p>
                      Kami menolak penggunaan perasa buatan atau sirup sintetis yang berlebihan. Alih-alih demikian, KopiKini mengandalkan bahan-bahan alami paling segar demi menjaga kualitas rasa:
                    </p>
                    <ul className="space-y-2 pl-4 list-disc text-stone-400 text-xs text-left">
                      <li><strong className="text-amber-400">Gula Aren Organik Sukabumi:</strong> Memberikan aroma nira gurih dan lembut yang khas.</li>
                      <li><strong className="text-amber-400">Matcha Kyoto Stoneground:</strong> Bubuk matcha murni kelas upacara langsung dari Kyoto, Jepang.</li>
                      <li><strong className="text-amber-400">Madu Bunga Manuka Selandia Baru:</strong> Pengganti manis alami yang murni untuk memperkuat stamina tubuh.</li>
                    </ul>
                  </div>
                </div>

              </motion.div>
            )}

            {/* ACTIVE TAB: CONTACT */}
            {activeTab === 'contact' && (
              <motion.div
                id="view-contact"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8"
              >
                {/* Left side Metadata Info (5 cols) */}
                <div className="md:col-span-5 space-y-6">
                  <div className="p-6 rounded-3xl border border-stone-850 bg-stone-900/40 space-y-4">
                    <h3 className="text-base font-bold text-white font-serif pb-2 border-b border-stone-800">Kontak & Lokasi Cafe</h3>
                    
                    <div className="space-y-3.5 text-xs text-stone-300">
                      <div className="flex gap-2.5 items-start">
                        <MapPin className="text-amber-500 shrink-0 h-4.5 w-4.5" />
                        <div>
                          <p className="font-bold text-white mb-0.5">Alamat KopiKini:</p>
                          <p className="text-stone-400 leading-tight">Sena Cozy Lane No. 42, Senopati, Kebayoran Baru, Jakarta Selatan, 12190</p>
                        </div>
                      </div>

                      <div className="flex gap-2.5 items-start">
                        <PhoneCall className="text-amber-500 shrink-0 h-4.5 w-4.5" />
                        <div>
                          <p className="font-bold text-white mb-0.5">Telepon Call Center:</p>
                          <p className="text-stone-400">(021) 888 - 5642</p>
                        </div>
                      </div>

                      <div className="flex gap-2.5 items-start">
                        <Clock className="text-amber-500 shrink-0 h-4.5 w-4.5" />
                        <div>
                          <p className="font-bold text-white mb-0.5">Jam Operasional:</p>
                          <p className="text-stone-400">Senin - Minggu: 08:00 - 22:00 WIB</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fun alert */}
                  <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/10 text-xs text-amber-300 flex items-start gap-2.5 leading-relaxed">
                    <Info size={16} className="shrink-0 mt-0.5" />
                    <p>Sistem ini terintegrasi penuh. Pesanan manual dari digital menu langsung masuk ke monitoring panel barista kasir secara real-time.</p>
                  </div>
                </div>

                {/* Right side contact form simulated (7 cols) */}
                <div className="md:col-span-7 p-6 md:p-8 rounded-3xl border border-stone-850 bg-stone-900/40 relative overflow-hidden space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white font-serif">Kritik & Saran Pelanggan</h3>
                    <p className="text-xs text-stone-400 mt-1">Kami sangat menghargai suara Anda. Kirimkan pesan atau ajukan kerja sama katering bisnis di bawah ini.</p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      alert('Terima kasih atas pesan Anda! Barista KopiKini akan menghubungi Anda secepatnya.');
                      (e.target as HTMLFormElement).reset();
                    }}
                    className="space-y-4 text-xs"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-stone-300 font-semibold uppercase tracking-wider block">Nama Anda</label>
                        <input
                          type="text"
                          required
                          placeholder="Budi Santoso"
                          className="w-full p-3.5 bg-stone-950 border border-stone-800 text-stone-100 rounded-xl focus:ring-1 focus:ring-amber-500 outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-stone-300 font-semibold uppercase tracking-wider block">Email Aktif</label>
                        <input
                          type="email"
                          required
                          placeholder="budi@email.com"
                          className="w-full p-3.5 bg-stone-950 border border-stone-800 text-stone-100 rounded-xl focus:ring-1 focus:ring-amber-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-stone-300 font-semibold uppercase tracking-wider block">Subjek Pesan</label>
                      <input
                        type="text"
                        placeholder="Pertanyaan Kerja Sama, Feedback Rasa, dll."
                        className="w-full p-3.5 bg-stone-950 border border-stone-800 text-stone-100 rounded-xl focus:ring-1 focus:ring-amber-500 outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-stone-300 font-semibold uppercase tracking-wider block">Isi Pesan Lengkap</label>
                      <textarea
                        rows={4}
                        required
                        placeholder="Hai KopiKini, rasa Es Kopi Susu Aren hari ini sungguh luar biasa creamy!"
                        className="w-full p-3.5 bg-stone-950 border border-stone-800 text-stone-100 rounded-xl focus:ring-1 focus:ring-amber-500 outline-none resize-none leading-relaxed"
                      />
                    </div>

                    <button
                      id="btn-submit-contact"
                      type="submit"
                      className="w-full py-3.5 px-4 rounded-xl bg-amber-700 hover:bg-amber-600 font-bold text-white transition cursor-pointer text-center"
                    >
                      Kirim Pesan Ke Cafe
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

          </div>
        )}

      </main>

      {/* FOOTER SECTION */}
      <footer id="footer-main" className={`mt-24 py-12 border-t ${
        themeMode === 'dark' 
          ? 'bg-stone-950/40 border-stone-900 text-stone-400' 
          : 'bg-stone-100 border-stone-200 text-stone-600'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 to-amber-900 text-white">
              <Coffee size={16} />
            </div>
            <div>
              <p className="font-extrabold text-sm text-stone-200 uppercase tracking-widest leading-none">KopiKini Cafe POS</p>
              <p className="text-[10px] text-stone-500 mt-1">© 2026 KopiKini Coffee. All Rights Reserved.</p>
            </div>
          </div>

          <div className="flex gap-4 text-xs font-semibold">
            <button id="foot-btn-home" onClick={() => { setUserMode('customer'); setActiveTab('home'); }} className="hover:text-amber-500 transition">Beranda</button>
            <button id="foot-btn-menu" onClick={() => { setUserMode('customer'); setActiveTab('menu'); }} className="hover:text-amber-500 transition">Menu</button>
            <button id="foot-btn-promo" onClick={() => { setUserMode('customer'); setActiveTab('promo'); }} className="hover:text-amber-500 transition">Promo</button>
            <button id="foot-btn-cashier" onClick={() => setUserMode('cashier')} className="text-amber-500 hover:text-amber-400 font-bold transition">Kasir POS</button>
          </div>
        </div>
      </footer>


      {/* ======================================================= */}
      {/* 3. SIDE TRANSLATIONAL SHOPPING CART DRAWER (GLASSMORPHISM) */}
      {/* ======================================================= */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden font-sans">
            {/* Backdrop */}
            <motion.div
              id="cart-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-neutral-950/70 backdrop-blur-sm"
            />

            {/* Slider Sheet */}
            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                id="cart-sheet"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 24, stiffness: 220 }}
                className={`w-screen max-w-md flex flex-col justify-between shadow-2xl overflow-y-auto border-l ${
                  themeMode === 'dark' 
                    ? 'bg-stone-900 border-amber-950/20 text-stone-100' 
                    : 'bg-white border-stone-200 text-stone-900'
                }`}
              >
                {/* Drawer Header */}
                <div className="p-6 border-b border-stone-800/60 dark:border-stone-800 flex justify-between items-center bg-stone-950/20">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="text-amber-500 h-5 w-5" />
                    <h2 className="text-lg font-black font-sans uppercase tracking-wider">Kasir Keranjang Belanja</h2>
                    <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 text-[10px] font-black font-mono">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  </div>
                  <button
                    id="btn-close-cart"
                    onClick={() => setIsCartOpen(false)}
                    className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Drawer Item List */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-stone-500 space-y-3">
                      <ShoppingBag size={48} className="text-stone-700 animate-pulse" />
                      <p className="text-sm font-medium">Keranjang belanja Anda kosong.</p>
                      <button
                        id="btn-fill-cart-shortcut"
                        onClick={() => {
                          setIsCartOpen(false);
                          setActiveTab('menu');
                        }}
                        className="px-4 py-2 mt-1 bg-amber-700 hover:bg-amber-600 font-bold text-stone-100 rounded-xl text-xs transition active:scale-95"
                      >
                        Mulai Cari Kopi
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {cart.map((item, idx) => {
                        const calculatedItemPrice = getCartItemPrice(item);
                        return (
                          <div
                            id={`cart-item-row-${item.cartId}`}
                            key={item.cartId}
                            className={`p-3 rounded-2xl border flex items-center justify-between gap-3.5 ${
                              themeMode === 'dark'
                                ? 'bg-stone-950/40 border-stone-850'
                                : 'bg-stone-100 border-stone-200'
                            }`}
                          >
                            <img
                              src={item.menuItem.image}
                              alt={item.menuItem.name}
                              referrerPolicy="no-referrer"
                              className="h-12 w-12 rounded-xl object-cover shrink-0 border border-stone-800/20"
                            />

                            <div className="flex-1 space-y-0.5 min-w-0">
                              <h4 className="text-xs font-bold leading-tight line-clamp-1">{item.menuItem.name}</h4>
                              <p className="text-[10px] text-stone-500 font-mono truncate">
                                Sz: {item.customizeOption.size} | Sweet: {item.customizeOption.sweetness} | Ice: {item.customizeOption.ice}
                              </p>
                              <p className="text-xs font-black text-amber-500">
                                Rp {calculatedItemPrice.toLocaleString('id-ID')}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Quantity Changer */}
                              <div className="flex items-center bg-stone-950 rounded-xl border border-stone-800 p-0.5">
                                <button
                                  id={`qty-dec-${item.cartId}`}
                                  onClick={() => handleModifyQuantity(item.cartId, -1)}
                                  className="p-1 text-stone-400 hover:text-white transition rounded-lg hover:bg-stone-900"
                                >
                                  <Minus size={11} />
                                </button>
                                <span className="px-2 text-xs font-bold font-mono min-w-[20px] text-center">{item.quantity}</span>
                                <button
                                  id={`qty-inc-${item.cartId}`}
                                  onClick={() => handleModifyQuantity(item.cartId, 1)}
                                  className="p-1 text-stone-400 hover:text-white transition rounded-lg hover:bg-stone-900"
                                >
                                  <Plus size={11} />
                                </button>
                              </div>

                              {/* Delete button */}
                              <button
                                id={`qty-del-${item.cartId}`}
                                onClick={() => handleRemoveFromCart(item.cartId)}
                                className="p-2 bg-rose-950/40 hover:bg-rose-900 text-rose-500 rounded-xl transition-colors border border-rose-500/10"
                                title="Hapus dari keranjang"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Submittable Checkout Form Header panel */}
                {cart.length > 0 && (
                  <div className="p-6 border-t border-stone-800/80 space-y-5 bg-stone-950/60 backdrop-blur">
                    
                    {/* Promo Code Inline Form */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">Kupon Diskon</label>
                        {appliedPromo && (
                          <button
                            id="btn-remove-code-cart"
                            onClick={handleRemovePromoCode}
                            className="text-[10px] text-rose-400 hover:text-rose-300 font-bold transition flex items-center gap-0.5"
                          >
                            <span>Hapus Kupon</span>
                            <X size={10} />
                          </button>
                        )}
                      </div>

                      {appliedPromo ? (
                        <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs text-amber-400 flex justify-between items-center">
                          <span className="font-bold flex items-center gap-1">
                            <Tag size={12} className="text-amber-500" />
                            <span>Voucher Aktif: {appliedPromo.code}</span>
                          </span>
                          <span className="font-mono text-xs font-bold">-{appliedPromo.discountPercentage}%</span>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            id="input-promo-cart"
                            type="text"
                            placeholder="Contoh: MEGABARISTA"
                            value={promoInput}
                            onChange={(e) => setPromoInput(e.target.value)}
                            className="flex-1 p-3 bg-stone-950 border border-stone-850 text-xs font-semibold rounded-xl text-stone-100 uppercase tracking-wider outline-none focus:border-amber-500"
                          />
                          <button
                            id="btn-apply-code-cart"
                            type="button"
                            onClick={handleApplyPromoCode}
                            className="px-4 bg-amber-800 hover:bg-amber-600 text-stone-100 hover:text-stone-950 hover:font-bold rounded-xl text-xs transition cursor-pointer"
                          >
                            Pakai
                          </button>
                        </div>
                      )}
                      
                      {/* Notifications if voucher is valid/invalid */}
                      {promoError && <p className="text-[10px] text-rose-400 font-medium flex items-center gap-1"><AlertTriangle size={11} className="shrink-0" /> {promoError}</p>}
                      {promoSuccess && <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1"><Check size={11} className="shrink-0" /> {promoSuccess}</p>}
                    </div>

                    {/* Cost Calculations */}
                    <div className="space-y-1.5 text-xs text-stone-300 font-sans border-t border-b border-stone-800/80 py-3.5">
                      <div className="flex justify-between">
                        <span className="text-stone-400">Subtotal Minuman</span>
                        <span className="font-medium">Rp {getSubtotal().toLocaleString('id-ID')}</span>
                      </div>
                      
                      {appliedPromo && (
                        <div className="flex justify-between text-yellow-500">
                          <span className="flex items-center gap-0.5">Diskon Promo ({appliedPromo.discountPercentage}%)</span>
                          <span className="font-mono font-semibold">- Rp {getDiscountAmount().toLocaleString('id-ID')}</span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span className="text-stone-400">PPN Pajak (11%)</span>
                        <span className="font-medium">Rp {getTaxAmount().toLocaleString('id-ID')}</span>
                      </div>

                      <div className="flex justify-between text-white font-black text-sm pt-2 border-t border-stone-800/40">
                        <span>TOTAL AKHIR</span>
                        <span className="text-amber-400 font-black font-sans text-base">Rp {getTotal().toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    {/* Checkout Details Form (Submits Receipt) */}
                    <form onSubmit={handleCheckoutSubmit} className="space-y-3.5 text-xs">
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">Nama Pelanggan *</label>
                        <input
                          id="input-customer-name"
                          type="text"
                          required
                          placeholder="Masukkan nama meja/pemesan..."
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full p-3.5 bg-stone-950 border border-stone-850 text-stone-100 rounded-xl outline-none focus:border-amber-500 font-bold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Table Select */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">Nomor Meja</label>
                          <select
                            id="select-table-num"
                            value={tableNumber}
                            onChange={(e) => setTableNumber(e.target.value)}
                            className="w-full p-3.5 bg-stone-950 border border-stone-810 text-stone-100 rounded-xl outline-none focus:border-amber-500 font-bold font-mono"
                          >
                            <option value="Takeaway">Takeaway</option>
                            <option value="01">Meja 01</option>
                            <option value="02">Meja 02</option>
                            <option value="03">Meja 03</option>
                            <option value="04">Meja 04</option>
                            <option value="05">Meja 05</option>
                            <option value="06">Meja 06</option>
                            <option value="07">Meja 07</option>
                            <option value="08">Meja 08</option>
                          </select>
                        </div>
                        
                        {/* Payment Method Selector */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">Pembayaran</label>
                          <select
                            id="select-payment-method"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value as 'Cash' | 'QRIS')}
                            className="w-full p-3.5 bg-stone-950 border border-stone-810 text-stone-100 rounded-xl outline-none focus:border-amber-500 font-bold"
                          >
                            <option value="QRIS">QRIS Scan</option>
                            <option value="Cash">Uang Tunai (Cash)</option>
                          </select>
                        </div>
                      </div>

                      {/* Cash paid input calculations */}
                      {paymentMethod === 'Cash' && (
                        <div className="p-3 bg-stone-950 border border-stone-850 rounded-xl space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">Jumlah Cash Dibayarkan</label>
                            <span className="text-[9px] text-amber-500 font-bold uppercase">Uang Tunai</span>
                          </div>
                          
                          <div className="flex gap-2">
                            <span className="p-3 bg-stone-900 border border-stone-800 rounded-xl font-black font-sans text-stone-400">Rp</span>
                            <input
                              id="input-cash-amount"
                              type="text"
                              required
                              placeholder="Contoh: 50.000, 100.000"
                              value={cashPaidAmount}
                              onChange={(e) => setCashPaidAmount(e.target.value)}
                              className="w-full p-3 bg-stone-900 border border-stone-800 text-stone-100 rounded-xl outline-none font-bold focus:border-amber-500"
                            />
                          </div>

                          {/* Instant change returned mockup */}
                          <div className="flex justify-between text-[11px] pt-1.5 border-t border-stone-800/50">
                            <span className="text-stone-400 font-semibold">Taksiran Kembalian Cash:</span>
                            <span className="text-emerald-400 font-black font-serif">Rp {liveChangeAmount().toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                      )}

                      {/* Submit Order Button */}
                      <button
                        id="btn-process-checkout"
                        type="submit"
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 active:scale-95 text-stone-950 hover:text-white font-extrabold text-xs uppercase tracking-widest transition shadow-lg shadow-emerald-950/20 cursor-pointer text-center"
                      >
                        Selesaikan Pembayaran &amp; Print Struk
                      </button>
                    </form>

                  </div>
                )}

              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================= */}
      {/* 4. MODALS & OTHER POPUPS */}
      {/* ======================================================= */}
      {/* Drink customizer options */}
      <CustomizeModal
        isOpen={isCustomizeOpen}
        item={selectedCustomizeItem}
        onClose={() => {
          setIsCustomizeOpen(false);
          setSelectedCustomizeItem(null);
        }}
        onConfirm={handleAddCustomizeToCart}
      />

      {/* Cashier printable Receipt */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        order={activeReceiptOrder}
        onClose={() => {
          setIsReceiptOpen(false);
          setActiveReceiptOrder(null);
        }}
      />

    </div>
  );
}
