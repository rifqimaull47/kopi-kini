/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MenuItem, PromoCode } from './types';

export const MENU_ITEMS: MenuItem[] = [
  // 1. COFFEE
  {
    id: 'c1',
    name: 'Es Kopi Susu Aren Signature',
    price: 24000,
    rating: 4.9,
    description: 'Double shot espresso blend, susu krimi segar, dan gula aren organik premium dari Sukabumi. Gurih, manis, dan kuat.',
    category: 'Coffee',
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=600',
    isPopular: true,
    isAvailable: true,
  },
  {
    id: 'c2',
    name: 'Spanish Latte Velvet',
    price: 28000,
    rating: 4.8,
    description: 'Susu kental manis premium, espresso arabika aromatik, dan steamed milk yang menghasilkan tekstur beludru lembut.',
    category: 'Coffee',
    image: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&q=80&w=600',
    isPopular: true,
    isAvailable: true,
  },
  {
    id: 'c3',
    name: 'Manuka Honey Blossom Latte',
    price: 32000,
    rating: 4.8,
    description: 'Espresso arabika dipadukan dengan susu oat organik, disiram madu asli bunga Manuka Selandia Baru yang manis alami beraroma buah.',
    category: 'Coffee',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600',
    isAvailable: true,
  },
  {
    id: 'c4',
    name: 'Kyoto Matcha Espresso Fusion',
    price: 30000,
    rating: 4.7,
    description: 'Matcha Kyoto premium berlapis, disiram susu segar dingin dan shot espresso arabika istimewa. Tiga lapis warna dan rasa yang elegan.',
    category: 'Coffee',
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&q=80&w=600',
    isAvailable: true,
  },
  {
    id: 'c5',
    name: 'Avocado Coffee Floating Fudge',
    price: 34000,
    rating: 4.9,
    description: 'Sari alpukat mentega segar diblender lembut, espresso arabika, dan scoop es krim cokelat belgia premium di atasnya.',
    category: 'Coffee',
    image: 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&q=80&w=600',
    isPopular: true,
    isAvailable: true,
  },

  // 2. NON COFFEE
  {
    id: 'nc1',
    name: 'Signature Charcoal Latte',
    price: 28000,
    rating: 4.8,
    description: 'Bubuk arang bambu aktif Jepang (binchotan), susu vanila lembut, dan sirup hazelnut harum. Unik, mengesankan, dan kaya antioksidan.',
    category: 'Non Coffee',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=600',
    isPopular: true,
    isAvailable: true,
  },
  {
    id: 'nc2',
    name: 'Sakura Blossom Berry Velvet',
    price: 28000,
    rating: 4.7,
    description: 'Susu red velvet krimis beraroma kelopak sakura Jepang, selai stroberi segar buatan rumah, dibalut foam keju asin gurih di atasnya.',
    category: 'Non Coffee',
    image: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&q=80&w=600',
    isAvailable: true,
  },
  {
    id: 'nc3',
    name: 'Kyoto Organic Matcha Latte',
    price: 28000,
    rating: 4.9,
    description: 'Ceremonial-grade matcha Kyoto otentik yang diaduk menggunakan bambu chasen tradisional, dipadukan susu creamy hangat/dingin.',
    category: 'Non Coffee',
    image: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&q=80&w=600',
    isPopular: true,
    isAvailable: true,
  },

  // 3. TEA
  {
    id: 't1',
    name: 'Peach Jasmine Blossom Tea',
    price: 22000,
    rating: 4.8,
    description: 'Teh melati wangi dingin dipadukan buah persik manis potongan segar, sirup mint segar, biji selasih bertekstur kenyal.',
    category: 'Tea',
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=600',
    isAvailable: true,
  },
  {
    id: 't2',
    name: 'Lychee Rose White Peony Tea',
    price: 24000,
    rating: 4.7,
    description: 'Teh putih White Peony premium dingin dengan sirup mawar alami harum hutan aromatik, dihiasi buah leci segar berair.',
    category: 'Tea',
    image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=600',
    isAvailable: true,
  },
  {
    id: 't3',
    name: 'Chamomile Honey Lavender Tea',
    price: 20000,
    rating: 4.6,
    description: 'Seduhan kuncup bunga chamomile menenangkan, madu mentah, perasan lemon segar, dan sejumput lavender kering organik.',
    category: 'Tea',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=600',
    isAvailable: true,
  },

  // 4. DESSERT
  {
    id: 'd1',
    name: 'Fudge Chocolate Brownies with Gelato',
    price: 32000,
    rating: 4.9,
    description: 'Kue brownies cokelat panggang gooey hangat bertabur kacang walnut, di atasnya ditumpangkan es krim gelato vanila asli Madagaskar.',
    category: 'Dessert',
    image: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?auto=format&fit=crop&q=80&w=600',
    isPopular: true,
    isAvailable: true,
  },
  {
    id: 'd2',
    name: 'Strawberry Shortcake Imperial',
    price: 35000,
    rating: 4.8,
    description: 'Sponge cake vanilla super lembut berlapis krim kocok segar Jepang hokkaido, berisi potongan stroberi segar manis berair.',
    category: 'Dessert',
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&q=80&w=600',
    isAvailable: true,
  },
  {
    id: 'd3',
    name: 'Traditional Tiramisu Jar',
    price: 38000,
    rating: 4.9,
    description: 'Biskuit ladyfingers direndam espresso kuat dan rum (simulasi halal rum), krim keju mascarpone kaya rasa, ditaburi cokelat bubuk Valrhona.',
    category: 'Dessert',
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&q=80&w=600',
    isPopular: true,
    isAvailable: true,
  },

  // 5. SNACK
  {
    id: 's1',
    name: 'Truffle Parmesan Fries',
    price: 26000,
    rating: 4.8,
    description: 'Kentang goreng renyah prima dibaluri minyak truffle putih murni, garam laut gurih, ditaburi keju parmesan parut segar dan peterseli cincang.',
    category: 'Snack',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=600',
    isPopular: true,
    isAvailable: true,
  },
  {
    id: 's2',
    name: 'Flaky Butter Croissant',
    price: 22000,
    rating: 4.7,
    description: 'Roti croissant tradisional ala Paris, renyah berlapis-lapis di luar dan lembut berongga di dalam. Disajikan hangat berkilau mentega prancis.',
    category: 'Snack',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=600',
    isAvailable: true,
  },
  {
    id: 's3',
    name: 'Cinnamon Swirl Classic Roll',
    price: 24000,
    rating: 4.8,
    description: 'Roti gulung rasa kayu manis wangi, disajikan hangat dengan siraman krim keju glase vanila manis lembut meleleh di atas piring.',
    category: 'Snack',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600',
    isAvailable: true,
  }
];

export const PROMO_CODES: PromoCode[] = [
  {
    code: 'MEGABARISTA',
    discountPercentage: 20,
    minSpend: 50000,
    description: 'Diskon 20% untuk semua menu dengan pembelian minimal Rp 50.000 (Maksimal Rp 25.000)'
  },
  {
    code: 'KOPIKINICOZY',
    discountPercentage: 15,
    minSpend: 30000,
    description: 'Diskon 15% spesial penikmat KopiKini dengan minimal pembelian Rp 30.000'
  },
  {
    code: 'FESTIVESAKURA',
    discountPercentage: 25,
    minSpend: 60000,
    description: 'Diskon 25% untuk merayakan musim sakura dengan minimal pembelian Rp 60.000'
  },
  {
    code: 'COFFEEABOUT',
    discountPercentage: 10,
    minSpend: 0,
    description: 'Diskon 10% tanpa batas minimum pembelian khusus untuk pelanggan baru!'
  }
];
