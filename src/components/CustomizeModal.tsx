/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, ShoppingBag, Coffee, Flame, Moon } from 'lucide-react';
import { MenuItem, CustomizeOptions } from '../types';

interface CustomizeModalProps {
  isOpen: boolean;
  item: MenuItem | null;
  onClose: () => void;
  onConfirm: (options: CustomizeOptions) => void;
}

export default function CustomizeModal({ isOpen, item, onClose, onConfirm }: CustomizeModalProps) {
  const [size, setSize] = useState<'Regular' | 'Large'>('Regular');
  const [sweetness, setSweetness] = useState<'Less' | 'Normal' | 'Extra'>('Normal');
  const [ice, setIce] = useState<'No Ice' | 'Less' | 'Normal' | 'Extra Ice'>('Normal');

  if (!item) return null;

  // Drinks usually have ice/sweetness options, food/dessert might not.
  const isCaffeinated = item.category === 'Coffee' || item.category === 'Non Coffee' || item.category === 'Tea';

  const handleConfirm = () => {
    onConfirm({
      size,
      sweetness: isCaffeinated ? sweetness : 'Normal',
      ice: isCaffeinated ? ice : 'No Ice',
    });
    // Reset options
    setSize('Regular');
    setSweetness('Normal');
    setIce('Normal');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            id="backdrop-customize"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-neutral-950/70 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            id="modal-customize"
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-amber-900/30 bg-stone-900/90 text-stone-100 shadow-2xl backdrop-blur-md"
          >
            {/* Header / Img */}
            <div className="relative h-48 w-full">
              <img
                src={item.image}
                alt={item.name}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent" />
              <button
                id="btn-close-customize"
                onClick={onClose}
                className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-stone-900/60 text-stone-300 hover:bg-stone-900 hover:text-white transition"
              >
                <X size={18} />
              </button>
              <div className="absolute bottom-4 left-6 right-6">
                <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-300 bg-amber-950/60 border border-amber-500/20 rounded-full mb-2">
                  {item.category}
                </span>
                <h3 className="text-2xl font-bold font-sans text-white">{item.name}</h3>
              </div>
            </div>

            {/* Scrollable Customization */}
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
              {/* Size Selection */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium text-stone-300 uppercase tracking-wider">Pilih Ukuran</h4>
                  <span className="text-xs text-amber-300 font-mono">Large (+Rp 5.000)</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {(['Regular', 'Large'] as const).map((s) => (
                    <button
                      id={`size-${s}`}
                      key={s}
                      onClick={() => setSize(s)}
                      className={`flex flex-col items-center justify-center py-4 px-4 rounded-2xl border text-center transition-all ${
                        size === s
                          ? 'bg-amber-800/35 border-amber-500 text-amber-100 shadow-lg shadow-amber-900/20'
                          : 'bg-stone-800/40 border-stone-700/50 text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                      }`}
                    >
                      <Coffee className={s === 'Large' ? 'h-6 w-6 text-amber-400 mb-1' : 'h-5 w-5 text-amber-500/80 mb-1'} />
                      <span className="text-sm font-semibold">{s === 'Regular' ? 'Regular (12oz)' : 'Large (16oz)'}</span>
                      <span className="text-xs mt-1 text-stone-400">
                        {s === 'Regular' ? `Rp ${item.price.toLocaleString('id-ID')}` : `Rp ${(item.price + 5000).toLocaleString('id-ID')}`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {isCaffeinated && (
                <>
                  {/* Sweetness Selection */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-stone-300 uppercase tracking-wider">Tingkat Kemanisan</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Less', 'Normal', 'Extra'] as const).map((sw) => (
                        <button
                          id={`sweet-${sw}`}
                          key={sw}
                          onClick={() => setSweetness(sw)}
                          className={`py-3 px-2 rounded-xl text-center border text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                            sweetness === sw
                              ? 'bg-amber-800/35 border-amber-500 text-amber-100'
                              : 'bg-stone-800/40 border-stone-700/50 text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                          }`}
                        >
                          {sw === 'Less' && 'Less Sweet'}
                          {sw === 'Normal' && 'Normal'}
                          {sw === 'Extra' && 'Extra Sweet'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ice Selection */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-stone-300 uppercase tracking-wider">Es Batu</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {([ 'No Ice', 'Less', 'Normal', 'Extra Ice' ] as const).map((ic) => (
                        <button
                          id={`ice-${ic.replace(' ', '-')}`}
                          key={ic}
                          onClick={() => setIce(ic)}
                          className={`py-3 px-1 rounded-xl text-center border text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                            ice === ic
                              ? 'bg-amber-800/35 border-amber-500 text-amber-100'
                              : 'bg-stone-800/40 border-stone-700/50 text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                          }`}
                        >
                          {ic}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Description Card */}
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/10 text-xs text-amber-200/80 leading-relaxed font-sans">
                {item.description}
              </div>
            </div>

            {/* Sticky Actions Footer */}
            <div className="p-6 border-t border-stone-800 bg-stone-900 flex justify-between items-center">
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wider">Estimasi Harga</p>
                <p className="text-2xl font-bold font-sans text-amber-400">
                  Rp {(item.price + (size === 'Large' ? 5000 : 0)).toLocaleString('id-ID')}
                </p>
              </div>
              <button
                id="btn-add-to-cart-confirm"
                onClick={handleConfirm}
                className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-800 font-bold hover:from-amber-500 hover:to-amber-700 active:scale-95 transition text-white shadow-lg shadow-amber-950/40 cursor-pointer"
              >
                <ShoppingBag size={18} />
                <span>Masukkan Keranjang</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
