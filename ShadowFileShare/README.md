# File Sharing on Vercel

Git commits bina file upload/delete karne ke liye.

## Deploy karne ka tareeka (Vercel)

1. Ye saara code GitHub repo mein upload karo.
2. Vercel.com pe jao aur "Add New Project" → apna repo select karo.
3. Framework Preset: "Other" select karo.
4. **Environment Variables** mein ye dalo (Vercel Blob ke liye):
   - `BLOB_READ_WRITE_TOKEN` — ye Vercel dashboard → Storage → Blob → Create Blob → Token se milega.

   *(Agar pehli baar Blob use kar rahe ho: Vercel Dashboard → Storage → Create Blob → "Read/Write" token copy karo)*

5. Deploy karo. Aapki site live ho jayegi.

## Kaise kaam karta hai

- `api/upload.js` — file ko Vercel Blob storage mein save karta hai (git mein nahi jati)
- `api/list.js` — saari files ki list nikalta hai
- `api/delete.js` — file delete karta hai
- Har upload/delete se **koi git commit nahi banta**

## Limits

- Vercel Blob free tier mein kuch GB storage milta hai, personal use ke liye kaafi hai.
- Badi files (100MB+) ke liye paid plan chahiye ho sakta hai.
