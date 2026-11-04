import { put } from "@vercel/blob";

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { name, base64 } = req.body;
    if (!name || !base64) {
      res.status(400).json({ error: "name aur base64 dono chahiye" });
      return;
    }

    const buffer = Buffer.from(base64, "base64");

    const blob = await put(name, buffer, {
      access: "public",
      addRandomSuffix: false // same naam pe overwrite ho jayegi
    });

    res.status(200).json({ url: blob.url, pathname: blob.pathname, size: blob.size });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
