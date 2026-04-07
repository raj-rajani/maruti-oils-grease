import { storage } from "./storage";
import { db, sqlite } from "./db";
import { categories, products, users, siteSettings } from "@shared/schema";

// Map of product names to their real image paths
const IMAGE_MAP: Record<string, string> = {
  // Existing products
  "MGO 20W40 (Castrol)": "/images/castrol-20w40.jpg",
  "MGO 20W40 (Shell)": "/images/shell-20w40.jpg",
  "MGO 5W30 (IOCL)": "/images/iocl-5w30.jpg",
  "MGO 5W30 (Castrol)": "/images/castrol-5w30.jpg",
  "MGO 0W20 (Mobil)": "/images/mobil-0w20.jpg",
  "MGO 0W16 (Shell)": "/images/shell-0w16.jpg",
  "MGO 0W20 (IOCL)": "/images/iocl-0w20.jpg",
  "MGDO 15W40 (Castrol)": "/images/castrol-diesel-15w40.jpg",
  "MGDO 5W30 (Shell)": "/images/shell-diesel-5w30.jpg",
  "MGDO 5W40 (Mobil)": "/images/mobil-diesel-5w40.jpg",
  "MGDO 15W40 (IOCL)": "/images/iocl-diesel-15w40.jpg",
  "MGDO 5W40 (Petronas)": "/images/petronas-5w40.jpg",
  "MGGO 75W90 (Shell)": "/images/shell-gear-75w90.jpg",
  "MGGO 80W90 (IOCL)": "/images/iocl-gear-80w90.jpg",
  "MGGO 75W90 (Total)": "/images/total-gear-75w90.jpg",
  "MGGO 80W90 (Shell)": "/images/shell-gear-80w90.jpg",
  "Synthetic 5W40 (Castrol Edge)": "/images/castrol-edge-5w40.jpg",
  "Synthetic 0W40 (Mobil 1)": "/images/mobil1-0w40.jpg",
  "Synthetic 5W30 (Castrol Magnatec)": "/images/castrol-magnatec-5w30.jpg",
  "Synthetic 0W40 (IOCL)": "/images/iocl-synthetic-0w40.jpg",
  "AP3 Grease (Castrol)": "/images/castrol-ap3-grease.jpg",
  "Lithium Grease EP2": "/images/iocl-lithium-ep2.jpg",
  "Chassis Grease": "/images/shell-chassis-grease.jpg",
  "Wheel Bearing Grease": "/images/mobil-wheel-bearing.jpg",
  "High Temp Grease": "/images/castrol-ht-grease.jpg",
  "Hydraulic Oil 68 (IOCL Servo)": "/images/iocl-hydraulic-68.jpg",
  "Hydraulic Oil 46 (Shell Tellus)": "/images/shell-hydraulic-46.jpg",
  "Hydraulic Oil 32": "/images/castrol-hydraulic-32.jpg",
  "Brake Fluid DOT3": "/images/brake-fluid-dot3.jpg",
  "Engine Coolant (Green)": "/images/coolant-green.jpg",
  "Injector Cleaner": "/images/injector-cleaner.jpg",
  "Super Lubricant Spray": "/images/super-lubricant.jpg",

  // New Remmzol Engine Oils
  "Arzol 4T Eco 20W40": "/images/remmzol-20w40.jpg",
  "Arzol 4T Galop 20W40": "/images/remmzol-20w40.jpg",
  "Remmzol 4T 10W30 (SL)": "/images/remmzol-20w40.jpg",
  "Remmzol 4T 10W40 (SN) Semi Synthetic": "/images/remmzol-20w40.jpg",
  "Remmzol 4T 20W40 (SL)": "/images/remmzol-20w40.jpg",
  "Remmzol 4T 20W40 (SP)": "/images/remmzol-20w40.jpg",
  "Remmzol 4T Moped (SL)": "/images/remmzol-20w40.jpg",
  "Remmzol 4T Rodies 5W30 (SP)": "/images/remmzol-5w30.jpg",
  "Remmzol 4T Rodies (SP)": "/images/remmzol-20w40.jpg",
  "Remmzol Bullet Special 15W50 (SN)": "/images/remmzol-20w40.jpg",
  "Remmzol Classic 20W50 (SN)": "/images/remmzol-20w40.jpg",
  "Remmzol CNG King 20W50 (SN)": "/images/remmzol-20w40.jpg",

  // New Remmzol Synthetic Oils
  "Remmzol Cruiser 5W30 (SN/CF)": "/images/remmzol-5w30.jpg",
  "Remmzol Magnasym 0W16": "/images/remmzol-5w30.jpg",
  "Remmzol Magnasym 0W20": "/images/remmzol-5w30.jpg",
  "Remmzol Magnasym 5W30 (SP)": "/images/remmzol-5w30.jpg",

  // New Remmzol Diesel Oils
  "Remmzol MG 15W40 (CF4)": "/images/remmzol-20w40.jpg",
  "Remmzol MG 15W40 (CI4+)": "/images/remmzol-20w40.jpg",
  "Remmzol MG 15W40 (CK4)": "/images/remmzol-20w40.jpg",
  "Remmzol MG 20W40 (CF4)": "/images/remmzol-20w40.jpg",
  "Remmzol MG 20W40 (CH4)": "/images/remmzol-20w40.jpg",

  // New Remmzol Gear Oils
  "Remmzol Gear 80W90 (GL5)": "/images/remmzol-gear-oil.jpg",
  "Remmzol Gear 85W140 (GL5)": "/images/remmzol-gear-oil.jpg",
  "Remmzol Gear EP 140 (GL4)": "/images/remmzol-gear-oil.jpg",
  "Remmzol Gear EP 90 (GL4)": "/images/remmzol-gear-oil.jpg",

  // New Remmzol Hydraulic Oils
  "Remmzol Hydraulic 68": "/images/iocl-hydraulic-68.jpg",
  "Remmzol Hydraulic HLP (32/46/68)": "/images/iocl-hydraulic-68.jpg",
  "Remmzol Hydraulic HUV-WW": "/images/iocl-hydraulic-68.jpg",

  // New Remmzol Coolants
  "Remmzol Anti Freeze (1:3)": "/images/remmzol-coolant.jpg",
  "Remmzol Dex Cool (1:3)": "/images/remmzol-coolant.jpg",
  "Remmzol Dex Cool (1:9)": "/images/remmzol-coolant.jpg",

  // ATF
  "Remmzol ATF (TQ)": "/images/remmzol-atf.jpg",

  // Industrial Gear Oils
  "Remmzol Ind Gear No.100": "/images/remmzol-gear-oil.jpg",
  "Remmzol Ind Gear No.150": "/images/remmzol-gear-oil.jpg",
  "Remmzol Ind Gear No.220": "/images/remmzol-gear-oil.jpg",
  "Remmzol Ind Gear No.320": "/images/remmzol-gear-oil.jpg",
  "Remmzol Ind Gear No.460": "/images/remmzol-gear-oil.jpg",

  // Bentonite
  "Bentonite Carbon Coating Granules": "/images/bentonite-granules.jpg",
  "Bentonite Carbon Powder": "/images/bentonite-powder.jpg",
  "Bentonite Roasted Powder": "/images/bentonite-powder.jpg",
  "Bentonite Rock": "/images/bentonite-rock.jpg",
  "Bentonite Roasted Granules (5/6mm)": "/images/bentonite-granules.jpg",
  "Bentonite Roasted Granules (Mix)": "/images/bentonite-granules.jpg",

  // Specialty
  "Remmzol AMT Synthetic": "/images/remmzol-5w30.jpg",
  "NBC 2T": "/images/remmzol-20w40.jpg",
};

