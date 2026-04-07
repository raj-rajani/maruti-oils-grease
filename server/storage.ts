import { users, categories, products, type User, type InsertUser, type Category, type InsertCategory, type Product, type InsertProduct } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): User | undefined;
  getUserByUsername(username: string): User | undefined;
  createUser(user: InsertUser): User;

  // Categories
  getCategories(): Category[];
  getCategory(id: number): Category | undefined;
  createCategory(cat: InsertCategory): Category;
  updateCategory(id: number, cat: Partial<InsertCategory>): Category | undefined;
  deleteCategory(id: number): void;

  // Products
  getProducts(): Product[];
  getProduct(id: number): Product | undefined;
  getProductsByCategory(categoryId: number): Product[];
  createProduct(product: InsertProduct): Product;
  updateProduct(id: number, product: Partial<InsertProduct>): Product | undefined;
  deleteProduct(id: number): void;
  getFeaturedProducts(): Product[];
}

export class DatabaseStorage implements IStorage {
  getUser(id: number): User | undefined {
    return db.select().from(users).where(eq(users.id, id)).get();
  }

  getUserByUsername(username: string): User | undefined {
    return db.select().from(users).where(eq(users.username, username)).get();
  }

  createUser(user: InsertUser): User {
    return db.insert(users).values(user).returning().get();
  }

  getCategories(): Category[] {
    return db.select().from(categories).all();
  }

  getCategory(id: number): Category | undefined {
    return db.select().from(categories).where(eq(categories.id, id)).get();
  }

  createCategory(cat: InsertCategory): Category {
    return db.insert(categories).values(cat).returning().get();
  }

  updateCategory(id: number, cat: Partial<InsertCategory>): Category | undefined {
    return db.update(categories).set(cat).where(eq(categories.id, id)).returning().get();
  }

  deleteCategory(id: number): void {
    db.delete(categories).where(eq(categories.id, id)).run();
  }

  getProducts(): Product[] {
    return db.select().from(products).all();
  }

  getProduct(id: number): Product | undefined {
    return db.select().from(products).where(eq(products.id, id)).get();
  }

  getProductsByCategory(categoryId: number): Product[] {
    return db.select().from(products).where(eq(products.categoryId, categoryId)).all();
  }

  createProduct(product: InsertProduct): Product {
    return db.insert(products).values(product).returning().get();
  }

  updateProduct(id: number, product: Partial<InsertProduct>): Product | undefined {
    return db.update(products).set(product).where(eq(products.id, id)).returning().get();
  }

  deleteProduct(id: number): void {
    db.delete(products).where(eq(products.id, id)).run();
  }

  getFeaturedProducts(): Product[] {
    return db.select().from(products).where(eq(products.featured, true)).all();
  }
}

export const storage = new DatabaseStorage();
