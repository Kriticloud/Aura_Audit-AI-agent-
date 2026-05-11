import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import * as cheerio from "cheerio";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get("/api/proxy-image", async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).send("URL is required");
    try {
      const response = await fetch(url as string);
      const buffer = await response.arrayBuffer();
      const contentType = response.headers.get("content-type") || "image/png";
      res.setHeader("Content-Type", contentType);
      res.send(Buffer.from(buffer));
    } catch (error) {
      res.status(500).send("Failed to proxy image");
    }
  });

  // API Routes
  app.post("/api/analyze", async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    try {
      console.log(`Analyzing: ${url}`);
      
      // Use a public screenshot service (WordPress mshots)
      const screenshotUrl = `https://s0.wp.com/mshots/v1/${encodeURIComponent(url)}?w=1280`;
      const mobileScreenshotUrl = `https://s0.wp.com/mshots/v1/${encodeURIComponent(url)}?w=480`;

      const response = await fetch(url);
      const html = await response.text();
      const $ = cheerio.load(html);

      // Basic scraping for SEO and metadata
      const metaTitle = $("title").text();
      const metaDescription = $('meta[name="description"]').attr("content") || "";
      const headings = {
        h1: $("h1").length,
        h2: $("h2").length,
        h3: $("h3").length,
      };

      // Extract some design hints (classes, structure)
      const scripts = $("script").length;
      const styles = $("style, link[rel='stylesheet']").length;
      const images = $("img").length;
      const links = $("a").length;

      // Extract raw text for AI analysis
      const bodyText = $("body").text().replace(/\s+/g, " ").substring(0, 5000);

      res.json({
        success: true,
        metadata: {
          title: metaTitle,
          description: metaDescription,
          headings,
          images,
          links,
          scripts,
          styles,
        },
        screenshotUrl,
        mobileScreenshotUrl,
        rawText: bodyText,
        htmlSnippet: html.substring(0, 10000), // Give AI some code context
      });
    } catch (error) {
      console.error("Scraping error:", error);
      res.status(500).json({ error: "Failed to fetch website content" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