function updateExistingImages() {
  // Update image URLs for all existing products that still use placeholder images
  const allProducts = storage.getProducts();
  for (const prod of allProducts) {
    const newUrl = IMAGE_MAP[prod.name];
    if (newUrl && prod.imageUrl !== newUrl) {
      storage.updateProduct(prod.id, { imageUrl: newUrl });
    }
  }
  console.log("Updated product images to real photos.");
}

export function seedDatabase() {
  // Ensure all tables exist
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      sort_order INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      category_id INTEGER NOT NULL,
      price TEXT,
      unit TEXT DEFAULT 'L',
      pack_size TEXT,
      brand TEXT,
      grade TEXT,
      stock_qty INTEGER DEFAULT 0,
      in_stock INTEGER DEFAULT 1,
      image_url TEXT,
      featured INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS site_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE,
      value TEXT NOT NULL
    );
  `);

  // Check if already seeded
  const existingCats = storage.getCategories();
  if (existingCats.length > 0) {
    // Even if already seeded, update image URLs to real product photos
    updateExistingImages();
    return;
  }

  // Create admin user (password: admin123)
  const existingAdmin = storage.getUserByUsername("admin");
  if (!existingAdmin) {
    storage.createUser({ username: "admin", password: "admin123" });
  }

  // Seed default site settings
  storage.setSetting("businessName", "MARUTI OILS & GREASE");
  storage.setSetting("tagline", "Authorized Dealer · Lubricants & Greases");
  storage.setSetting("phone", "9427287074");
  storage.setSetting("address", "3rd Floor, 312, Spentha Complex, Race Course Road, GST Bhawan, Vadodara, Gujarat - 390007");
  storage.setSetting("gstin", "24ACQPR0924A3ZT");
  storage.setSetting("appDownloadLink", "https://play.google.com/store/apps/details?id=com.valorem.flostore");

  // Create categories
  const catData = [
    { name: "Engine Oils", description: "Genuine engine oils for petrol and diesel vehicles", sortOrder: 1 },
    { name: "Diesel Oils", description: "High-performance diesel engine oils", sortOrder: 2 },
    { name: "Gear Oils", description: "Transmission and gear oils for smooth shifting", sortOrder: 3 },
    { name: "Synthetic Oils", description: "Premium fully synthetic engine oils", sortOrder: 4 },
    { name: "Greases", description: "Industrial and automotive greases", sortOrder: 5 },
    { name: "Hydraulic Oils", description: "Hydraulic system fluids for machinery", sortOrder: 6 },
    { name: "Coolants & Fluids", description: "Brake fluids, coolants, and specialty chemicals", sortOrder: 7 },
    { name: "2-Stroke Oils", description: "2T oils for two-stroke engines", sortOrder: 8 },
    { name: "Transmission Fluids", description: "Automatic transmission fluids (ATF)", sortOrder: 9 },
    { name: "Industrial Gear Oils", description: "Industrial grade gear oils", sortOrder: 10 },
    { name: "Industrial Minerals", description: "Bentonite and mineral products", sortOrder: 11 },
    { name: "Specialty Oils", description: "AMT synthetic and specialty oils", sortOrder: 12 },
  ];

  const cats: Record<string, number> = {};
  for (const cat of catData) {
    const created = storage.createCategory(cat);
    cats[cat.name] = created.id;
  }

  // Seed products with realistic data
  const productData = [
    // ── Engine Oils (existing 7) ──────────────────────────────────────────────
    { name: "MGO 20W40 (Castrol)", categoryId: cats["Engine Oils"], price: "₹310/L", unit: "L", packSize: "3L", brand: "Castrol", grade: "20W40", stockQty: 120, inStock: true, imageUrl: "/images/castrol-20w40.jpg", featured: true },
    { name: "MGO 20W40 (Shell)", categoryId: cats["Engine Oils"], price: "₹315/L", unit: "L", packSize: "3L", brand: "Shell", grade: "20W40", stockQty: 85, inStock: true, imageUrl: "/images/shell-20w40.jpg" },
    { name: "MGO 5W30 (IOCL)", categoryId: cats["Engine Oils"], price: "₹365/L", unit: "L", packSize: "3.5L", brand: "IOCL", grade: "5W30", stockQty: 60, inStock: true, imageUrl: "/images/iocl-5w30.jpg", featured: true },
    { name: "MGO 5W30 (Castrol)", categoryId: cats["Engine Oils"], price: "₹370/L", unit: "L", packSize: "3.5L", brand: "Castrol", grade: "5W30", stockQty: 45, inStock: true, imageUrl: "/images/castrol-5w30.jpg" },
    { name: "MGO 0W20 (Mobil)", categoryId: cats["Engine Oils"], price: "₹420/L", unit: "L", packSize: "3.5L", brand: "Mobil", grade: "0W20", stockQty: 30, inStock: true, imageUrl: "/images/mobil-0w20.jpg" },
    { name: "MGO 0W16 (Shell)", categoryId: cats["Engine Oils"], price: "₹460/L", unit: "L", packSize: "3.5L", brand: "Shell", grade: "0W16", stockQty: 25, inStock: true, imageUrl: "/images/shell-0w16.jpg" },
    { name: "MGO 0W20 (IOCL)", categoryId: cats["Engine Oils"], price: "₹410/L", unit: "L", packSize: "3.5L", brand: "IOCL", grade: "0W20", stockQty: 0, inStock: false, imageUrl: "/images/iocl-0w20.jpg" },

    // ── Engine Oils (new Remmzol / Arzol) ────────────────────────────────────
    { name: "Arzol 4T Eco 20W40", categoryId: cats["Engine Oils"], price: "₹9,612/55L", unit: "L", packSize: "55L", brand: "Arzol", grade: "20W40", stockQty: 0, inStock: false, imageUrl: "/images/remmzol-20w40.jpg", description: "Also available in smaller pack sizes." },
    { name: "Arzol 4T Galop 20W40", categoryId: cats["Engine Oils"], price: "₹10,991/55L", unit: "L", packSize: "55L", brand: "Arzol", grade: "20W40", stockQty: 0, inStock: false, imageUrl: "/images/remmzol-20w40.jpg", description: "Also available in smaller pack sizes." },
    { name: "Remmzol 4T 10W30 (SL)", categoryId: cats["Engine Oils"], price: "₹177/L", unit: "L", packSize: "1L", brand: "Remmzol", grade: "10W30", stockQty: 0, inStock: false, imageUrl: "/images/remmzol-20w40.jpg", description: "Also available in 900ml, 50L, 210L." },
    { name: "Remmzol 4T 10W40 (SN) Semi Synthetic", categoryId: cats["Engine Oils"], price: "₹255/L", unit: "L", packSize: "1L", brand: "Remmzol", grade: "10W40", stockQty: 0, inStock: false, imageUrl: "/images/remmzol-20w40.jpg", description: "Semi Synthetic. Also available in 900ml, 50L, 210L." },
    { name: "Remmzol 4T 20W40 (SL)", categoryId: cats["Engine Oils"], price: "₹177/L", unit: "L", packSize: "1L", brand: "Remmzol", grade: "20W40", stockQty: 0, inStock: false, imageUrl: "/images/remmzol-20w40.jpg", description: "Also available in 900ml, 50L, 210L." },
    { name: "Remmzol 4T 20W40 (SP)", categoryId: cats["Engine Oils"], price: "₹303/L", unit: "L", packSize: "1L", brand: "Remmzol", grade: "20W40", stockQty: 0, inStock: false, imageUrl: "/images/remmzol-20w40.jpg", description: "Also available in 900ml, 50L, 210L." },
    { name: "Remmzol 4T Moped (SL)", categoryId: cats["Engine Oils"], price: "₹146/800ml", unit: "Bottle", packSize: "800ml", brand: "Remmzol", grade: "SL", stockQty: 0, inStock: false, imageUrl: "/images/remmzol-20w40.jpg" },
    { name: "Remmzol 4T Rodies 5W30 (SP)", categoryId: cats["Engine Oils"], price: "₹204/650ml", unit: "Bottle", packSize: "650ml", brand: "Remmzol", grade: "5W30", stockQty: 0, inStock: false, imageUrl: "/images/remmzol-5w30.jpg" },
    { name: "Remmzol 4T Rodies (SP)", categoryId: cats["Engine Oils"], price: "₹206/800ml", unit: "Bottle", packSize: "800ml", brand: "Remmzol", grade: "SP", stockQty: 0, inStock: false, imageUrl: "/images/remmzol-20w40.jpg" },
    { name: "Remmzol Bullet Special 15W50 (SN)", categoryId: cats["Engine Oils"], price: "₹667/2.5L", unit: "L", packSize: "2.5L", brand: "Remmzol", grade: "15W50", stockQty: 0, inStock: false, imageUrl: "/images/remmzol-20w40.jpg" },
    { name: "Remmzol Classic 20W50 (SN)", categoryId: cats["Engine Oils"], price: "₹823/3.5L", unit: "L", packSize: "3.5L", brand: "Remmzol", grade: "20W50", stockQty: 0, inStock: false, imageUrl: "/images/remmzol-20w40.jpg" },
    { name: "Remmzol CNG King 20W50 (SN)", categoryId: cats["Engine Oils"], price: "₹413/2.1L", unit: "L", packSize: "2.1L", brand: "Remmzol", grade: "20W50", stockQty: 0, inStock: false, imageUrl: "/images/remmzol-20w40.jpg", description: "For 4-Stroke Auto Rickshaw." },

    // ── Diesel Oils (existing 5) ──────────────────────────────────────────────
    { name: "MGDO 15W40 (Castrol)", categoryId: cats["Diesel Oils"], price: "₹460/L", unit: "L", packSize: "3.5L", brand: "Castrol", grade: "15W40", stockQty: 55, inStock: true, imageUrl: "/images/castrol-diesel-15w40.jpg", featured: true },
    { name: "MGDO 5W30 (Shell)", categoryId: cats["Diesel Oils"], price: "₹610/L", unit: "L", packSize: "3.5L", brand: "Shell", grade: "5W30", stockQty: 40, inStock: true, imageUrl: "/images/shell-diesel-5w30.jpg" },
    { name: "MGDO 5W40 (Mobil)", categoryId: cats["Diesel Oils"], price: "₹620/L", unit: "L", packSize: "4L", brand: "Mobil", grade: "5W40", stockQty: 35, inStock: true, imageUrl: "/images/mobil-diesel-5w40.jpg" },
    { name: "MGDO 15W40 (IOCL)", categoryId: cats["Diesel Oils"], price: "₹445/L", unit: "L", packSize: "3.5L", brand: "IOCL", grade: "15W40", stockQty: 70, inStock: true, imageUrl: "/images/iocl-diesel-15w40.jpg" },
    { name: "MGDO 5W40 (Petronas)", categoryId: cats["Diesel Oils"], price: "₹615/L", unit: "L", packSize: "3.5L", brand: "Petronas", grade: "5W40", stockQty: 0, inStock: false, imageUrl: "/images/petronas-5w40.jpg" },

    // ── Diesel Oils (new Remmzol MG) ─────────────────────────────────────────
    { name: "Remmzol MG 15W40 (CF4)", categoryId: cats["Diesel Oils"], price: "₹195/L", unit: "L", packSize: "1L", brand: "Remmzol", grade: "15W40", stockQty: 0, inStock: false, imageUrl: "/images/remmzol-20w40.jpg", description: "Also available in 26L, 210L." },
    { name: "Remmzol MG 15W40 (CI4+)", categoryId: cats["Diesel Oils"], price: "₹256/L", unit: "L", packSize: "1L", brand: "Remmzol", grade: "15W40", stockQty: 0, inStock: false, imageUrl: "/images/remmzol-20w40.jpg", description: "Also available in 26L, 210L." },
    { name: "Remmzol MG 15W40 (CK4)", categoryId: cats["Diesel Oils"], price: "₹5,830/26L", unit: "L", packSize: "26L", brand: "Remmzol", grade: "15W40", stockQty: 0, inStock: false, imageUrl: "/images/remmzol-20w40.jpg" },
    { name: "Remmzol MG 20W40 (CF4)", categoryId: cats["Diesel Oils"], price: "₹4,154/26L", unit: "L", packSize: "26L", brand: "Remmzol", grade: "20W40", stockQty: 0, inStock: false, imageUrl: "/images/remmzol-20w40.jpg" },
    { name: "Remmzol MG 20W40 (CH4)", categoryId: cats["Diesel Oils"], price: "₹196/L", unit: "L", packSize: "1L", brand: "Remmzol", grade: "20W40", stockQty: 0, inStock: false, imageUrl: "/images/remmzol-20w40.jpg", description: "Also available in 26L, 210L." },

    // ── Gear Oils (existing 4) ────────────────────────────────────────────────
    { name: "MGGO 75W90 (Shell)", categoryId: cats["Gear Oils"], price: "₹380/L", unit: "L", packSize: "1L", brand: "Shell", grade: "75W90", stockQty: 90, inStock: true, imageUrl: "/images/shell-gear-75w90.jpg", featured: true },
    { name: "MGGO 80W90 (IOCL)", categoryId: cats["Gear Oils"], price: "₹340/L", unit: "L", packSize: "1L", brand: "IOCL", grade: "80W90", stockQty: 110, inStock: true, imageUrl: "/images/iocl-gear-80w90.jpg" },
    { name: "MGGO 75W90 (Total)", categoryId: cats["Gear Oils"], price: "₹390/L", unit: "L", packSize: "20L", brand: "Total", grade: "75W90", stockQty: 15, inStock: true, imageUrl: "/images/total-gear-75w90.jpg" },
    { name: "MGGO 80W90 (Shell)", categoryId: cats["Gear Oils"], price: "₹350/L", unit: "L", packSize: "20L", brand: "Shell", grade: "80W90", stockQty: 20, inStock: true, imageUrl: "/images/shell-gear-80w90.jpg" },

    // ── Gear Oils (new Remmzol) ───────────────────────────────────────────────
    { name: "Remmzol Gear 80W90 (GL5)", categoryId: cats["Gear Oils"], price: "₹211/L", unit: "L", packSize: "1L", brand: "Remmzol", grade: "80W90", stockQty: 0, inStock: false, imageUrl: "/images/remmzol-gear-oil.jpg", description: "Also available in 26L, 210L." },
    { name: "Remmzol Gear 85W140 (GL5)", categoryId: cats["Gear Oils"], price: "₹215/L", unit: "L", packSize: "1L", brand: "Remmzol", grade: "85W140", stockQty: 0, inStock: false, imageUrl: "/images/remmzol-gear-oil.jpg", description: "Also available in 26L, 210L." },
    { name: "Remmzol Gear EP 140 (GL4)", categoryId: cats["Gear Oils"], price: "₹208/L", unit: "L", packSize: "1L", brand: "Remmzol", grade: "EP 140", stockQty: 0, inStock: false, imageUrl: "/images/remmzol-gear-oil.jpg", description: "Also available in 26L, 210L." },
    { name: "Remmzol Gear EP 90 (GL4)", categoryId: cats["Gear Oils"], price: "₹205/L", unit: "L", packSize: "1L", brand: "Remmzol", grade: "EP 90", stockQty: 0, inStock: false, imageUrl: "/images/remmzol-gear-oil.jpg", description: "Also available in 26L, 210L." },

    // ── Synthetic Oils (existing 4) ───────────────────────────────────────────
    { name: "Synthetic 5W40 (Castrol Edge)", categoryId: cats["Synthetic Oils"], price: "₹1150/L", unit: "L", packSize: "4L", brand: "Castrol", grade: "5W40", stockQty: 20, inStock: true, imageUrl: "/images/castrol-edge-5w40.jpg", featured: true },
    { name: "Synthetic 0W40 (Mobil 1)", categoryId: cats["Synthetic Oils"], price: "₹1200/L", unit: "L", packSize: "4L", brand: "Mobil", grade: "0W40", stockQty: 15, inStock: true, imageUrl: "/images/mobil1-0w40.jpg" },
    { name: "Synthetic 5W30 (Castrol Magnatec)", categoryId: cats["Synthetic Oils"], price: "₹1100/L", unit: "L", packSize: "4L", brand: "Castrol", grade: "5W30", stockQty: 18, inStock: true, imageUrl: "/images/castrol-magnatec-5w30.jpg" },
    { name: "Synthetic 0W40 (IOCL)", categoryId: cats["Synthetic Oils"], price: "₹1080/L", unit: "L", packSize: "4L", brand: "IOCL", grade: "0W40", stockQty: 0, inStock: false, imageUrl: "/images/iocl-synthetic-0w40.jpg" },

    // ── Synthetic Oils (new Remmzol) ──────────────────────────────────────────
    { name: "Remmzol Cruiser 5W30 (SN/CF)", categoryId: cats["Synthetic Oils"], price: "₹279/L", unit: "L", packSize: "1L", brand: "Remmzol", grade: "5W30", stockQty: 0, inStock: false, imageUrl: "/images/remmzol-5w30.jpg", description: "Also available in 4L, 210L." },
    { name: "Remmzol Magnasym 0W16", categoryId: cats["Synthetic Oils"], price: "₹1,340/3.5L", unit: "L", packSize: "3.5L", brand: "Remmzol", grade: "0W16", stockQty: 0, inStock: false, imageUrl: "/images/remmzol-5w30.jpg", description: "Fully Synthetic." },
    { name: "Remmzol Magnasym 0W20", categoryId: cats["Synthetic Oils"], price: "₹1,318/3.5L", unit: "L", packSize: "3.5L", brand: "Remmzol", grade: "0W20", stockQty: 0, inStock: false, imageUrl: "/images/remmzol-5w30.jpg", description: "Fully Synthetic." },
    { name: "Remmzol Magnasym 5W30 (SP)", categoryId: cats["Synthetic Oils"], price: "₹334/L", unit: "L", packSize: "1L", brand: "Remmzol", grade: "5W30", stockQty: 0, inStock: false, imageUrl: "/images/remmzol-5w30.jpg", description: "Also available in 4L, 210L." },

    // ── Greases (existing 5) ──────────────────────────────────────────────────
    { name: "AP3 Grease (Castrol)", categoryId: cats["Greases"], price: "₹180/KG", unit: "KG", packSize: "1KG", brand: "Castrol", grade: "AP3", stockQty: 200, inStock: true, imageUrl: "/images/castrol-ap3-grease.jpg", featured: true },
    { name: "Lithium Grease EP2", categoryId: cats["Greases"], price: "₹160/KG", unit: "KG", packSize: "5KG", brand: "IOCL", grade: "EP2", stockQty: 150, inStock: true, imageUrl: "/images/iocl-lithium-ep2.jpg" },
    { name: "Chassis Grease", categoryId: cats["Greases"], price: "₹120/KG", unit: "KG", packSize: "5KG", brand: "Shell", grade: "Multi", stockQty: 80, inStock: true, imageUrl: "/images/shell-chassis-grease.jpg" },
    { name: "Wheel Bearing Grease", categoryId: cats["Greases"], price: "₹220/KG", unit: "KG", packSize: "1KG", brand: "Mobil", grade: "EP3", stockQty: 45, inStock: true, imageUrl: "/images/mobil-wheel-bearing.jpg" },
    { name: "High Temp Grease", categoryId: cats["Greases"], price: "₹350/KG", unit: "KG", packSize: "500G", brand: "Castrol", grade: "HT", stockQty: 0, inStock: false, imageUrl: "/images/castrol-ht-grease.jpg" },

    // ── Hydraulic Oils (existing 3) ───────────────────────────────────────────
    { name: "Hydraulic Oil 68 (IOCL Servo)", categoryId: cats["Hydraulic Oils"], price: "₹140/L", unit: "L", packSize: "20L", brand: "IOCL", grade: "ISO 68", stockQty: 40, inStock: true, imageUrl: "/images/iocl-hydraulic-68.jpg" },
    { name: "Hydraulic Oil 46 (Shell Tellus)", categoryId: cats["Hydraulic Oils"], price: "₹165/L", unit: "L", packSize: "20L", brand: "Shell", grade: "ISO 46", stockQty: 35, inStock: true, imageUrl: "/images/shell-hydraulic-46.jpg" },
    { name: "Hydraulic Oil 32", categoryId: cats["Hydraulic Oils"], price: "₹135/L", unit: "L", packSize: "210L", brand: "Castrol", grade: "ISO 32", stockQty: 10, inStock: true, imageUrl: "/images/castrol-hydraulic-32.jpg" },

    // ── Hydraulic Oils (new Remmzol) ──────────────────────────────────────────
    { name: "Remmzol Hydraulic 68", categoryId: cats["Hydraulic Oils"], price: "₹701/5L", unit: "L", packSize: "5L", brand: "Remmzol", grade: "68", stockQty: 0, inStock: false, imageUrl: "/images/iocl-hydraulic-68.jpg", description: "Also available in 26L, 210L." },
    { name: "Remmzol Hydraulic HLP (32/46/68)", categoryId: cats["Hydraulic Oils"], price: "₹29,910/210L", unit: "L", packSize: "210L", brand: "Remmzol", grade: "HLP", stockQty: 0, inStock: false, imageUrl: "/images/iocl-hydraulic-68.jpg", description: "Available in grades 32, 46, and 68." },
    { name: "Remmzol Hydraulic HUV-WW", categoryId: cats["Hydraulic Oils"], price: "₹3,659/26L", unit: "L", packSize: "26L", brand: "Remmzol", grade: "HUV-WW", stockQty: 0, inStock: false, imageUrl: "/images/iocl-hydraulic-68.jpg" },

    // ── Coolants & Fluids (existing 4) ────────────────────────────────────────
    { name: "Brake Fluid DOT3", categoryId: cats["Coolants & Fluids"], price: "₹250/500ml", unit: "Bottle", packSize: "500ml", brand: "Maruti Genuine", grade: "DOT3", stockQty: 100, inStock: true, imageUrl: "/images/brake-fluid-dot3.jpg" },
    { name: "Engine Coolant (Green)", categoryId: cats["Coolants & Fluids"], price: "₹320/L", unit: "L", packSize: "1L", brand: "Maruti Genuine", grade: "Long Life", stockQty: 75, inStock: true, imageUrl: "/images/coolant-green.jpg" },
    { name: "Injector Cleaner", categoryId: cats["Coolants & Fluids"], price: "₹180/100ml", unit: "Bottle", packSize: "100ml", brand: "Maruti Genuine", grade: "Standard", stockQty: 60, inStock: true, imageUrl: "/images/injector-cleaner.jpg" },
    { name: "Super Lubricant Spray", categoryId: cats["Coolants & Fluids"], price: "₹290/Can", unit: "Can", packSize: "300ml", brand: "Maruti Genuine", grade: "Multi-use", stockQty: 50, inStock: true, imageUrl: "/images/super-lubricant.jpg" },

    // ── Coolants & Fluids (new Remmzol) ──────────────────────────────────────
    { name: "Remmzol Anti Freeze (1:3)", categoryId: cats["Coolants & Fluids"], price: "₹170/L", unit: "L", packSize: "1L", brand: "Remmzol", grade: "Anti Freeze", stockQty: 0, inStock: false, imageUrl: "/images/remmzol-coolant.jpg", description: "Green/Red. Also available in 5L, 210L." },
    { name: "Remmzol Dex Cool (1:3)", categoryId: cats["Coolants & Fluids"], price: "₹105/L", unit: "L", packSize: "1L", brand: "Remmzol", grade: "Dex Cool", stockQty: 0, inStock: false, imageUrl: "/images/remmzol-coolant.jpg", description: "Red/Green/Blue. Also available in 5L, 210L." },
    { name: "Remmzol Dex Cool (1:9)", categoryId: cats["Coolants & Fluids"], price: "₹160/L", unit: "L", packSize: "1L", brand: "Remmzol", grade: "Dex Cool", stockQty: 0, inStock: false, imageUrl: "/images/remmzol-coolant.jpg", description: "Also available in 5L, 210L." },

    // ── Transmission Fluids (new category) ───────────────────────────────────
    { name: "Remmzol ATF (TQ)", categoryId: cats["Transmission Fluids"], price: "₹217/L", unit: "L", packSize: "1L", brand: "Remmzol", grade: "TQ", stockQty: 0, inStock: false, imageUrl: "/images/remmzol-atf.jpg", description: "Automatic Transmission Fluid. Also available in 26L, 210L." },

    // ── Industrial Gear Oils (new category) ──────────────────────────────────
    { name: "Remmzol Ind Gear No.100", categoryId: cats["Industrial Gear Oils"], price: "₹5,089/26L", unit: "L", packSize: "26L", brand: "Remmzol", grade: "No.100", stockQty: 0, inStock: false, imageUrl: "/images/remmzol-gear-oil.jpg", description: "Industrial grade gear oil. Also available in 210L." },
    { name: "Remmzol Ind Gear No.150", categoryId: cats["Industrial Gear Oils"], price: "₹5,136/26L", unit: "L", packSize: "26L", brand: "Remmzol", grade: "No.150", stockQty: 0, inStock: false, imageUrl: "/images/remmzol-gear-oil.jpg", description: "Industrial grade gear oil. Also available in 210L." },
    { name: "Remmzol Ind Gear No.220", categoryId: cats["Industrial Gear Oils"], price: "₹5,249/26L", unit: "L", packSize: "26L", brand: "Remmzol", grade: "No.220", stockQty: 0, inStock: false, imageUrl: "/images/remmzol-gear-oil.jpg", description: "Industrial grade gear oil. Also available in 210L." },
    { name: "Remmzol Ind Gear No.320", categoryId: cats["Industrial Gear Oils"], price: "₹5,269/26L", unit: "L", packSize: "26L", brand: "Remmzol", grade: "No.320", stockQty: 0, inStock: false, imageUrl: "/images/remmzol-gear-oil.jpg", description: "Industrial grade gear oil. Also available in 210L." },
    { name: "Remmzol Ind Gear No.460", categoryId: cats["Industrial Gear Oils"], price: "₹5,288/26L", unit: "L", packSize: "26L", brand: "Remmzol", grade: "No.460", stockQty: 0, inStock: false, imageUrl: "/images/remmzol-gear-oil.jpg", description: "Industrial grade gear oil. Also available in 210L." },

    // ── Industrial Minerals / Bentonite (new category) ────────────────────────
    { name: "Bentonite Carbon Coating Granules", categoryId: cats["Industrial Minerals"], price: "₹4,620", unit: "KG", packSize: "50KG", brand: "Bentonite", grade: "Carbon Coating", stockQty: 0, inStock: false, imageUrl: "/images/bentonite-granules.jpg" },
    { name: "Bentonite Carbon Powder", categoryId: cats["Industrial Minerals"], price: "₹4,620", unit: "KG", packSize: "50KG", brand: "Bentonite", grade: "Carbon", stockQty: 0, inStock: false, imageUrl: "/images/bentonite-powder.jpg" },
    { name: "Bentonite Roasted Powder", categoryId: cats["Industrial Minerals"], price: "₹1,848", unit: "KG", packSize: "50KG", brand: "Bentonite", grade: "Roasted", stockQty: 0, inStock: false, imageUrl: "/images/bentonite-powder.jpg" },
    { name: "Bentonite Rock", categoryId: cats["Industrial Minerals"], price: "₹1,197", unit: "KG", packSize: "50KG", brand: "Bentonite", grade: "Rock", stockQty: 0, inStock: false, imageUrl: "/images/bentonite-rock.jpg" },
    { name: "Bentonite Roasted Granules (5/6mm)", categoryId: cats["Industrial Minerals"], price: "₹3,580", unit: "KG", packSize: "50KG", brand: "Bentonite", grade: "5/6mm Granules", stockQty: 0, inStock: false, imageUrl: "/images/bentonite-granules.jpg" },
    { name: "Bentonite Roasted Granules (Mix)", categoryId: cats["Industrial Minerals"], price: "₹1,098", unit: "KG", packSize: "50KG", brand: "Bentonite", grade: "Mix Granules", stockQty: 0, inStock: false, imageUrl: "/images/bentonite-granules.jpg" },

    // ── Specialty Oils (new category) ─────────────────────────────────────────
    { name: "Remmzol AMT Synthetic", categoryId: cats["Specialty Oils"], price: "₹710/L", unit: "L", packSize: "1L", brand: "Remmzol", grade: "AMT", stockQty: 0, inStock: false, imageUrl: "/images/remmzol-5w30.jpg", description: "Actuator Oil. Also available in 4L." },
    { name: "NBC 2T", categoryId: cats["Specialty Oils"], price: "₹9/pouch", unit: "Bottle", packSize: "40ml", brand: "NBC", grade: "2T", stockQty: 0, inStock: false, imageUrl: "/images/remmzol-20w40.jpg", description: "Vergin 2T. Box of 240×40ml pouches." },
  ];

  for (const prod of productData) {
    storage.createProduct(prod);
  }

  console.log("Database seeded successfully with categories and products.");
}
