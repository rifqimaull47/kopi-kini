/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, Printer, Download, Utensils, CreditCard, Share2 } from 'lucide-react';
import { Order } from '../types';
import { useState } from 'react';

interface ReceiptModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
}

export default function ReceiptModal({ isOpen, order, onClose }: ReceiptModalProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  if (!order) return null;

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      setIsPrinting(false);
      alert('Simulasi cetak struk selesai. Printer Kasir KopiKini siap digunakan!');
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            id="receipt-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-neutral-950/70 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            id="receipt-modal"
            initial={{ scale: 0.95, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 30, opacity: 0 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-stone-800 bg-stone-900 shadow-2xl z-10"
          >
            {/* Header Success Overlay */}
            <div className="bg-gradient-to-b from-emerald-950/40 via-stone-900 to-stone-900 p-6 text-center border-b border-stone-800">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12, delay: 0.1 }}
                className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              >
                <CheckCircle size={32} />
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-1">Transaksi Berhasil!</h3>
              <p className="text-xs text-stone-400">Terima kasih atas pesanan Anda di KopiKini.</p>
              <button
                id="btn-close-receipt-x"
                onClick={onClose}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Simulated Thermal Paper Receipt */}
            <div className="p-6 bg-stone-950 border-b border-stone-800">
              <div className="bg-white text-stone-900 p-6 rounded-2xl shadow-inner font-mono text-xs relative overflow-hidden">
                
                {/* Decorative Jagged Receipt Top */}
                <div className="absolute top-0 left-0 right-0 h-1.5 flex justify-between overflow-hidden opacity-5 md:opacity-10 scale-y-[-1]">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div key={i} className="w-4 h-4 bg-stone-900 rotate-45 -translate-y-2 shrink-0" />
                  ))}
                </div>

                {/* Cafe Header */}
                <div className="text-center pb-4 border-b border-dashed border-stone-300">
                  <h4 className="text-base font-extrabold tracking-widest text-stone-950">KOPIKINI COFFEE</h4>
                  <p className="text-[10px] text-stone-500 mt-1">Sena Cozy Lane No. 42, Senopati, Jakarta</p>
                  <p className="text-[10px] text-stone-500">Telp: (021) 888 - 5642</p>
                  <p className="text-[10px] text-amber-700 font-semibold mt-1">WWW.KOPIKINI.COFFEE</p>
                </div>

                {/* Invoice Meta */}
                <div className="py-3 border-b border-dashed border-stone-300 space-y-1 text-[10px] text-stone-600">
                  <div className="flex justify-between">
                    <span>No. Invoice:</span>
                    <span className="font-bold text-stone-950">{order.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tanggal:</span>
                    <span>{new Date(order.timestamp).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kasir:</span>
                    <span className="font-semibold text-stone-800">Sistem POS KopiKini</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pelanggan:</span>
                    <span className="font-bold text-stone-950">{order.customerName || 'Pelanggan Walk-In'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>No. Meja:</span>
                    <span className="font-bold text-amber-800 bg-amber-50 px-1 rounded">{order.tableNumber || 'Takeaway'}</span>
                  </div>
                </div>

                {/* Items List */}
                <div className="py-3 border-b border-dashed border-stone-300 space-y-3">
                  {order.items.map((item, idx) => {
                    const extraCost = item.customizeOption.size === 'Large' ? 5000 : 0;
                    const itemPrice = item.menuItem.price + extraCost;
                    const totalItemPrice = itemPrice * item.quantity;
                    return (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex justify-between text-stone-900 font-bold">
                          <span>
                            {item.quantity}x {item.menuItem.name}
                          </span>
                          <span>Rp {totalItemPrice.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="text-[9px] text-stone-500 pl-4 space-y-0.5 leading-tight">
                          <div>Ukuran: {item.customizeOption.size}</div>
                          {item.menuItem.category !== 'Dessert' && item.menuItem.category !== 'Snack' && (
                            <>
                              <div>Manis: {item.customizeOption.sweetness} Sugar</div>
                              <div>Es: {item.customizeOption.ice}</div>
                            </>
                          )}
                          <div className="text-stone-400">@ Rp {itemPrice.toLocaleString('id-ID')}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pricing Calculation Summary */}
                <div className="py-3 text-[11px] space-y-1 text-stone-700">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>Rp {order.subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-yellow-700 font-semibold">
                    <span>Promo Discount</span>
                    <span>- Rp {order.discount.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PPN (11%)</span>
                    <span>Rp {order.tax.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-stone-950 font-black text-sm pt-2 border-t border-stone-200">
                    <span>GRAND TOTAL</span>
                    <span>Rp {order.total.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {/* Payment Detail Section */}
                <div className="pt-3 pb-1 border-t border-dashed border-stone-300 space-y-1 text-[10px] text-stone-600">
                  <div className="flex justify-between font-bold text-stone-900">
                    <span>Metode Pembayaran:</span>
                    <span className="flex items-center gap-1 uppercase">
                      {order.paymentMethod === 'QRIS' ? (
                        <>
                          <CreditCard size={10} className="text-blue-600" />
                          <span>QRIS CASHLESS</span>
                        </>
                      ) : (
                        <>
                          <Utensils size={10} className="text-emerald-600" />
                          <span>CASH</span>
                        </>
                      )}
                    </span>
                  </div>
                  {order.paymentMethod === 'Cash' && (
                    <>
                      <div className="flex justify-between text-stone-700">
                        <span>Jumlah Bayar:</span>
                        <span>Rp {(order.cashAmountPaid || 0).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between text-emerald-700 font-bold border-t border-stone-100 pt-1">
                        <span>Kembalian:</span>
                        <span>Rp {(order.changeAmount || 0).toLocaleString('id-ID')}</span>
                      </div>
                    </>
                  )}
                  {order.paymentMethod === 'QRIS' && (
                    <div className="flex justify-between text-blue-700 font-medium">
                      <span>Status QRIS:</span>
                      <span className="text-emerald-600 bg-emerald-50 px-1 rounded font-bold">PAID SECURELY</span>
                    </div>
                  )}
                </div>

                {/* QRIS / Receipt bottom barcode placeholder */}
                <div className="flex flex-col items-center justify-center pt-5 space-y-2 border-t border-dashed border-stone-300">
                  <div className="w-24 h-24 bg-stone-100 p-1 rounded-md flex items-center justify-center border border-stone-200">
                    <svg className="w-full h-full text-stone-950" viewBox="0 0 100 100">
                      {/* Stylized QR structure */}
                      <rect x="0" y="0" width="30" height="30" fill="currentColor" />
                      <rect x="5" y="5" width="20" height="20" fill="white" />
                      <rect x="10" y="10" width="10" height="10" fill="currentColor" />

                      <rect x="70" y="0" width="30" height="30" fill="currentColor" />
                      <rect x="75" y="5" width="20" height="20" fill="white" />
                      <rect x="80" y="10" width="10" height="10" fill="currentColor" />

                      <rect x="0" y="70" width="30" height="30" fill="currentColor" />
                      <rect x="5" y="75" width="20" height="20" fill="white" />
                      <rect x="10" y="80" width="10" height="10" fill="currentColor" />

                      {/* Random barcodes / noise squares */}
                      <rect x="40" y="10" width="10" height="10" fill="currentColor" />
                      <rect x="50" y="0" width="10" height="10" fill="currentColor" />
                      <rect x="40" y="25" width="15" height="10" fill="currentColor" />
                      
                      <rect x="70" y="40" width="10" height="15" fill="currentColor" />
                      <rect x="85" y="45" width="5" height="15" fill="currentColor" />
                      
                      <rect x="35" y="45" width="25" height="20" fill="currentColor" />
                      <rect x="45" y="50" width="10" height="10" fill="white" />

                      <rect x="70" y="70" width="10" height="10" fill="currentColor" />
                      <rect x="85" y="75" width="15" height="15" fill="currentColor" />
                      <rect x="40" y="80" width="15" height="15" fill="currentColor" />
                    </svg>
                  </div>
                  <p className="text-[8px] text-stone-400 font-sans tracking-tight text-center">
                    Kasir digital Anda oleh KopiKini.<br />Simpan struk ini sebagai bukti pembayaran digital.
                  </p>
                </div>

                {/* Thank You Note */}
                <div className="text-center pt-4 border-t border-dashed border-stone-300">
                  <p className="text-[9px] text-stone-400 italic font-sans font-medium">~ Thank you! Please come again next time ~</p>
                </div>
              </div>
            </div>

            {/* Print & Share Actions */}
            <div className="p-6 bg-stone-900 border-t border-stone-800 flex gap-3">
              <button
                id="btn-print-receipt"
                onClick={handlePrint}
                disabled={isPrinting}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-700 hover:bg-amber-600 disabled:bg-stone-800 disabled:text-stone-500 font-bold text-white transition text-sm cursor-pointer"
              >
                <Printer size={16} className={isPrinting ? 'animate-bounce' : ''} />
                <span>{isPrinting ? 'Mencetak...' : 'Cetak Struk'}</span>
              </button>
              <button
                id="btn-close-receipt-foot"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 font-bold text-stone-300 hover:text-white transition text-sm"
              >
                Tutup Struk
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
