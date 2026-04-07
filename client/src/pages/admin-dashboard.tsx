import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import {
  Plus, Pencil, Trash2, LogOut, Package, LayoutGrid,
  Search, Upload, ArrowLeft, BarChart3, AlertCircle, Settings, Image as ImageIcon, ChevronDown
} from "lucide-react";
import type { Product, Category } from "@shared/schema";

// Auth check hook
function useAuth() {
  const [, navigate] = useLocation();
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });
  if (!isLoading && !user) {
    navigate("/admin");
  }
  return { user, isLoading };
}

function ProductForm({
  product,
  categories,
  onSave,
  onClose,
}: {
  product?: Product;
  categories: Category[];
  onSave: (data: any) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: product?.name || "",
    description: product?.description || "",
    categoryId: product?.categoryId?.toString() || "",
    price: product?.price || "",
    unit: product?.unit || "L",
    packSize: product?.packSize || "",
    brand: product?.brand || "",
    grade: product?.grade || "",
    stockQty: product?.stockQty?.toString() || "0",
    inStock: product?.inStock ?? true,
    imageUrl: product?.imageUrl || "",
    featured: product?.featured ?? false,
  });
  const [imagePreview, setImagePreview] = useState(product?.imageUrl || "");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setImagePreview(dataUrl);
      setForm(f => ({ ...f, imageUrl: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      categoryId: parseInt(form.categoryId),
      stockQty: parseInt(form.stockQty) || 0,
      inStock: form.inStock,
      featured: form.featured,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1.5">
          <Label className="text-xs">Product Name</Label>
          <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="h-8 text-sm" data-testid="input-product-name" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Category</Label>
          <Select value={form.categoryId} onValueChange={v => setForm(f => ({ ...f, categoryId: v }))}>
            <SelectTrigger className="h-8 text-sm" data-testid="select-category">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {categories.map(c => (
                <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Brand</Label>
          <Input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} className="h-8 text-sm" data-testid="input-brand" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Price</Label>
          <Input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="₹450/L" className="h-8 text-sm" data-testid="input-price" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Grade</Label>
          <Input value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))} placeholder="5W30" className="h-8 text-sm" data-testid="input-grade" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Pack Size</Label>
          <Input value={form.packSize} onChange={e => setForm(f => ({ ...f, packSize: e.target.value }))} placeholder="3.5L" className="h-8 text-sm" data-testid="input-pack-size" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Unit</Label>
          <Select value={form.unit} onValueChange={v => setForm(f => ({ ...f, unit: v }))}>
            <SelectTrigger className="h-8 text-sm" data-testid="select-unit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="L">Litre (L)</SelectItem>
              <SelectItem value="KG">Kilogram (KG)</SelectItem>
              <SelectItem value="Can">Can</SelectItem>
              <SelectItem value="Barrel">Barrel</SelectItem>
              <SelectItem value="Bottle">Bottle</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Stock Qty</Label>
          <Input type="number" value={form.stockQty} onChange={e => setForm(f => ({ ...f, stockQty: e.target.value }))} className="h-8 text-sm" data-testid="input-stock-qty" />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label className="text-xs">Description</Label>
          <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="text-sm resize-none" data-testid="input-description" />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label className="text-xs">Product Image</Label>
          <div className="flex items-center gap-3">
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded-lg object-cover border" />
            )}
            <div className="flex-1">
              <Input value={form.imageUrl.startsWith("data:") ? "" : form.imageUrl} onChange={e => { setForm(f => ({ ...f, imageUrl: e.target.value })); setImagePreview(e.target.value); }} placeholder="Image URL or upload" className="h-8 text-sm mb-2" data-testid="input-image-url" />
              <input type="file" ref={fileRef} accept="image/*" onChange={handleImageUpload} className="hidden" />
              <Button type="button" variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => fileRef.current?.click()} data-testid="button-upload-image">
                <Upload className="w-3.5 h-3.5" /> Upload Image
              </Button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={form.inStock} onCheckedChange={v => setForm(f => ({ ...f, inStock: v }))} data-testid="switch-in-stock" />
          <Label className="text-xs">In Stock</Label>
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={form.featured} onCheckedChange={v => setForm(f => ({ ...f, featured: v }))} data-testid="switch-featured" />
          <Label className="text-xs">Featured</Label>
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="submit" size="sm" className="flex-1 text-xs" data-testid="button-save-product">{product ? "Update Product" : "Add Product"}</Button>
        <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs" data-testid="button-cancel">Cancel</Button>
      </div>
    </form>
  );
}

