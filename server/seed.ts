import { storage } from "./storage";
import { db, sqlite } from "./db";
import { categories, products, users, siteSettings } from "@shared/schema";

// Map of product names to their real image paths
const IMAGE_MAP: Record<string, string> = {
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

  // Create categories
  const catData = [
    { name: "Engine Oils", description: "Genuine engine oils for petrol and diesel vehicles", sortOrder: 1 },
    { name: "Diesel Oils", description: "High-performance diesel engine oils", sortOrder: 2 },
    { name: "Gear Oils", description: "Transmission and gear oils for smooth shifting", sortOrder: 3 },
    { name: "Synthetic Oils", description: "Premium fully synthetic engine oils", sortOrder: 4 },
    { name: "Greases", description: "Industrial and automotive greases", sortOrder: 5 },
    { name: "Hydraulic Oils", description: "Hydraulic system fluids for machinery", sortOrder: 6 },
    { name: "Coolants & Fluids", description: "Brake fluids, coolants, and specialty chemicals", sortOrder: 7 },
  ];

  const cats: Record<string, number> = {};
  for (const cat of catData) {
    const created = storage.createCategory(cat);
    cats[cat.name] = created.id;
  }

  // Seed products with realistic data
  const productData = [
    // Engine Oils
    { name: "MGO 20W40 (Castrol)", categoryId: cats["Engine Oils"], price: "₹310/L", unit: "L", packSize: "3L", brand: "Castrol", grade: "20W40", stockQty: 120, inStock: true, imageUrl: "/images/castrol-20w40.jpg", featured: true },
    { name: "MGO 20W40 (Shell)", categoryId: cats["Engine Oils"], price: "₹315/L", unit: "L", packSize: "3L", brand: "Shell", grade: "20W40", stockQty: 85, inStock: true, imageUrl: "/images/shell-20w40.jpg" },
    { name: "MGO 5W30 (IOCL)", categoryId: cats["Engine Oils"], price: "₹365/L", unit: "L", packSize: "3.5L", brand: "IOCL", grade: "5W30", stockQty: 60, inStock: true, imageUrl: "/images/iocl-5w30.jpg", featured: true },
    { name: "MGO 5W30 (Castrol)", categoryId: cats["Engine Oils"], price: "₹370/L", unit: "L", packSize: "3.5L", brand: "Castrol", grade: "5W30", stockQty: 45, inStock: true, imageUrl: "/images/castrol-5w30.jpg" },
    { name: "MGO 0W20 (Mobil)", categoryId: cats["Engine Oils"], price: "₹420/L", unit: "L", packSize: "3.5L", brand: "Mobil", grade: "0W20", stockQty: 30, inStock: true, imageUrl: "/images/mobil-0w20.jpg" },
    { name: "MGO 0W16 (Shell)", categoryId: cats["Engine Oils"], price: "₹460/L", unit: "L", packSize: "3.5L", brand: "Shell", grade: "0W16", stockQty: 25, inStock: true, imageUrl: "/images/shell-0w16.jpg" },
    { name: "MGO 0W20 (IOCL)", categoryId: cats["Engine Oils"], price: "₹410/L", unit: "L", packSize: "3.5L", brand: "IOCL", grade: "0W20", stockQty: 0, inStock: false, imageUrl: "/images/iocl-0w20.jpg" },

    // Diesel Oils
    { name: "MGDO 15W40 (Castrol)", categoryId: cats["Diesel Oils"], price: "₹460/L", unit: "L", packSize: "3.5L", brand: "Castrol", grade: "15W40", stockQty: 55, inStock: true, imageUrl: "/images/castrol-diesel-15w40.jpg", featured: true },
    { name: "MGDO 5W30 (Shell)", categoryId: cats["Diesel Oils"], price: "₹610/L", unit: "L", packSize: "3.5L", brand: "Shell", grade: "5W30", stockQty: 40, inStock: true, imageUrl: "/images/shell-diesel-5w30.jpg" },
    { name: "MGDO 5W40 (Mobil)", categoryId: cats["Diesel Oils"], price: "₹620/L", unit: "L", packSize: "4L", brand: "Mobil", grade: "5W40", stockQty: 35, inStock: true, imageUrl: "/images/mobil-diesel-5w40.jpg" },
    { name: "MGDO 15W40 (IOCL)", categoryId: cats["Diesel Oils"], price: "₹445/L", unit: "L", packSize: "3.5L", brand: "IOCL", grade: "15W40", stockQty: 70, inStock: true, imageUrl: "/images/iocl-diesel-15w40.jpg" },
    { name: "MGDO 5W40 (Petronas)", categoryId: cats["Diesel Oils"], price: "₹615/L", unit: "L", packSize: "3.5L", brand: "Petronas", grade: "5W40", stockQty: 0, inStock: false, imageUrl: "/images/petronas-5w40.jpg" },

    // Gear Oils
    { name: "MGGO 75W90 (Shell)", categoryId: cats["Gear Oils"], price: "₹380/L", unit: "L", packSize: "1L", brand: "Shell", grade: "75W90", stockQty: 90, inStock: true, imageUrl: "/images/shell-gear-75w90.jpg", featured: true },
    { name: "MGGO 80W90 (IOCL)", categoryId: cats["Gear Oils"], price: "₹340/L", unit: "L", packSize: "1L", brand: "IOCL", grade: "80W90", stockQty: 110, inStock: true, imageUrl: "/images/iocl-gear-80w90.jpg" },
    { name: "MGGO 75W90 (Total)", categoryId: cats["Gear Oils"], price: "₹390/L", unit: "L", packSize: "20L", brand: "Total", grade: "75W90", stockQty: 15, inStock: true, imageUrl: "/images/total-gear-75w90.jpg" },
    { name: "MGGO 80W90 (Shell)", categoryId: cats["Gear Oils"], price: "₹350/L", unit: "L", packSize: "20L", brand: "Shell", grade: "80W90", stockQty: 20, inStock: true, imageUrl: "/images/shell-gear-80w90.jpg" },

    // Synthetic Oils
    { name: "Synthetic 5W40 (Castrol Edge)", categoryId: cats["Synthetic Oils"], price: "₹1150/L", unit: "L", packSize: "4L", brand: "Castrol", grade: "5W40", stockQty: 20, inStock: true, imageUrl: "/images/castrol-edge-5w40.jpg", featured: true },
    { name: "Synthetic 0W40 (Mobil 1)", categoryId: cats["Synthetic Oils"], price: "₹1200/L", unit: "L", packSize: "4L", brand: "Mobil", grade: "0W40", stockQty: 15, inStock: true, imageUrl: "/images/mobil1-0w40.jpg" },
    { name: "Synthetic 5W30 (Castrol Magnatec)", categoryId: cats["Synthetic Oils"], price: "₹1100/L", unit: "L", packSize: "4L", brand: "Castrol", grade: "5W30", stockQty: 18, inStock: true, imageUrl: "/images/castrol-magnatec-5w30.jpg" },
    { name: "Synthetic 0W40 (IOCL)", categoryId: cats["Synthetic Oils"], price: "₹1080/L", unit: "L", packSize: "4L", brand: "IOCL", grade: "0W40", stockQty: 0, inStock: false, imageUrl: "/images/iocl-synthetic-0w40.jpg" },

    // Greases
    { name: "AP3 Grease (Castrol)", categoryId: cats["Greases"], price: "₹180/KG", unit: "KG", packSize: "1KG", brand: "Castrol", grade: "AP3", stockQty: 200, inStock: true, imageUrl: "/images/castrol-ap3-grease.jpg", featured: true },
    { name: "Lithium Grease EP2", categoryId: cats["Greases"], price: "₹160/KG", unit: "KG", packSize: "5KG", brand: "IOCL", grade: "EP2", stockQty: 150, inStock: true, imageUrl: "/images/iocl-lithium-ep2.jpg" },
    { name: "Chassis Grease", categoryId: cats["Greases"], price: "₹120/KG", unit: "KG", packSize: "5KG", brand: "Shell", grade: "Multi", stockQty: 80, inStock: true, imageUrl: "/images/shell-chassis-grease.jpg" },
    { name: "Wheel Bearing Grease", categoryId: cats["Greases"], price: "₹220/KG", unit: "KG", packSize: "1KG", brand: "Mobil", grade: "EP3", stockQty: 45, inStock: true, imageUrl: "/images/mobil-wheel-bearing.jpg" },
    { name: "High Temp Grease", categoryId: cats["Greases"], price: "₹350/KG", unit: "KG", packSize: "500G", brand: "Castrol", grade: "HT", stockQty: 0, inStock: false, imageUrl: "/images/castrol-ht-grease.jpg" },

    // Hydraulic Oils
    { name: "Hydraulic Oil 68 (IOCL Servo)", categoryId: cats["Hydraulic Oils"], price: "₹140/L", unit: "L", packSize: "20L", brand: "IOCL", grade: "ISO 68", stockQty: 40, inStock: true, imageUrl: "/images/iocl-hydraulic-68.jpg" },
    { name: "Hydraulic Oil 46 (Shell Tellus)", categoryId: cats["Hydraulic Oils"], price: "₹165/L", unit: "L", packSize: "20L", brand: "Shell", grade: "ISO 46", stockQty: 35, inStock: true, imageUrl: "/images/shell-hydraulic-46.jpg" },
    { name: "Hydraulic Oil 32", categoryId: cats["Hydraulic Oils"], price: "₹135/L", unit: "L", packSize: "210L", brand: "Castrol", grade: "ISO 32", stockQty: 10, inStock: true, imageUrl: "/images/castrol-hydraulic-32.jpg" },

    // Coolants & Fluids
    { name: "Brake Fluid DOT3", categoryId: cats["Coolants & Fluids"], price: "₹250/500ml", unit: "Bottle", packSize: "500ml", brand: "Maruti Genuine", grade: "DOT3", stockQty: 100, inStock: true, imageUrl: "/images/brake-fluid-dot3.jpg" },
    { name: "Engine Coolant (Green)", categoryId: cats["Coolants & Fluids"], price: "₹320/L", unit: "L", packSize: "1L", brand: "Maruti Genuine", grade: "Long Life", stockQty: 75, inStock: true, imageUrl: "/images/coolant-green.jpg" },
    { name: "Injector Cleaner", categoryId: cats["Coolants & Fluids"], price: "₹180/100ml", unit: "Bottle", packSize: "100ml", brand: "Maruti Genuine", grade: "Standard", stockQty: 60, inStock: true, imageUrl: "/images/injector-cleaner.jpg" },
    { name: "Super Lubricant Spray", categoryId: cats["Coolants & Fluids"], price: "₹290/Can", unit: "Can", packSize: "300ml", brand: "Maruti Genuine", grade: "Multi-use", stockQty: 50, inStock: true, imageUrl: "/images/super-lubricant.jpg" },
  ];

  for (const prod of productData) {
    storage.createProduct(prod);
  }

  console.log("Database seeded successfully with categories and products.");
}
