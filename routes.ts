import { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertProductSchema, insertOrderSchema, insertReviewSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Products
  app.get("/api/products", async (_req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.post("/api/products", async (req, res) => {
    if (!req.user?.isAdmin) return res.sendStatus(403);
    const data = insertProductSchema.parse(req.body);
    const product = await storage.createProduct(data);
    res.status(201).json(product);
  });

  app.put("/api/products/:id", async (req, res) => {
    if (!req.user?.isAdmin) return res.sendStatus(403);
    const product = await storage.updateProduct(parseInt(req.params.id), req.body);
    res.json(product);
  });

  app.delete("/api/products/:id", async (req, res) => {
    if (!req.user?.isAdmin) return res.sendStatus(403);
    await storage.deleteProduct(parseInt(req.params.id));
    res.sendStatus(204);
  });

  // Orders
  app.get("/api/orders", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const orders = req.user.isAdmin 
      ? await storage.getOrders()
      : await storage.getUserOrders(req.user.id);
    res.json(orders);
  });

  app.post("/api/orders", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const data = insertOrderSchema.parse(req.body);
    const order = await storage.createOrder({ ...data, userId: req.user.id });
    res.status(201).json(order);
  });

  app.put("/api/orders/:id/status", async (req, res) => {
    if (!req.user?.isAdmin) return res.sendStatus(403);
    const order = await storage.updateOrderStatus(parseInt(req.params.id), req.body.status);
    res.json(order);
  });

  // Reviews
  app.get("/api/products/:id/reviews", async (req, res) => {
    const reviews = await storage.getProductReviews(parseInt(req.params.id));
    res.json(reviews);
  });

  app.post("/api/products/:id/reviews", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const data = insertReviewSchema.parse(req.body);
    const review = await storage.createReview({
      ...data,
      userId: req.user.id,
      productId: parseInt(req.params.id)
    });
    res.status(201).json(review);
  });

  // Interactive features
  app.post("/api/spin-discount", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const discounts = [5, 10, 15, 20];
    const discount = discounts[Math.floor(Math.random() * discounts.length)];
    res.json({ discount });
  });

  app.get("/api/surprise-product", async (_req, res) => {
    const products = await storage.getProducts();
    const product = products[Math.floor(Math.random() * products.length)];
    res.json(product);
  });

  const httpServer = createServer(app);
  return httpServer;
}