function SiteSettings() {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSavingDetails, setIsSavingDetails] = useState(false);

  const { data: settings = {} } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const currentLogo = settings.brandLogo || "";

  const [fields, setFields] = useState({
    businessName: "",
    tagline: "",
    phone: "",
    address: "",
    gstin: "",
    appDownloadLink: "",
  });

  // Sync fields from settings once loaded
  const [fieldsSynced, setFieldsSynced] = useState(false);
  if (!fieldsSynced && Object.keys(settings).length > 0) {
    setFields({
      businessName: settings.businessName || "MARUTI OILS & GREASE",
      tagline: settings.tagline || "Authorized Dealer · Lubricants & Greases",
      phone: settings.phone || "9427287074",
      address: settings.address || "3rd Floor, 312, Spentha Complex, Race Course Road, GST Bhawan, Vadodara, Gujarat - 390007",
      gstin: settings.gstin || "24ACQPR0924A3ZT",
      appDownloadLink: settings.appDownloadLink || "https://play.google.com/store/apps/details?id=com.valorem.flostore",
    });
    setFieldsSynced(true);
  }

  const saveLogoMutation = useMutation({
    mutationFn: (logoData: string) => apiRequest("PUT", "/api/admin/settings", { key: "brandLogo", value: logoData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Brand logo updated" });
      setLogoPreview("");
    },
    onError: () => toast({ title: "Failed to update logo", variant: "destructive" }),
  });

  const removeMutation = useMutation({
    mutationFn: () => apiRequest("PUT", "/api/admin/settings", { key: "brandLogo", value: "" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Brand logo removed" });
      setLogoPreview("");
    },
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Logo must be under 2MB", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setLogoPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAllSettings = async () => {
    setIsSavingDetails(true);
    try {
      const entries = Object.entries(fields) as [string, string][];
      await Promise.all(
        entries.map(([key, value]) =>
          apiRequest("PUT", "/api/admin/settings", { key, value })
        )
      );
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Settings saved" });
    } catch {
      toast({ title: "Failed to save settings", variant: "destructive" });
    } finally {
      setIsSavingDetails(false);
    }
  };

  const displayLogo = logoPreview || currentLogo;

  return (
    <Card className="border-border/60 mb-6">
      <CardContent className="p-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left"
          data-testid="button-toggle-logo-settings"
        >
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Site Settings</span>
            {currentLogo && (
              <Badge variant="outline" className="text-[10px] ml-1">Logo set</Badge>
            )}
          </div>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t space-y-5">
            {/* Brand Logo */}
            <div>
              <Label className="text-xs font-medium">Brand Logo</Label>
              <p className="text-xs text-muted-foreground mt-0.5 mb-3">
                Upload your business logo. It will appear in the site header and footer.
              </p>
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/30 overflow-hidden shrink-0">
                  {displayLogo ? (
                    <img src={displayLogo} alt="Brand logo" className="w-full h-full object-contain p-1" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
                  )}
                </div>
                <div className="space-y-2 flex-1">
                  <input type="file" ref={fileRef} accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1.5"
                    onClick={() => fileRef.current?.click()}
                    data-testid="button-upload-logo"
                  >
                    <Upload className="w-3.5 h-3.5" /> {currentLogo ? "Change Logo" : "Upload Logo"}
                  </Button>
                  {logoPreview && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="text-xs"
                        onClick={() => saveLogoMutation.mutate(logoPreview)}
                        disabled={saveLogoMutation.isPending}
                        data-testid="button-save-logo"
                      >
                        {saveLogoMutation.isPending ? "Saving..." : "Save Logo"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs"
                        onClick={() => { setLogoPreview(""); if (fileRef.current) fileRef.current.value = ""; }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                  {currentLogo && !logoPreview && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs text-destructive hover:text-destructive"
                      onClick={() => removeMutation.mutate()}
                      disabled={removeMutation.isPending}
                      data-testid="button-remove-logo"
                    >
                      <Trash2 className="w-3 h-3 mr-1" /> Remove Logo
                    </Button>
                  )}
                  <p className="text-[10px] text-muted-foreground">PNG, JPG, or SVG. Max 2MB. Square format recommended.</p>
                </div>
              </div>
            </div>

            {/* Business Details */}
            <div className="border-t pt-4 space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Business Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Business Name</Label>
                  <Input
                    value={fields.businessName}
                    onChange={e => setFields(f => ({ ...f, businessName: e.target.value }))}
                    placeholder="MARUTI OILS & GREASE"
                    className="h-8 text-sm"
                    data-testid="input-business-name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Tagline</Label>
                  <Input
                    value={fields.tagline}
                    onChange={e => setFields(f => ({ ...f, tagline: e.target.value }))}
                    placeholder="Authorized Dealer · Lubricants & Greases"
                    className="h-8 text-sm"
                    data-testid="input-tagline"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Phone</Label>
                  <Input
                    value={fields.phone}
                    onChange={e => setFields(f => ({ ...f, phone: e.target.value }))}
                    placeholder="9427287074"
                    className="h-8 text-sm"
                    data-testid="input-phone"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">GSTIN</Label>
                  <Input
                    value={fields.gstin}
                    onChange={e => setFields(f => ({ ...f, gstin: e.target.value }))}
                    placeholder="24ACQPR0924A3ZT"
                    className="h-8 text-sm"
                    data-testid="input-gstin"
                  />
                </div>
                <div className="col-span-1 sm:col-span-2 space-y-1.5">
                  <Label className="text-xs">Address</Label>
                  <Textarea
                    value={fields.address}
                    onChange={e => setFields(f => ({ ...f, address: e.target.value }))}
                    placeholder="3rd Floor, 312, Spentha Complex..."
                    rows={2}
                    className="text-sm resize-none"
                    data-testid="input-address"
                  />
                </div>
                <div className="col-span-1 sm:col-span-2 space-y-1.5">
                  <Label className="text-xs">App Download Link</Label>
                  <Input
                    value={fields.appDownloadLink}
                    onChange={e => setFields(f => ({ ...f, appDownloadLink: e.target.value }))}
                    placeholder="https://play.google.com/store/apps/..."
                    className="h-8 text-sm"
                    data-testid="input-app-download-link"
                  />
                </div>
              </div>
              <Button
                size="sm"
                className="text-xs mt-1"
                onClick={handleSaveAllSettings}
                disabled={isSavingDetails}
                data-testid="button-save-settings"
              >
                {isSavingDetails ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [showForm, setShowForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/products", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product added" });
      setShowForm(false);
    },
    onError: () => toast({ title: "Failed to add product", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiRequest("PUT", `/api/admin/products/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product updated" });
      setShowForm(false);
      setEditingProduct(undefined);
    },
    onError: () => toast({ title: "Failed to update product", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product deleted" });
    },
  });

  const handleLogout = async () => {
    await apiRequest("POST", "/api/logout");
    queryClient.clear();
    navigate("/admin");
  };

  const handleSave = (data: any) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = filterCategory === "all" || p.categoryId.toString() === filterCategory;
    return matchesSearch && matchesCat;
  });

  const totalStock = products.reduce((sum, p) => sum + (p.stockQty || 0), 0);
  const outOfStockCount = products.filter(p => !p.inStock).length;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-3 w-64">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-xs gap-1.5" data-testid="link-view-site">
                <ArrowLeft className="w-3.5 h-3.5" /> View Site
              </Button>
            </Link>
            <div className="h-5 w-px bg-border" />
            <h1 className="text-sm font-semibold" data-testid="text-admin-title">Admin Dashboard</h1>
          </div>
          <Button variant="ghost" size="sm" className="text-xs gap-1.5 text-muted-foreground" onClick={handleLogout} data-testid="button-logout">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Package className="w-4 h-4" />
                <span className="text-xs">Total Products</span>
              </div>
              <p className="text-xl font-bold" data-testid="text-total-products">{products.length}</p>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <LayoutGrid className="w-4 h-4" />
                <span className="text-xs">Categories</span>
              </div>
              <p className="text-xl font-bold">{categories.length}</p>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <BarChart3 className="w-4 h-4" />
                <span className="text-xs">Total Stock</span>
              </div>
              <p className="text-xl font-bold">{totalStock}</p>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-destructive mb-1">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs">Out of Stock</span>
              </div>
              <p className="text-xl font-bold" data-testid="text-out-of-stock">{outOfStockCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Site Settings */}
        <SiteSettings />

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
              data-testid="input-admin-search"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="h-9 w-40 text-sm" data-testid="select-filter-category">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(c => (
                <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={showForm} onOpenChange={(open) => { setShowForm(open); if (!open) setEditingProduct(undefined); }}>
            <DialogTrigger asChild>
              <Button size="sm" className="text-xs gap-1.5" onClick={() => { setEditingProduct(undefined); setShowForm(true); }} data-testid="button-add-product">
                <Plus className="w-3.5 h-3.5" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-base">{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
              </DialogHeader>
              <ProductForm
                product={editingProduct}
                categories={categories}
                onSave={handleSave}
                onClose={() => { setShowForm(false); setEditingProduct(undefined); }}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Products Table */}
        {productsLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/40 border-b">
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Product</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">Category</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Price</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Stock</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Status</th>
                    <th className="text-right p-3 text-xs font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => {
                    const cat = categories.find(c => c.id === product.categoryId);
                    return (
                      <tr key={product.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors" data-testid={`row-product-${product.id}`}>
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <img src={product.imageUrl || "/api/placeholder/default"} alt="" className="w-10 h-10 rounded object-cover bg-muted" />
                            <div>
                              <p className="font-medium text-sm leading-tight">{product.name}</p>
                              <div className="flex gap-1 mt-0.5">
                                {product.brand && <Badge variant="outline" className="text-[10px] px-1 py-0">{product.brand}</Badge>}
                                {product.grade && <Badge variant="secondary" className="text-[10px] px-1 py-0">{product.grade}</Badge>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-xs text-muted-foreground hidden sm:table-cell">{cat?.name}</td>
                        <td className="p-3 text-sm font-medium">{product.price || "—"}</td>
                        <td className="p-3 text-sm">{product.stockQty}</td>
                        <td className="p-3 hidden md:table-cell">
                          {product.inStock ? (
                            <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">In Stock</Badge>
                          ) : (
                            <Badge variant="destructive" className="text-xs">Out</Badge>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => { setEditingProduct(product); setShowForm(true); }}
                              data-testid={`button-edit-${product.id}`}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                              onClick={() => {
                                if (confirm(`Delete "${product.name}"?`)) {
                                  deleteMutation.mutate(product.id);
                                }
                              }}
                              data-testid={`button-delete-${product.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredProducts.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No products found</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
