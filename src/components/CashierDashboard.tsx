/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Coffee, 
  Eye, 
  AlertCircle, 
  RefreshCw,
  Award,
  Calendar
} from 'lucide-react';
import { Order, MenuItem, Category } from '../types';

interface CashierDashboardProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: 'pending' | 'completed' | 'cancelled') => void;
  menuItems: MenuItem[];
  onToggleAvailability: (itemId: string) => void;
  onViewOrder: (order: Order) => void;
}

export default function CashierDashboard({
  orders,
  onUpdateOrderStatus,
  menuItems,
  onToggleAvailability,
  onViewOrder
}: CashierDashboardProps) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');
  const [stockCategory, setStockCategory] = useState<Category | 'All'>('All');

  // Compute stats
  const completedOrders = orders.filter(o => o.status === 'completed');
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const cancelledOrders = orders.filter(o => o.status === 'cancelled');

  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const totalTaxCollected = completedOrders.reduce((sum, o) => sum + o.tax, 0);
  const totalDiscountsGiven = completedOrders.reduce((sum, o) => sum + o.discount, 0);

  // Calculate popular items count
  const itemCounts: Record<string, { name: string; count: number; category: string; image: string }> = {};
  completedOrders.forEach(o => {
    o.items.forEach(item => {
      const id = item.menuItem.id;
      if (!itemCounts[id]) {
        itemCounts[id] = {
          name: item.menuItem.name,
          count: 0,
          category: item.menuItem.category,
          image: item.menuItem.image
        };
      }
      itemCounts[id].count += item.quantity;
    });
  });

  const popularItemsList = Object.values(itemCounts).sort((a, b) => b.count - a.count).slice(0, 4);

  // Filtered orders
  const filteredOrders = orders.filter(o => {
    if (filterStatus === 'all') return true;
    return o.status === filterStatus;
  });

  // Filtered menu items for stock toggle
  const filteredMenuItems = menuItems.filter(item => {
    if (stockCategory === 'All') return true;
    return item.category === stockCategory;
  });

  return (
    <div className="space-y-8">
      {/* Analytics Rows */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Revenue */}
        <div className="p-6 rounded-3xl border border-stone-800 bg-stone-900/60 shadow-xl backdrop-blur-md flex items-center gap-5">
          <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/10">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Omset Berhasil</p>
            <p className="text-2xl font-black font-sans text-white">
              Rp {totalRevenue.toLocaleString('id-ID')}
            </p>
            <p className="text-[10px] text-stone-500 mt-1">PPN Terkumpul: Rp {totalTaxCollected.toLocaleString('id-ID')}</p>
          </div>
        </div>

        {/* Total Orders Count */}
        <div className="p-6 rounded-3xl border border-stone-800 bg-stone-900/60 shadow-xl backdrop-blur-md flex items-center gap-5">
          <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Total Pesanan</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-sans text-white">{orders.length}</span>
              <span className="text-xs text-stone-500 font-mono">({completedOrders.length} Sukses)</span>
            </div>
            <p className="text-[10px] text-stone-500 mt-1">Pending: {pendingOrders.length} | Batal: {cancelledOrders.length}</p>
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="p-6 rounded-3xl border border-stone-800 bg-stone-900/60 shadow-xl backdrop-blur-md flex items-center gap-5">
          <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/10">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Rata-rata Transaksi</p>
            <p className="text-2xl font-black font-sans text-white">
              Rp {orders.length > 0 ? Math.round(totalRevenue / (completedOrders.length || 1)).toLocaleString('id-ID') : '0'}
            </p>
            <p className="text-[10px] text-stone-500 mt-1">Potongan Promosi: Rp {totalDiscountsGiven.toLocaleString('id-ID')}</p>
          </div>
        </div>

        {/* Time of Day Tracker / Active Counter */}
        <div className="p-6 rounded-3xl border border-stone-800 bg-stone-900/60 shadow-xl backdrop-blur-md flex items-center gap-5">
          <div className="p-4 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/10">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Status Antrean Cafe</p>
            <p className="text-2xl font-black font-sans text-white">
              {pendingOrders.length} <span className="text-xs font-normal text-stone-400">Cup Sedang Dibuat</span>
            </p>
            <p className="text-[10px] text-amber-400 font-medium flex items-center gap-1 mt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" /> Live Order Update
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Orders Management & Popular items */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Manage Orders (7 Cols) */}
        <div className="lg:col-span-8 p-6 md:p-8 rounded-3xl border border-stone-800 bg-stone-900/40 shadow-xl backdrop-blur-md space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold font-sans text-white flex items-center gap-2">
                <Calendar className="text-amber-500 h-5 w-5" />
                <span>Manajemen Transaksi Kasir</span>
              </h2>
              <p className="text-xs text-stone-400 mt-1">Proses pesanan pelanggan, monitoring status kopi, dan print struk ulang.</p>
            </div>
            
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-1.5 bg-stone-950 p-1 rounded-xl border border-stone-800">
              {(['all', 'pending', 'completed', 'cancelled'] as const).map((st) => (
                <button
                  id={`filter-order-${st}`}
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg uppercase tracking-wider transition ${
                    filterStatus === st
                      ? 'bg-amber-800 text-amber-50'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  {st === 'all' ? 'Semua' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Table / List of Orders */}
          <div className="overflow-x-auto min-h-[300px]">
            {filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-stone-500 space-y-2">
                <AlertCircle size={32} className="text-stone-600 animate-pulse" />
                <p className="text-sm font-medium">Tidak ada transaksi dalam kategori ini.</p>
              </div>
            ) : (
              <table className="w-full text-left font-sans text-sm">
                <thead>
                  <tr className="border-b border-stone-800 text-xs text-stone-400 font-bold uppercase tracking-wider">
                    <th className="pb-3 text-center">Invoice</th>
                    <th className="pb-3">Pelanggan</th>
                    <th className="pb-3 text-center">Meja</th>
                    <th className="pb-3">Detail Minuman/Makanan</th>
                    <th className="pb-3 text-right">Total</th>
                    <th className="pb-3 text-center">Status</th>
                    <th className="pb-3 text-center">Aksi POS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {filteredOrders.map((order) => {
                    const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0);
                    return (
                      <tr key={order.orderId} className="hover:bg-stone-800/20 transition-all">
                        {/* Invoice */}
                        <td className="py-4 text-center font-mono text-stone-300 font-semibold">
                          {order.invoiceNumber.split('-')[1] || order.invoiceNumber}
                        </td>
                        
                        {/* Cutomer Name */}
                        <td className="py-4 font-bold text-white">
                          <div>{order.customerName || 'Walk-In'}</div>
                          <span className="text-[10px] text-stone-500 font-mono font-normal">
                            {new Date(order.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>

                        {/* Table Number */}
                        <td className="py-4 text-center">
                          <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-950 text-amber-300 border border-amber-500/10">
                            {order.tableNumber || 'TA'}
                          </span>
                        </td>

                        {/* Items summary */}
                        <td className="py-4">
                          <div className="max-w-[200px] text-xs text-stone-300 line-clamp-2">
                            {order.items.map((it) => `${it.quantity}x ${it.menuItem.name} (${it.customizeOption.size})`).join(', ')}
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="py-4 text-right font-black font-sans text-amber-400">
                          Rp {order.total.toLocaleString('id-ID')}
                        </td>

                        {/* Status badge */}
                        <td className="py-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide inline-block ${
                            order.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : order.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {order.status}
                          </span>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* View Struk */}
                            <button
                              id={`view-order-rec-${order.orderId}`}
                              onClick={() => onViewOrder(order)}
                              title="Lihat Struk / Cetak Ulang"
                              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition cursor-pointer"
                            >
                              <Eye size={14} />
                            </button>

                            {order.status === 'pending' && (
                              <>
                                {/* Complete */}
                                <button
                                  id={`complete-order-${order.orderId}`}
                                  onClick={() => onUpdateOrderStatus(order.orderId, 'completed')}
                                  title="Tandai Selesai"
                                  className="p-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-500/25 transition cursor-pointer"
                                >
                                  <CheckCircle size={14} />
                                </button>
                                {/* Cancel */}
                                <button
                                  id={`cancel-order-${order.orderId}`}
                                  onClick={() => onUpdateOrderStatus(order.orderId, 'cancelled')}
                                  title="Batalkan Pesanan"
                                  className="p-1.5 rounded-lg bg-red-950 hover:bg-red-900 text-red-500 border border-red-500/25 transition cursor-pointer"
                                >
                                  <XCircle size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Popular items (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Popular Items Card */}
          <div className="p-6 rounded-3xl border border-stone-800 bg-stone-900/40 shadow-xl backdrop-blur-md">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4 font-sans">
              <Award className="text-amber-500 h-5 w-5" />
              <span>Menu Kopi Paling Laris</span>
            </h3>

            {popularItemsList.length === 0 ? (
              <p className="text-xs text-stone-500 italic py-6 text-center">Selesaikan order untuk menampilkan barang terlaris.</p>
            ) : (
              <div className="space-y-3.5">
                {popularItemsList.map((pop, idx) => (
                  <div key={pop.name} className="flex items-center justify-between p-3 rounded-2xl bg-stone-950/40 border border-stone-800/60 hover:border-stone-700/60 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0">
                        <img
                          src={pop.image}
                          alt={pop.name}
                          referrerPolicy="no-referrer"
                          className="h-full w-full rounded-xl object-cover border border-stone-800"
                        />
                        <span className="absolute -top-1.5 -left-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-stone-950">
                          {idx + 1}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white line-clamp-1">{pop.name}</h4>
                        <span className="text-[10px] text-stone-500 uppercase tracking-widest leading-none font-mono">{pop.category}</span>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-amber-950/60 text-amber-400 text-xs font-bold font-mono rounded-lg border border-amber-500/10 shrink-0">
                      {pop.count} cup
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats SVG chart (Line representation) */}
          <div className="p-6 rounded-3xl border border-stone-800 bg-stone-900/40 shadow-xl backdrop-blur-md space-y-3">
            <h3 className="text-xs font-bold text-stone-300 uppercase tracking-wider">Grafik Penjualan Hari Ini</h3>
            <div className="h-28 flex items-end justify-between p-3 bg-stone-950/60 rounded-2xl border border-stone-800/60 relative overflow-hidden">
              {/* Background grid line */}
              <div className="absolute inset-x-0 top-1/3 border-b border-stone-900" />
              <div className="absolute inset-x-0 top-2/3 border-b border-stone-900" />

              {/* Graphic line simulation with bars or path */}
              <div className="w-full h-full flex items-end">
                <svg className="w-full h-full text-amber-500/30" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <path d="M0,40 Q15,10 30,25 T60,5 T90,30 L100,40 Z" fill="currentColor" />
                  <path d="M0,40 Q15,10 30,25 T60,5 T90,30" fill="none" stroke="#f59e0b" strokeWidth="2" />
                </svg>
              </div>

              {/* Timeline markers */}
              <div className="absolute bottom-1.5 left-3 right-3 flex justify-between text-[8px] font-semibold text-stone-500 font-mono">
                <span>08:00</span>
                <span>12:00</span>
                <span>16:00</span>
                <span>Sekarang</span>
              </div>
            </div>
            <p className="text-[10px] text-stone-400 leading-tight">Penjualan terpantau naik pada waktu jam makan siang dan sore hari.</p>
          </div>

        </div>

      </div>

      {/* Stock Availability Manager Block */}
      <div id="stock-availability-manager" className="p-6 md:p-8 rounded-3xl border border-stone-800 bg-stone-900/40 shadow-xl backdrop-blur-md space-y-6">
        <div>
          <h2 className="text-xl font-bold font-sans text-white flex items-center gap-2">
            <Coffee className="text-amber-500 h-5 w-5" />
            <span>Ketersediaan Menu Cafe</span>
          </h2>
          <p className="text-xs text-stone-400 mt-1">Ganti status kelayakan menu menjadi &apos;Habis&apos; (Sold Out). Hal ini akan langsung menyembunyikannya dari kasir kustomisasi dan memberi label &apos;Habis&apos; di menu digital pelanggan.</p>
        </div>

        {/* Stock Categories switcher */}
        <div className="flex flex-wrap gap-2">
          {(['All', 'Coffee', 'Non Coffee', 'Tea', 'Dessert', 'Snack'] as const).map((cat) => (
            <button
              id={`stock-cat-btn-${cat.replace(' ', '-')}`}
              key={cat}
              onClick={() => setStockCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                stockCategory === cat
                  ? 'bg-stone-100 text-stone-950 border-white font-bold'
                  : 'bg-stone-900/50 text-stone-400 border-stone-800 hover:text-white hover:border-stone-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid of Stock Toggle Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMenuItems.map((item) => (
            <div
              id={`stock-item-${item.id}`}
              key={item.id}
              className={`p-4 rounded-2xl border transition flex items-center justify-between gap-4 ${
                item.isAvailable 
                  ? 'bg-stone-900/60 border-stone-800' 
                  : 'bg-rose-950/10 border-rose-500/20 shadow-red-950/10 shadow-lg'
              }`}
            >
              <div className="flex items-center gap-3">
                <img
                  src={item.image}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className={`h-10 w-10 rounded-xl object-cover shrink-0 ${!item.isAvailable ? 'opacity-40 grayscale' : ''}`}
                />
                <div>
                  <h4 className={`text-xs font-bold leading-tight line-clamp-1 ${item.isAvailable ? 'text-white' : 'text-stone-500 line-through'}`}>
                    {item.name}
                  </h4>
                  <span className="text-[9px] font-semibold text-stone-500 font-mono uppercase tracking-wider">{item.category}</span>
                </div>
              </div>

              {/* Toggle switch button */}
              <button
                id={`toggle-stock-item-${item.id}`}
                onClick={() => onToggleAvailability(item.id)}
                className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition cursor-pointer shrink-0 ${
                  item.isAvailable
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/25 hover:bg-rose-500/20'
                }`}
              >
                {item.isAvailable ? 'Ada' : 'Kosong'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
