import type { Express, Request, Response } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertCategorySchema } from "@shared/schema";
import { seedDatabase } from "./seed";

// Simple auth middleware
function requireAuth(req: Request, res: Response, next: Function) {
  if (!(req.session as any)?.isAdmin) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

export async function registerRoutes(server: Server, app: Express) {
  // Seed the database
  seedDatabase();

  // ---- AUTH ----
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }
    const user = storage.getUserByUsername(username);
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    (req.session as any).isAdmin = true;
    (req.session as any).userId = user.id;
    res.json({ id: user.id, username: user.username });
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/me", (req, res) => {
    if (!(req.session as any)?.isAdmin) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const userId = (req.session as any).userId;
    const user = storage.getUser(userId);
    if (!user) return res.status(401).json({ message: "Not authenticated" });
    res.json({ id: user.id, username: user.username });
  });

  // ---- PUBLIC ROUTES ----
  app.get("/api/categories", (_req, res) => {
    res.json(storage.getCategories());
  });

  app.get("/api/products", (_req, res) => {
    res.json(storage.getProducts());
  });

  app.get("/api/products/featured", (_req, res) => {
    res.json(storage.getFeaturedProducts());
  });

  app.get("/api/products/category/:categoryId", (req, res) => {
    const categoryId = parseInt(req.params.categoryId);
    res.json(storage.getProductsByCategory(categoryId));
  });

  app.get("/api/products/:id", (req, res) => {
    const product = storage.getProduct(parseInt(req.params.id));
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  // Placeholder image generator (generates SVG product images)
  app.get("/api/placeholder/:slug", (req, res) => {
    const slug = req.params.slug;
    const colors: Record<string, { bg: string; fg: string; icon: string }> = {
      "engine-oil": { bg: "#1a365d", fg: "#ecc94b", icon: "⚙️" },
      "diesel-oil": { bg: "#2d3748", fg: "#48bb78", icon: "🛢️" },
      "gear-oil": { bg: "#553c9a", fg: "#d6bcfa", icon: "⚡" },
      "synthetic": { bg: "#1a202c", fg: "#63b3ed", icon: "💎" },
      "grease": { bg: "#744210", fg: "#fefcbf", icon: "🔧" },
      "hydraulic": { bg: "#22543d", fg: "#9ae6b4", icon: "🏭" },
      "brake-fluid": { bg: "#742a2a", fg: "#feb2b2", icon: "🚗" },
      "coolant": { bg: "#234e52", fg: "#81e6d9", icon: "❄️" },
      "injector": { bg: "#44337a", fg: "#b794f4", icon: "💧" },
      "super-lubricant": { bg: "#2a4365", fg: "#bee3f8", icon: "✨" },
    };

    let style = { bg: "#1a365d", fg: "#ecc94b", icon: "🛢️" };
    for (const [key, val] of Object.entries(colors)) {
      if (slug.includes(key)) {
        style = val;
        break;
      }
    }

    const label = slug.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${style.bg}"/>
      <stop offset="100%" stop-color="${style.bg}dd"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#bg)" rx="12"/>
  <text x="200" y="170" text-anchor="middle" font-size="72">${style.icon}</text>
  <text x="200" y="240" text-anchor="middle" font-family="system-ui, sans-serif" font-size="16" font-weight="600" fill="${style.fg}">${label}</text>
  <text x="200" y="270" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="${style.fg}99">MARUTI OILS &amp; GREASE</text>
</svg>`;

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=31536000");
    res.send(svg);
  });

  // ---- ADMIN ROUTES ----
  app.post("/api/admin/categories", requireAuth, (req, res) => {
    const parsed = insertCategorySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const cat = storage.createCategory(parsed.data);
    res.json(cat);
  });

  app.put("/api/admin/categories/:id", requireAuth, (req, res) => {
    const id = parseInt(req.params.id);
    const cat = storage.updateCategory(id, req.body);
    if (!cat) return res.status(404).json({ message: "Category not found" });
    res.json(cat);
  });

  app.delete("/api/admin/categories/:id", requireAuth, (req, res) => {
    storage.deleteCategory(parseInt(req.params.id));
    res.json({ message: "Deleted" });
  });

  app.post("/api/admin/products", requireAuth, (req, res) => {
    const parsed = insertProductSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const product = storage.createProduct(parsed.data);
    res.json(product);
  });

  app.put("/api/admin/products/:id", requireAuth, (req, res) => {
    const id = parseInt(req.params.id);
    const product = storage.updateProduct(id, req.body);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  app.delete("/api/admin/products/:id", requireAuth, (req, res) => {
    storage.deleteProduct(parseInt(req.params.id));
    res.json({ message: "Deleted" });
  });

  // Image upload as base64
  app.post("/api/admin/upload-image", requireAuth, (req, res) => {
    const { imageData } = req.body;
    if (!imageData) return res.status(400).json({ message: "No image data" });
    // Store as data URL directly, return it back
    res.json({ url: imageData });
  });

  // ---- SITE SETTINGS ----
  app.get("/api/settings", (_req, res) => {
    const settings = storage.getAllSettings();
    const map: Record<string, string> = {};
    for (const s of settings) {
      map[s.key] = s.value;
    }
    res.json(map);
  });

  app.put("/api/admin/settings", requireAuth, (req, res) => {
    const { key, value } = req.body;
    if (!key || value === undefined) {
      return res.status(400).json({ message: "Key and value required" });
    }
    const setting = storage.setSetting(key, value);
    res.json(setting);
  });
}
