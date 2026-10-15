import { pool, withTransaction } from './index';

interface SeedProduct {
  name: string;
  categorySlug: string;
  price: number;
  stock: number;
  sku: string;
  description: string;
  imageUrl: string;
}

const categoriesData = [
  { name: 'Smartphones & Foldables', slug: 'smartphones' },
  { name: 'Laptops & Computers', slug: 'laptops-computers' },
  { name: 'Audio & Headphones', slug: 'audio-headphones' },
  { name: 'Wearables & Smartwatches', slug: 'wearables-smartwatches' },
  { name: 'Gaming & Consoles', slug: 'gaming-consoles' },
  { name: 'Cameras & Drones', slug: 'cameras-drones' },
  { name: 'Monitors & Displays', slug: 'monitors-displays' },
  { name: 'Computer Accessories', slug: 'computer-accessories' },
  { name: 'Smart Home & Audio', slug: 'smart-home' },
  { name: 'Tablets & E-Readers', slug: 'tablets-ereaders' },
];

// Curated high-resolution exact/category matching images from Unsplash
const images = {
  smartphone: [
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
    'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&q=80',
    'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&q=80',
    'https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=800&q=80',
    'https://images.unsplash.com/photo-1530319067432-f2a729c03db5?w=800&q=80',
    'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&q=80',
    'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80',
  ],
  laptop: [
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
    'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80',
    'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&q=80',
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80',
    'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80',
    'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80',
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
    'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80',
  ],
  audio: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80',
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80',
    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80',
    'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800&q=80',
    'https://images.unsplash.com/photo-1578319439584-104c94d37305?w=800&q=80',
  ],
  wearable: [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80',
    'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80',
    'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=800&q=80',
    'https://images.unsplash.com/photo-1510017803434-a899398421b3?w=800&q=80',
  ],
  gaming: [
    'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&q=80',
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&q=80',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80',
    'https://images.unsplash.com/photo-1580234811497-9df7fd2f357e?w=800&q=80',
    'https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=800&q=80',
    'https://images.unsplash.com/photo-1622297845775-5ff3fef71d13?w=800&q=80',
  ],
  camera: [
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80',
    'https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?w=800&q=80',
    'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?w=800&q=80',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80',
    'https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=800&q=80',
  ],
  monitor: [
    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80',
    'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800&q=80',
    'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800&q=80',
    'https://images.unsplash.com/photo-1551645120-d70bfe84c826?w=800&q=80',
  ],
  accessory: [
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
    'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80',
    'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&q=80',
    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80',
    'https://images.unsplash.com/photo-1629429408209-1f912961dbd8?w=800&q=80',
  ],
  smarthome: [
    'https://images.unsplash.com/photo-1543512214-318c7553f230?w=800&q=80',
    'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80',
    'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=800&q=80',
    'https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?w=800&q=80',
  ],
  tablet: [
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80',
    'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&q=80',
    'https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?w=800&q=80',
    'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=800&q=80',
  ],
};

