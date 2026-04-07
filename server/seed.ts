import { storage } from "./storage";
import { db } from "./db";
import { categories, products, users } from "@shared/schema";

export function seedDatabase() {
  // Check if already seeded
  const existingCats = storage.getCategories();
  if (existingCats.length > 0) return;

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
    { name: "MGO 20W40 (Castrol)", categoryId: cats["Engine Oils"], price: "₹310/L", unit: "L", packSize: "3L", brand: "Castrol", grade: "20W40", stockQty: 120, inStock: true, imageUrl: "/api/placeholder/engine-oil-20w40", featured: true },
    { name: "MGO 20W40 (Shell)", categoryId: cats["Engine Oils"], price: "₹315/L", unit: "L", packSize: "3L", brand: "Shell", grade: "20W40", stockQty: 85, inStock: true, imageUrl: "/api/placeholder/engine-oil-shell" },
    { name: "MGO 5W30 (IOCL)", categoryId: cats["Engine Oils"], price: "₹365/L", unit: "L", packSize: "3.5L", brand: "IOCL", grade: "5W30", stockQty: 60, inStock: true, imageUrl: "/api/placeholder/engine-oil-5w30", featured: true },
    { name: "MGO 5W30 (Castrol)", categoryId: cats["Engine Oils"], price: "₹370/L", unit: "L", packSize: "3.5L", brand: "Castrol", grade: "5W30", stockQty: 45, inStock: true, imageUrl: "/api/placeholder/engine-oil-castrol" },
    { name: "MGO 0W20 (Mobil)", categoryId: cats["Engine Oils"], price: "₹420/L", unit: "L", packSize: "3.5L", brand: "Mobil", grade: "0W20", stockQty: 30, inStock: true, imageUrl: "/api/placeholder/engine-oil-0w20" },
    { name: "MGO 0W16 (Shell)", categoryId: cats["Engine Oils"], price: "₹460/L", unit: "L", packSize: "3.5L", brand: "Shell", grade: "0W16", stockQty: 25, inStock: true, imageUrl: "/api/placeholder/engine-oil-0w16" },
    { name: "MGO 0W20 (IOCL)", categoryId: cats["Engine Oils"], price: "₹410/L", unit: "L", packSize: "3.5L", brand: "IOCL", grade: "0W20", stockQty: 0, inStock: false, imageUrl: "/api/placeholder/engine-oil-iocl" },

    // Diesel Oils
    { name: "MGDO 15W40 (Castrol)", categoryId: cats["Diesel Oils"], price: "₹460/L", unit: "L", packSize: "3.5L", brand: "Castrol", grade: "15W40", stockQty: 55, inStock: true, imageUrl: "/api/placeholder/diesel-oil-15w40", featured: true },
    { name: "MGDO 5W30 (Shell)", categoryId: cats["Diesel Oils"], price: "₹610/L", unit: "L", packSize: "3.5L", brand: "Shell", grade: "5W30", stockQty: 40, inStock: true, imageUrl: "/api/placeholder/diesel-oil-5w30" },
    { name: "MGDO 5W40 (Mobil)", categoryId: cats["Diesel Oils"], price: "₹620/L", unit: "L", packSize: "4L", brand: "Mobil", grade: "5W40", stockQty: 35, inStock: true, imageUrl: "/api/placeholder/diesel-oil-5w40" },
    { name: "MGDO 15W40 (IOCL)", categoryId: cats["Diesel Oils"], price: "₹445/L", unit: "L", packSize: "3.5L", brand: "IOCL", grade: "15W40", stockQty: 70, inStock: true, imageUrl: "/api/placeholder/diesel-oil-iocl" },
    { name: "MGDO 5W40 (Petronas)", categoryId: cats["Diesel Oils"], price: "₹615/L", unit: "L", packSize: "3.5L", brand: "Petronas", grade: "5W40", stockQty: 0, inStock: false, imageUrl: "/api/placeholder/diesel-oil-petronas" },

    // Gear Oils
    { name: "MGGO 75W90 (Shell)", categoryId: cats["Gear Oils"], price: "₹380/L", unit: "L", packSize: "1L", brand: "Shell", grade: "75W90", stockQty: 90, inStock: true, imageUrl: "/api/placeholder/gear-oil-75w90", featured: true },
    { name: "MGGO 80W90 (IOCL)", categoryId: cats["Gear Oils"], price: "₹340/L", unit: "L", packSize: "1L", brand: "IOCL", grade: "80W90", stockQty: 110, inStock: true, imageUrl: "/api/placeholder/gear-oil-80w90" },
    { name: "MGGO 75W90 (Total)", categoryId: cats["Gear Oils"], price: "₹390/L", unit: "L", packSize: "20L", brand: "Total", grade: "75W90", stockQty: 15, inStock: true, imageUrl: "/api/placeholder/gear-oil-total" },
    { name: "MGGO 80W90 (Shell)", categoryId: cats["Gear Oils"], price: "₹350/L", unit: "L", packSize: "20L", brand: "Shell", grade: "80W90", stockQty: 20, inStock: true, imageUrl: "/api/placeholder/gear-oil-shell" },

    // Synthetic Oils
    { name: "Synthetic 5W40 (Castrol Edge)", categoryId: cats["Synthetic Oils"], price: "₹1150/L", unit: "L", packSize: "4L", brand: "Castrol", grade: "5W40", stockQty: 20, inStock: true, imageUrl: "/api/placeholder/synthetic-5w40", featured: true },
    { name: "Synthetic 0W40 (Mobil 1)", categoryId: cats["Synthetic Oils"], price: "₹1200/L", unit: "L", packSize: "4L", brand: "Mobil", grade: "0W40", stockQty: 15, inStock: true, imageUrl: "/api/placeholder/synthetic-0w40" },
    { name: "Synthetic 5W30 (Castrol Magnatec)", categoryId: cats["Synthetic Oils"], price: "₹1100/L", unit: "L", packSize: "4L", brand: "Castrol", grade: "5W30", stockQty: 18, inStock: true, imageUrl: "/api/placeholder/synthetic-5w30" },
    { name: "Synthetic 0W40 (IOCL)", categoryId: cats["Synthetic Oils"], price: "₹1080/L", unit: "L", packSize: "4L", brand: "IOCL", grade: "0W40", stockQty: 0, inStock: false, imageUrl: "/api/placeholder/synthetic-iocl" },

    // Greases
    { name: "AP3 Grease (Castrol)", categoryId: cats["Greases"], price: "₹180/KG", unit: "KG", packSize: "1KG", brand: "Castrol", grade: "AP3", stockQty: 200, inStock: true, imageUrl: "/api/placeholder/grease-ap3", featured: true },
    { name: "Lithium Grease EP2", categoryId: cats["Greases"], price: "₹160/KG", unit: "KG", packSize: "5KG", brand: "IOCL", grade: "EP2", stockQty: 150, inStock: true, imageUrl: "/api/placeholder/grease-lithium" },
    { name: "Chassis Grease", categoryId: cats["Greases"], price: "₹120/KG", unit: "KG", packSize: "5KG", brand: "Shell", grade: "Multi", stockQty: 80, inStock: true, imageUrl: "/api/placeholder/grease-chassis" },
    { name: "Wheel Bearing Grease", categoryId: cats["Greases"], price: "₹220/KG", unit: "KG", packSize: "1KG", brand: "Mobil", grade: "EP3", stockQty: 45, inStock: true, imageUrl: "/api/placeholder/grease-wheel" },
    { name: "High Temp Grease", categoryId: cats["Greases"], price: "₹350/KG", unit: "KG", packSize: "500G", brand: "Castrol", grade: "HT", stockQty: 0, inStock: false, imageUrl: "/api/placeholder/grease-ht" },

    // Hydraulic Oils
    { name: "Hydraulic Oil 68 (IOCL Servo)", categoryId: cats["Hydraulic Oils"], price: "₹140/L", unit: "L", packSize: "20L", brand: "IOCL", grade: "ISO 68", stockQty: 40, inStock: true, imageUrl: "/api/placeholder/hydraulic-68" },
    { name: "Hydraulic Oil 46 (Shell Tellus)", categoryId: cats["Hydraulic Oils"], price: "₹165/L", unit: "L", packSize: "20L", brand: "Shell", grade: "ISO 46", stockQty: 35, inStock: true, imageUrl: "/api/placeholder/hydraulic-46" },
    { name: "Hydraulic Oil 32", categoryId: cats["Hydraulic Oils"], price: "₹135/L", unit: "L", packSize: "210L", brand: "Castrol", grade: "ISO 32", stockQty: 10, inStock: true, imageUrl: "/api/placeholder/hydraulic-32" },

    // Coolants & Fluids
    { name: "Brake Fluid DOT3", categoryId: cats["Coolants & Fluids"], price: "₹250/500ml", unit: "Bottle", packSize: "500ml", brand: "Maruti Genuine", grade: "DOT3", stockQty: 100, inStock: true, imageUrl: "/api/placeholder/brake-fluid" },
    { name: "Engine Coolant (Green)", categoryId: cats["Coolants & Fluids"], price: "₹320/L", unit: "L", packSize: "1L", brand: "Maruti Genuine", grade: "Long Life", stockQty: 75, inStock: true, imageUrl: "/api/placeholder/coolant-green" },
    { name: "Injector Cleaner", categoryId: cats["Coolants & Fluids"], price: "₹180/100ml", unit: "Bottle", packSize: "100ml", brand: "Maruti Genuine", grade: "Standard", stockQty: 60, inStock: true, imageUrl: "/api/placeholder/injector-cleaner" },
    { name: "Super Lubricant Spray", categoryId: cats["Coolants & Fluids"], price: "₹290/Can", unit: "Can", packSize: "300ml", brand: "Maruti Genuine", grade: "Multi-use", stockQty: 50, inStock: true, imageUrl: "/api/placeholder/super-lubricant" },
  ];

  for (const prod of productData) {
    storage.createProduct(prod);
  }

  console.log("Database seeded successfully with categories and products.");
}
