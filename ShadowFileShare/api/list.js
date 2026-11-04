import { list } from "@vercel/blob";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const blobs = await list();
    res.status(200).json({ blobs: blobs.blobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