function generateCatalog(): SeedProduct[] {
  const catalog: SeedProduct[] = [];

  // 1. SMARTPHONES & FOLDABLES (40 items)
  const phoneBrands = ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Nothing', 'Sony'];
  const phoneModels = [
    { base: 'iPhone 15 Pro Max', brand: 'Apple', price: 159900, colors: ['Natural Titanium', 'Blue Titanium', 'Black Titanium', 'White Titanium'], storages: ['256GB', '512GB', '1TB'] },
    { base: 'iPhone 15 Pro', brand: 'Apple', price: 134900, colors: ['Natural Titanium', 'Black Titanium'], storages: ['128GB', '256GB'] },
    { base: 'iPhone 15', brand: 'Apple', price: 79900, colors: ['Black', 'Blue', 'Pink', 'Green', 'Yellow'], storages: ['128GB', '256GB'] },
    { base: 'iPhone 14 Plus', brand: 'Apple', price: 69900, colors: ['Midnight', 'Starlight', 'Purple'], storages: ['128GB'] },
    { base: 'Galaxy S24 Ultra', brand: 'Samsung', price: 129999, colors: ['Titanium Gray', 'Titanium Black', 'Titanium Violet'], storages: ['256GB', '512GB', '1TB'] },
    { base: 'Galaxy S24 Plus', brand: 'Samsung', price: 99999, colors: ['Onyx Black', 'Marble Gray'], storages: ['256GB'] },
    { base: 'Galaxy Z Fold 5', brand: 'Samsung', price: 154999, colors: ['Icy Blue', 'Phantom Black', 'Cream'], storages: ['256GB', '512GB'] },
    { base: 'Galaxy Z Flip 5', brand: 'Samsung', price: 99999, colors: ['Mint', 'Graphite', 'Lavender'], storages: ['256GB'] },
    { base: 'Pixel 8 Pro', brand: 'Google', price: 106999, colors: ['Bay Blue', 'Obsidian', 'Porcelain'], storages: ['128GB', '256GB'] },
    { base: 'Pixel 8', brand: 'Google', price: 75999, colors: ['Hazel', 'Rose', 'Obsidian'], storages: ['128GB'] },
    { base: 'OnePlus 12', brand: 'OnePlus', price: 64999, colors: ['Silky Black', 'Flowy Emerald'], storages: ['256GB', '512GB'] },
    { base: 'OnePlus 12R', brand: 'OnePlus', price: 39999, colors: ['Cool Blue', 'Iron Gray'], storages: ['128GB', '256GB'] },
    { base: 'Nothing Phone 2', brand: 'Nothing', price: 44999, colors: ['Dark Gray', 'White'], storages: ['256GB'] },
    { base: 'Xiaomi 14 Ultra', brand: 'Xiaomi', price: 99999, colors: ['Black Ceramic', 'White Ceramic'], storages: ['512GB'] },
    { base: 'Xperia 1 V', brand: 'Sony', price: 119999, colors: ['Black', 'Khaki Green'], storages: ['256GB'] },
  ];

  let imgIdx = 0;
  for (const m of phoneModels) {
    for (const color of m.colors) {
      for (const storage of m.storages) {
        const name = `${m.brand} ${m.base} (${storage}, ${color})`;
        const sku = `${m.brand.slice(0, 3).toUpperCase()}-${m.base.replace(/\s+/g, '').slice(0, 6).toUpperCase()}-${storage}-${color.slice(0, 3).toUpperCase()}`;
        const price = m.price + (storage === '512GB' ? 15000 : storage === '1TB' ? 35000 : 0);
        catalog.push({
          name,
          categorySlug: 'smartphones',
          price,
          stock: Math.floor(Math.random() * 25) + 3,
          sku,
          description: `Flagship ${m.brand} smartphone with ${storage} high-speed NVMe storage, stunning OLED HDR display, advanced multi-lens camera system, and all-day fast wireless charging.`,
          imageUrl: images.smartphone[imgIdx++ % images.smartphone.length],
        });
      }
    }
  }

  // 2. LAPTOPS & COMPUTERS (45 items)
  const laptopModels = [
    { base: 'MacBook Pro 16" M3 Max', brand: 'Apple', price: 349900, specs: ['36GB RAM / 1TB SSD', '48GB RAM / 1TB SSD', '64GB RAM / 2TB SSD', '128GB RAM / 4TB SSD'] },
    { base: 'MacBook Pro 14" M3 Pro', brand: 'Apple', price: 199900, specs: ['18GB RAM / 512GB SSD', '36GB RAM / 1TB SSD'] },
    { base: 'MacBook Air 15" M3', brand: 'Apple', price: 134900, specs: ['8GB RAM / 256GB SSD', '16GB RAM / 512GB SSD', '24GB RAM / 1TB SSD'] },
    { base: 'MacBook Air 13" M2', brand: 'Apple', price: 99900, specs: ['8GB RAM / 256GB SSD', '16GB RAM / 512GB SSD'] },
    { base: 'Dell XPS 16 (9640)', brand: 'Dell', price: 289990, specs: ['Intel Core Ultra 9 / RTX 4070 / 32GB RAM', 'Intel Core Ultra 7 / RTX 4060 / 16GB RAM'] },
    { base: 'Dell XPS 13 Plus', brand: 'Dell', price: 169990, specs: ['Intel Core i7 / 16GB RAM / 512GB SSD', 'Intel Core i7 / 32GB RAM / 1TB SSD'] },
    { base: 'ROG Zephyrus G16 OLED', brand: 'ASUS', price: 239990, specs: ['Intel Core Ultra 9 / RTX 4080 / 32GB', 'Intel Core Ultra 7 / RTX 4070 / 16GB'] },
    { base: 'ThinkPad X1 Carbon Gen 12', brand: 'Lenovo', price: 214990, specs: ['Core Ultra 7 / 32GB RAM / 1TB SSD', 'Core Ultra 5 / 16GB RAM / 512GB SSD'] },
    { base: 'Legion Pro 7i Gen 9', brand: 'Lenovo', price: 269990, specs: ['Core i9-14900HX / RTX 4090 / 32GB', 'Core i9-14900HX / RTX 4080 / 32GB'] },
    { base: 'Razer Blade 16 Dual Mini-LED', brand: 'Razer', price: 389990, specs: ['Core i9-14900HX / RTX 4090 / 64GB', 'Core i9-14900HX / RTX 4080 / 32GB'] },
    { base: 'HP Spectre x360 14', brand: 'HP', price: 154990, specs: ['Intel Core Ultra 7 / 16GB / 1TB OLED', 'Intel Core Ultra 7 / 32GB / 2TB OLED'] },
    { base: 'Surface Laptop Studio 2', brand: 'Microsoft', price: 249990, specs: ['Core i7 / RTX 4060 / 32GB / 1TB', 'Core i7 / Intel Iris / 16GB / 512GB'] },
    { base: 'Mac Studio M2 Ultra', brand: 'Apple', price: 419900, specs: ['64GB RAM / 1TB SSD', '128GB RAM / 2TB SSD', '192GB RAM / 4TB SSD'] },
    { base: 'Mac mini M2 Pro', brand: 'Apple', price: 129900, specs: ['16GB RAM / 512GB SSD', '32GB RAM / 1TB SSD'] },
  ];

  for (const m of laptopModels) {
    for (const spec of m.specs) {
      const name = `${m.brand} ${m.base} (${spec})`;
      const sku = `LAP-${m.brand.slice(0, 3).toUpperCase()}-${m.base.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;
      const priceModifier = spec.includes('64GB') || spec.includes('4090') || spec.includes('128GB') ? 70000 : spec.includes('32GB') || spec.includes('4080') ? 35000 : 0;
      catalog.push({
        name,
        categorySlug: 'laptops-computers',
        price: m.price + priceModifier,
        stock: Math.floor(Math.random() * 20) + 2,
        sku,
        description: `High-performance computing machine engineered for creators, engineers, and power users. Featuring ${spec}, premium aerospace-grade chassis, and ultra-quiet cooling.`,
        imageUrl: images.laptop[imgIdx++ % images.laptop.length],
      });
    }
  }

  // 3. AUDIO & HEADPHONES (50 items)
  const audioList = [
    { name: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones', brand: 'Sony', price: 29990, colors: ['Black', 'Silver', 'Midnight Blue'] },
    { name: 'Sony WH-1000XM4 Noise Canceling Headphones', brand: 'Sony', price: 22990, colors: ['Black', 'Silver'] },
    { name: 'Apple AirPods Max', brand: 'Apple', price: 59900, colors: ['Space Gray', 'Silver', 'Sky Blue', 'Green', 'Pink'] },
    { name: 'Apple AirPods Pro (2nd Generation, USB-C)', brand: 'Apple', price: 24900, colors: ['White'] },
    { name: 'Apple AirPods (3rd Generation)', brand: 'Apple', price: 19900, colors: ['White'] },
    { name: 'Bose QuietComfort Ultra Wireless Headphones', brand: 'Bose', price: 35900, colors: ['Black', 'White Smoke', 'Sandstone'] },
    { name: 'Bose QuietComfort Ultra Earbuds', brand: 'Bose', price: 25900, colors: ['Black', 'White Smoke'] },
    { name: 'Sennheiser Momentum 4 Wireless Headphones', brand: 'Sennheiser', price: 29990, colors: ['Black', 'White', 'Denim'] },
    { name: 'Sennheiser HD 660S2 Audiophile Headphones', brand: 'Sennheiser', price: 49990, colors: ['Matte Black'] },
    { name: 'Audio-Technica ATH-M50xBT2 Wireless Studio Monitor', brand: 'Audio-Technica', price: 17990, colors: ['Black', 'Ice Blue', 'Deep Sea'] },
    { name: 'Marshall Major IV Wireless Bluetooth On-Ear Headphones', brand: 'Marshall', price: 12999, colors: ['Black', 'Brown'] },
    { name: 'Marshall Monitor II A.N.C. Over-Ear Headphones', brand: 'Marshall', price: 24999, colors: ['Black'] },
    { name: 'Beats Studio Pro Wireless ANC Headphones', brand: 'Beats', price: 37900, colors: ['Black', 'Deep Brown', 'Navy', 'Sandstone'] },
    { name: 'Beats Fit Pro True Wireless Earbuds', brand: 'Beats', price: 22900, colors: ['Beats Black', 'Stone Purple', 'Sage Gray', 'Volt Yellow'] },
    { name: 'Shure AONIC 50 Gen 2 Premium Wireless ANC Headphones', brand: 'Shure', price: 34999, colors: ['Black'] },
    { name: 'JBL Tour ONE M2 Wireless Over-Ear ANC Headphones', brand: 'JBL', price: 19999, colors: ['Black', 'Champagne'] },
    { name: 'Nothing Ear (2024) Hi-Res Wireless Earbuds', brand: 'Nothing', price: 11999, colors: ['White', 'Black'] },
    { name: 'Nothing Ear (a) ANC Wireless Earbuds', brand: 'Nothing', price: 7999, colors: ['Yellow', 'White', 'Black'] },
    { name: 'Samsung Galaxy Buds 2 Pro Studio ANC Earbuds', brand: 'Samsung', price: 16999, colors: ['Graphite', 'White', 'Bora Purple'] },
    { name: 'Sony WF-1000XM5 True Wireless Earbuds', brand: 'Sony', price: 24990, colors: ['Black', 'Silver'] },
  ];

  for (const item of audioList) {
    for (const color of item.colors) {
      const name = `${item.name} - ${color}`;
      const sku = `AUD-${item.brand.slice(0, 3).toUpperCase()}-${Math.floor(Math.random() * 9000 + 1000)}-${color.slice(0, 3).toUpperCase()}`;
      catalog.push({
        name,
        categorySlug: 'audio-headphones',
        price: item.price,
        stock: Math.floor(Math.random() * 30) + 1,
        sku,
        description: `Exceptional acoustic fidelity with custom tuned drivers, industry-leading active noise cancellation, multi-point Bluetooth 5.3, and ultra-comfortable memory foam ergonomics.`,
        imageUrl: images.audio[imgIdx++ % images.audio.length],
      });
    }
  }

  // 4. WEARABLES & SMARTWATCHES (40 items)
  const wearableList = [
    { base: 'Apple Watch Ultra 2 GPS + Cellular 49mm', brand: 'Apple', price: 89900, straps: ['Orange Ocean Band', 'Blue Alpine Loop', 'Trail Loop Green/Gray'] },
    { base: 'Apple Watch Series 9 GPS + Cellular 45mm', brand: 'Apple', price: 54900, straps: ['Midnight Sport Band', 'Starlight Sport Loop', 'Silver Milanese Loop'] },
    { base: 'Apple Watch Series 9 GPS 41mm', brand: 'Apple', price: 41900, straps: ['Pink Sport Band', 'Midnight Sport Loop'] },
    { base: 'Apple Watch SE (2nd Gen) GPS 44mm', brand: 'Apple', price: 29900, straps: ['Midnight Sport Band', 'Starlight Sport Band'] },
    { base: 'Samsung Galaxy Watch 6 Classic 47mm LTE', brand: 'Samsung', price: 43999, straps: ['Black Hybrid Leather', 'Silver Hybrid Leather'] },
    { base: 'Samsung Galaxy Watch 6 44mm Bluetooth', brand: 'Samsung', straps: ['Graphite Sport', 'Silver Sport'], price: 29999 },
    { base: 'Garmin Fenix 7 Pro Sapphire Solar Edition', brand: 'Garmin', straps: ['Carbon Gray Titanium', 'Titanium with Chestnut Leather'], price: 99990 },
    { base: 'Garmin Forerunner 965 GPS AMOLED Running Watch', brand: 'Garmin', straps: ['Black/Powder Gray', 'Amp Yellow', 'Whitestone'], price: 67490 },
    { base: 'Garmin Epix Pro (Gen 2) Sapphire Edition 51mm', brand: 'Garmin', straps: ['Carbon Gray Titanium DLC', 'Titanium White'], price: 111990 },
    { base: 'Google Pixel Watch 2 WiFi + LTE', brand: 'Google', straps: ['Matte Black / Obsidian', 'Polished Silver / Bay', 'Champagne Gold / Hazel'], price: 39999 },
    { base: 'Fitbit Sense 2 Advanced Health Smartwatch', brand: 'Fitbit', straps: ['Shadow Grey / Graphite', 'Lunar White / Platinum'], price: 21999 },
    { base: 'Amazfit Cheetah Pro Premium Running Watch', brand: 'Amazfit', straps: ['Run Track Black'], price: 24999 },
    { base: 'Amazfit GTR 4 Classic Smartwatch', brand: 'Amazfit', straps: ['Superspeed Black', 'Vintage Brown Leather'], price: 16999 },
    { base: 'Whoop 4.0 Fitness Tracker with 12-Month Membership', brand: 'Whoop', straps: ['Onyx Band', 'HydroKnit Ice', 'SuperKnit Camo'], price: 29900 },
  ];

  for (const item of wearableList) {
    for (const strap of item.straps) {
      const name = `${item.brand} ${item.base} with ${strap}`;
      const sku = `WAT-${item.brand.slice(0, 3).toUpperCase()}-${Math.floor(Math.random() * 9000 + 1000)}-${strap.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase()}`;
      catalog.push({
        name,
        categorySlug: 'wearables-smartwatches',
        price: item.price,
        stock: Math.floor(Math.random() * 25) + 2,
        sku,
        description: `Advanced physiological telemetry including ECG monitoring, blood oxygen SpO2, sleep coaching, dual-frequency precision GPS, and 50m water resistance.`,
        imageUrl: images.wearable[imgIdx++ % images.wearable.length],
      });
    }
  }

  // 5. GAMING & CONSOLES (40 items)
  const gamingList = [
    { name: 'Sony PlayStation 5 Slim Disc Edition Console (1TB)', brand: 'Sony', price: 54990, variants: ['Standard Edition', 'Spider-Man 2 Bundle', 'EA Sports FC 24 Bundle'] },
    { name: 'Sony PlayStation 5 Slim Digital Edition (1TB)', brand: 'Sony', price: 44990, variants: ['Standard Digital Edition', 'Fortnite Cobalt Bundle'] },
    { name: 'PlayStation Portal Remote Player', brand: 'Sony', price: 18990, variants: ['Standard White'] },
    { name: 'PlayStation VR2 Horizon Call of the Mountain Bundle', brand: 'Sony', price: 61999, variants: ['Horizon Bundle', 'Standard Headset'] },
    { name: 'DualSense Edge Wireless Controller', brand: 'Sony', price: 18990, variants: ['Pro Performance Edition'] },
    { name: 'Xbox Series X 1TB Gaming Console', brand: 'Microsoft', price: 55990, variants: ['Standard Carbon Black', 'Diablo IV Bundle', 'Forza Horizon 5 Bundle'] },
    { name: 'Xbox Series S 1TB All-Digital Console', brand: 'Microsoft', price: 38990, variants: ['Carbon Black 1TB', 'Robot White 512GB'] },
    { name: 'Xbox Elite Wireless Controller Series 2', brand: 'Microsoft', price: 15990, variants: ['Core Edition Black', 'Core Edition White', 'Complete Edition'] },
    { name: 'Nintendo Switch OLED Model Console', brand: 'Nintendo', price: 34990, variants: ['Neon Blue/Neon Red', 'White Edition', 'Mario Red Edition', 'Zelda Tears of the Kingdom Edition'] },
    { name: 'Steam Deck OLED 1TB Handheld Gaming PC', brand: 'Valve', price: 69999, variants: ['1TB Anti-Glare OLED', '512GB NVMe OLED'] },
    { name: 'ASUS ROG Ally Z1 Extreme Handheld 512GB', brand: 'ASUS', price: 59990, variants: ['Z1 Extreme 512GB', 'Z1 Standard 512GB'] },
    { name: 'Lenovo Legion Go 8.8" QHD Handheld Console', brand: 'Lenovo', price: 68990, variants: ['512GB NVMe', '1TB NVMe'] },
    { name: 'Meta Quest 3 Advanced All-In-One VR Headset', brand: 'Meta', price: 54999, variants: ['128GB Storage', '512GB Storage'] },
    { name: 'NVIDIA GeForce RTX 4090 24GB Founders Edition', brand: 'NVIDIA', price: 179900, variants: ['Founders Edition', 'ASUS ROG Strix OC', 'MSI Gaming X Trio'] },
    { name: 'NVIDIA GeForce RTX 4080 Super 16GB', brand: 'NVIDIA', price: 104990, variants: ['Founders Edition', 'Gigabyte Gaming OC', 'ZOTAC Trinity'] },
    { name: 'NVIDIA GeForce RTX 4070 Ti Super 16GB', brand: 'NVIDIA', price: 84990, variants: ['MSI Ventus 3X', 'ASUS TUF Gaming'] },
  ];

  for (const item of gamingList) {
    for (const v of item.variants) {
      const name = `${item.name} (${v})`;
      const sku = `GAM-${item.brand.slice(0, 3).toUpperCase()}-${Math.floor(Math.random() * 9000 + 1000)}-${v.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase()}`;
      catalog.push({
        name,
        categorySlug: 'gaming-consoles',
        price: item.price + (v.includes('Bundle') ? 4000 : v.includes('1TB') && !item.name.includes('1TB') ? 8000 : 0),
        stock: Math.floor(Math.random() * 15) + 1,
        sku,
        description: `Cutting-edge 4K 120Hz high-frame-rate gaming hardware with hardware-accelerated ray tracing, ultra-fast custom NVMe SSD, and revolutionary haptic immersion.`,
        imageUrl: images.gaming[imgIdx++ % images.gaming.length],
      });
    }
  }

  // 6. CAMERAS & DRONES (35 items)
  const cameraList = [
    { name: 'Sony Alpha 7 IV Full-Frame Mirrorless Camera', brand: 'Sony', price: 214990, kits: ['Body Only', 'with 28-70mm Lens', 'with 24-105mm F4 G OSS Lens'] },
    { name: 'Sony Alpha 7R V High-Resolution Full-Frame Camera', brand: 'Sony', price: 334990, kits: ['Body Only', 'with 24-70mm F2.8 GM II Lens'] },
    { name: 'Sony FX3 Cinema Line Full-Frame Camera', brand: 'Sony', price: 379990, kits: ['Body with XLR Handle Unit'] },
    { name: 'Canon EOS R5 Full-Frame 8K Mirrorless Camera', brand: 'Canon', price: 319995, kits: ['Body Only', 'with RF 24-105mm F4 L IS USM Lens'] },
    { name: 'Canon EOS R6 Mark II Mirrorless Camera', brand: 'Canon', price: 215995, kits: ['Body Only', 'with RF 24-105mm F4-7.1 IS STM Lens'] },
    { name: 'Fujifilm X-T5 Mirrorless Digital Camera', brand: 'Fujifilm', price: 169999, kits: ['Body Only (Black)', 'Body Only (Silver)', 'with XF 16-80mm F4 Lens'] },
    { name: 'Fujifilm X100VI Digital Camera with 23mm F2 Lens', brand: 'Fujifilm', price: 179999, kits: ['Black Edition', 'Silver Edition'] },
    { name: 'Nikon Z8 Full-Frame Mirrorless Camera', brand: 'Nikon', price: 343995, kits: ['Body Only', 'with NIKKOR Z 24-120mm F4 S Lens'] },
    { name: 'DJI Mini 4 Pro Drone with Fly More Combo Plus', brand: 'DJI', price: 114990, kits: ['with DJI RC 2 Controller', 'with DJI RC-N2 Controller'] },
    { name: 'DJI Mavic 3 Pro Cine Drone with Triple Camera System', brand: 'DJI', price: 349990, kits: ['Cine Premium Combo with RC Pro'] },
    { name: 'DJI Air 3 Fly More Combo with Dual Primary Cameras', brand: 'DJI', price: 139990, kits: ['with DJI RC 2 Controller'] },
    { name: 'DJI Osmo Pocket 3 4K 120fps Gimbal Camera', brand: 'DJI', price: 44990, kits: ['Creator Combo with Wireless Mic 2', 'Standard Edition'] },
    { name: 'GoPro HERO12 Black Action Camera', brand: 'GoPro', price: 37990, kits: ['Creator Edition Bundle', 'Standard Edition with Enduro Battery', 'Accessory Bundle'] },
    { name: 'Insta360 X4 8K 360-Degree Waterproof Action Camera', brand: 'Insta360', price: 54990, kits: ['Get-Set Kit with Invisible Selfie Stick', 'Standard Pack'] },
  ];

  for (const item of cameraList) {
    for (const kit of item.kits) {
      const name = `${item.name} (${kit})`;
      const sku = `CAM-${item.brand.slice(0, 3).toUpperCase()}-${Math.floor(Math.random() * 9000 + 1000)}-${kit.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase()}`;
      catalog.push({
        name,
        categorySlug: 'cameras-drones',
        price: item.price + (kit.includes('Lens') || kit.includes('Combo') || kit.includes('Creator') ? 35000 : 0),
        stock: Math.floor(Math.random() * 12) + 2,
        sku,
        description: `Professional imaging system with full-frame BSI sensor, 10-bit 4:2:2 DCI 4K/8K recording, 5-axis IBIS in-body stabilization, and real-time AI subject tracking.`,
        imageUrl: images.camera[imgIdx++ % images.camera.length],
      });
    }
  }

  // 7. MONITORS & DISPLAYS (35 items)
  const monitorList = [
    { name: 'LG UltraGear 27GR95QE 27" QHD 240Hz OLED Gaming Monitor', brand: 'LG', price: 79990, sizes: ['27-inch'] },
    { name: 'LG UltraGear 45GR95QE 45" Curved 240Hz OLED Display', brand: 'LG', price: 169990, sizes: ['45-inch 800R Curve'] },
    { name: 'LG DualUp 28MQ780 28" 16:18 Ergo Stand Monitor', brand: 'LG', price: 54990, sizes: ['28-inch DualUp'] },
    { name: 'Samsung Odyssey OLED G9 49" Dual QHD 240Hz Curved Display', brand: 'Samsung', price: 154999, sizes: ['49-inch 32:9 Aspect'] },
    { name: 'Samsung Odyssey Neo G8 32" 4K 240Hz 1000R Curved Monitor', brand: 'Samsung', price: 99999, sizes: ['32-inch 4K'] },
    { name: 'Samsung ViewFinity S9 27" 5K IPS Professional Display', brand: 'Samsung', price: 119999, sizes: ['27-inch 5K Retina'] },
    { name: 'Apple Studio Display 27" 5K Retina Display', brand: 'Apple', price: 159900, sizes: ['Standard Glass / Tilt-Adjustable', 'Standard Glass / Tilt & Height Adjustable', 'Nano-Texture Glass / VESA Adapter'] },
    { name: 'Apple Pro Display XDR 32" 6K Retina Professional Monitor', brand: 'Apple', price: 449900, sizes: ['Standard Glass', 'Nano-Texture Glass with Pro Stand'] },
    { name: 'Dell UltraSharp 32 4K USB-C Hub Monitor (U3223QE)', brand: 'Dell', price: 79990, sizes: ['32-inch 4K IPS Black'] },
    { name: 'Dell UltraSharp 40 Curved WUHD Monitor (U4025QW)', brand: 'Dell', price: 189990, sizes: ['40-inch 120Hz Thunderbolt 4'] },
    { name: 'ASUS ROG Swift OLED PG32UCDM 32" 4K 240Hz QD-OLED Monitor', brand: 'ASUS', price: 129990, sizes: ['32-inch 4K QD-OLED'] },
    { name: 'BenQ PD3220U 32" 4K Thunderbolt 3 Designer Monitor', brand: 'BenQ', price: 94990, sizes: ['32-inch 100% sRGB / 95% DCI-P3'] },
    { name: 'Alienware 34 Curved QD-OLED Gaming Monitor (AW3423DWF)', brand: 'Alienware', price: 89990, sizes: ['34-inch 165Hz 0.1ms'] },
  ];

  for (const item of monitorList) {
    for (const size of item.sizes) {
      const name = `${item.name} (${size})`;
      const sku = `MON-${item.brand.slice(0, 3).toUpperCase()}-${Math.floor(Math.random() * 9000 + 1000)}-${size.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase()}`;
      catalog.push({
        name,
        categorySlug: 'monitors-displays',
        price: item.price + (size.includes('Nano') ? 40000 : size.includes('Height') ? 25000 : 0),
        stock: Math.floor(Math.random() * 15) + 2,
        sku,
        description: `Ultra-high-resolution workstation display featuring 99% DCI-P3 wide color gamut, hardware calibration, 90W USB-C power delivery, and factory-calibrated Delta E < 2 color accuracy.`,
        imageUrl: images.monitor[imgIdx++ % images.monitor.length],
      });
    }
  }

  // 8. COMPUTER ACCESSORIES (40 items)
  const accessoryList = [
    { name: 'Logitech MX Master 3S Performance Wireless Mouse', brand: 'Logitech', price: 9495, colors: ['Graphite', 'Pale Grey', 'Space Black'] },
    { name: 'Logitech MX Mechanical Wireless Illuminated Keyboard', brand: 'Logitech', price: 14995, colors: ['Tactile Quiet', 'Linear', 'Clicky'] },
    { name: 'Logitech MX Keys S Advanced Wireless Keyboard', brand: 'Logitech', price: 10995, colors: ['Graphite', 'Pale Grey'] },
    { name: 'Logitech G Pro X Superlight 2 Wireless Gaming Mouse', brand: 'Logitech', price: 15995, colors: ['Black', 'White', 'Magenta'] },
    { name: 'Keychron Q1 Pro Wireless Custom Mechanical Keyboard', brand: 'Keychron', price: 19999, colors: ['Carbon Black (Red Switch)', 'Silver Grey (Brown Switch)', 'Shell White (Banana Switch)'] },
    { name: 'Keychron K3 Pro Ultra-Slim Wireless Custom Keyboard', brand: 'Keychron', price: 9999, colors: ['Low Profile Red', 'Low Profile Brown', 'Low Profile Blue'] },
    { name: 'Razer DeathAdder V3 Pro Wireless Gaming Mouse', brand: 'Razer', price: 14999, colors: ['Black', 'White', 'Faker Edition Red'] },
    { name: 'Razer Huntsman V3 Pro Analog Optical Gaming Keyboard', brand: 'Razer', price: 22999, colors: ['Black / Gen-2 Analog Optical Switches'] },
    { name: 'Apple Magic Keyboard with Touch ID and Numeric Keypad', brand: 'Apple', price: 19500, colors: ['Black Keys', 'White Keys'] },
    { name: 'Apple Magic Trackpad Multi-Touch Surface', brand: 'Apple', price: 14500, colors: ['Black', 'White'] },
    { name: 'Apple Magic Mouse Wireless Multi-Touch Surface', brand: 'Apple', price: 9500, colors: ['Black', 'White'] },
    { name: 'Elgato Stream Deck MK.2 15 LCD Keys Studio Controller', brand: 'Elgato', price: 14990, colors: ['Black', 'White'] },
    { name: 'Elgato Wave:3 Premium USB Condenser Microphone', brand: 'Elgato', price: 13990, colors: ['Black', 'White'] },
    { name: 'Shure SM7B Cardioid Dynamic Vocal Microphone', brand: 'Shure', price: 36990, colors: ['Matte Black'] },
    { name: 'CalDigit TS4 Thunderbolt 4 18-Port Station Dock (98W)', brand: 'CalDigit', price: 39999, colors: ['Space Gray Aluminum'] },
  ];

  for (const item of accessoryList) {
    for (const color of item.colors) {
      const name = `${item.name} - ${color}`;
      const sku = `ACC-${item.brand.slice(0, 3).toUpperCase()}-${Math.floor(Math.random() * 9000 + 1000)}-${color.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase()}`;
      catalog.push({
        name,
        categorySlug: 'computer-accessories',
        price: item.price,
        stock: Math.floor(Math.random() * 40) + 5,
        sku,
        description: `Ergonomic desktop hardware crafted for seamless productivity and competitive gaming. Features seamless multi-device Bluetooth switching, hot-swappable switches, and programmable shortcuts.`,
        imageUrl: images.accessory[imgIdx++ % images.accessory.length],
      });
    }
  }

  // 9. SMART HOME & AUDIO (35 items)
  const smarthomeList = [
    { name: 'Sonos Era 300 Spatial Audio Smart Speaker with Dolby Atmos', brand: 'Sonos', price: 44999, colors: ['Black', 'White'] },
    { name: 'Sonos Era 100 Next-Gen Smart Speaker', brand: 'Sonos', price: 29999, colors: ['Black', 'White'] },
    { name: 'Sonos Arc Premium Smart Soundbar with Dolby Atmos', brand: 'Sonos', price: 89999, colors: ['Black', 'White'] },
    { name: 'Sonos Sub (Gen 3) Wireless Subwoofer', brand: 'Sonos', price: 74999, colors: ['Black Gloss', 'White Gloss'] },
    { name: 'Apple HomePod (2nd Generation) High-Fidelity Smart Speaker', brand: 'Apple', price: 32900, colors: ['Midnight', 'White'] },
    { name: 'Apple HomePod mini Compact Smart Speaker', brand: 'Apple', price: 10900, colors: ['Space Gray', 'White', 'Blue', 'Orange', 'Yellow'] },
    { name: 'Amazon Echo Studio High-Fidelity Smart Speaker with Alexa', brand: 'Amazon', price: 22999, colors: ['Charcoal', 'Glacier White'] },
    { name: 'Amazon Echo Show 10 (3rd Gen) HD Smart Display with Motion', brand: 'Amazon', price: 24999, colors: ['Charcoal', 'Glacier White'] },
    { name: 'Google Nest Hub Max 10" Smart Display with Google Assistant', brand: 'Google', price: 21999, colors: ['Chalk', 'Charcoal'] },
    { name: 'Philips Hue White and Color Ambiance Starter Kit (3 Bulbs + Bridge)', brand: 'Philips', price: 14999, colors: ['E27 Screw Base', 'B22 Bayonet Base'] },
    { name: 'Dyson Purifier Hot+Cool Formaldehyde HP09 Air Purifier & Heater', brand: 'Dyson', price: 68900, colors: ['White / Gold', 'Nickel / Gold'] },
    { name: 'Roborock S8 Pro Ultra Robot Vacuum and Mop with RockDock Ultra', brand: 'Roborock', price: 129999, colors: ['Black Edition', 'White Edition'] },
  ];

  for (const item of smarthomeList) {
    for (const color of item.colors) {
      const name = `${item.name} (${color})`;
      const sku = `HOM-${item.brand.slice(0, 3).toUpperCase()}-${Math.floor(Math.random() * 9000 + 1000)}-${color.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase()}`;
      catalog.push({
        name,
        categorySlug: 'smart-home',
        price: item.price,
        stock: Math.floor(Math.random() * 20) + 3,
        sku,
        description: `Intelligent connected home appliance compatible with Apple HomeKit, Google Home, and Matter protocol with voice automation and automated schedules.`,
        imageUrl: images.smarthome[imgIdx++ % images.smarthome.length],
      });
    }
  }

  // 10. TABLETS & E-READERS (35 items)
  const tabletList = [
    { base: 'iPad Pro 13-inch (M4 Chip) Ultra Retina XDR OLED', brand: 'Apple', price: 129900, colors: ['Space Black', 'Silver'], storages: ['256GB WiFi', '512GB WiFi', '1TB WiFi + Cellular', '2TB Nano-Texture WiFi + Cellular'] },
    { base: 'iPad Pro 11-inch (M4 Chip) Ultra Retina XDR OLED', brand: 'Apple', price: 99900, colors: ['Space Black', 'Silver'], storages: ['256GB WiFi', '512GB WiFi', '1TB WiFi + Cellular'] },
    { base: 'iPad Air 13-inch (M2 Chip) Liquid Retina Display', brand: 'Apple', price: 79900, colors: ['Space Gray', 'Blue', 'Purple', 'Starlight'], storages: ['128GB WiFi', '256GB WiFi'] },
    { base: 'iPad Air 11-inch (M2 Chip) Liquid Retina Display', brand: 'Apple', price: 59900, colors: ['Space Gray', 'Blue', 'Purple', 'Starlight'], storages: ['128GB WiFi', '256GB WiFi'] },
    { base: 'iPad mini 6 (8.3-inch Liquid Retina Display)', brand: 'Apple', price: 49900, colors: ['Space Gray', 'Pink', 'Purple', 'Starlight'], storages: ['64GB WiFi', '256GB WiFi'] },
    { base: 'Apple Pencil Pro with Barrel Roll & Haptic Feedback', brand: 'Apple', price: 11900, colors: ['White'], storages: ['Universal'] },
    { base: 'Galaxy Tab S9 Ultra 14.6" Dynamic AMOLED 2X Display (with S Pen)', brand: 'Samsung', price: 108999, colors: ['Graphite', 'Beige'], storages: ['256GB WiFi', '512GB 5G'] },
    { base: 'Galaxy Tab S9+ 12.4" Dynamic AMOLED 2X Display (with S Pen)', brand: 'Samsung', price: 90999, colors: ['Graphite', 'Beige'], storages: ['256GB WiFi'] },
    { base: 'Kindle Paperwhite Signature Edition 32GB (6.8" 300 ppi)', brand: 'Amazon', price: 17999, colors: ['Black', 'Agave Green', 'Denim'], storages: ['32GB WiFi'] },
    { base: 'Kindle Scribe 10.2" 300 ppi E-Ink Notebook (with Premium Pen)', brand: 'Amazon', price: 34999, colors: ['Tungsten'], storages: ['16GB', '32GB', '64GB'] },
    { base: 'reMarkable 2 Next-Gen Paper Tablet with Marker Plus', brand: 'reMarkable', price: 49999, colors: ['Anodized Aluminum'], storages: ['8GB Cloud Sync'] },
  ];

  for (const item of tabletList) {
    for (const color of item.colors) {
      for (const storage of item.storages) {
        const name = `${item.brand} ${item.base} (${storage}, ${color})`;
        const sku = `TAB-${item.brand.slice(0, 3).toUpperCase()}-${item.base.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase()}-${storage.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase()}-${color.slice(0, 3).toUpperCase()}`;
        const priceModifier = storage.includes('1TB') ? 40000 : storage.includes('2TB') ? 90000 : storage.includes('512GB') ? 20000 : storage.includes('Cellular') ? 16000 : 0;
        catalog.push({
          name,
          categorySlug: 'tablets-ereaders',
          price: item.price + priceModifier,
          stock: Math.floor(Math.random() * 25) + 3,
          sku,
          description: `Stunning portable digital canvas with tandem OLED / paper-like display, pressure-sensitive stylus handwriting support, and ultra-lightweight slim unibody design.`,
          imageUrl: images.tablet[imgIdx++ % images.tablet.length],
        });
      }
    }
  }

  return catalog;
}

export async function runSeed() {
  console.log('🌱 Starting full catalog seed (350+ realistic hardware products)...');

  await withTransaction(async (client) => {
    // 1. Ensure Seller User exists
    let sellerId = 2;
    const sellerCheck = await client.query(`SELECT id FROM users WHERE role = 'SELLER' LIMIT 1`);
    if (sellerCheck.rows.length > 0) {
      sellerId = sellerCheck.rows[0].id;
    } else {
      const newSeller = await client.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, role)
        VALUES ('priya@seller.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Priya', 'Verma', 'SELLER')
        RETURNING id
      `);
      sellerId = newSeller.rows[0].id;
    }

    // 2. Insert Categories
    console.log('📦 Upserting categories...');
    const categoryMap = new Map<string, number>();
    for (const cat of categoriesData) {
      const res = await client.query(
        `INSERT INTO categories (name, slug) 
         VALUES ($1, $2) 
         ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug 
         RETURNING id`,
        [cat.name, cat.slug]
      );
      categoryMap.set(cat.slug, res.rows[0].id);
    }

    // 3. Generate 350+ Products
    const products = generateCatalog();
    console.log(`🚀 Inserting ${products.length} products with live inventory...`);

    let insertedCount = 0;
    for (const p of products) {
      const categoryId = categoryMap.get(p.categorySlug) || 1;

      // Insert Product
      const prodRes = await client.query(
        `INSERT INTO products (seller_id, category_id, name, description, price, sku, image_url, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true)
         ON CONFLICT (sku) DO UPDATE 
         SET name = EXCLUDED.name,
             price = EXCLUDED.price,
             description = EXCLUDED.description,
             image_url = EXCLUDED.image_url,
             category_id = EXCLUDED.category_id
         RETURNING id`,
        [sellerId, categoryId, p.name, p.description, p.price, p.sku, p.imageUrl]
      );

      const productId = prodRes.rows[0].id;

      // Insert/Update Inventory
      await client.query(
        `INSERT INTO inventory (product_id, quantity, reserved_quantity)
         VALUES ($1, $2, 0)
         ON CONFLICT (product_id) DO UPDATE
         SET quantity = EXCLUDED.quantity`,
        [productId, p.stock]
      );

      insertedCount++;
    }

    console.log(`✅ Successfully seeded ${insertedCount} products across ${categoriesData.length} categories!`);
  });

  await pool.end();
}

runSeed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
