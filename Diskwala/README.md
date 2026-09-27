# GODXSHADOW Downloader — Render Ready

A Flask-based neon video downloader interface with Diskwala, TeraBox/Flezen and public Instagram support.

## Deploy through Render Blueprint (recommended)

1. Upload every file in this folder to the root of a new GitHub repository.
2. Sign in to https://render.com with GitHub.
3. Select **New + → Blueprint**.
4. Connect the repository.
5. Render reads `render.yaml`; approve the `godxshadow-downloader` service.
6. Wait for the Docker build and open the generated `.onrender.com` URL.

## Deploy as a Web Service

1. Select **New + → Web Service** and connect the repository.
2. Choose **Docker** as the language/runtime.
3. Set Dockerfile path to `./Dockerfile`.
4. Leave Root Directory empty when these files are at repository root.
5. Deploy.

## Health check

After deployment, open:

```
https://YOUR-SERVICE.onrender.com/api/health
```

Expected output:

```json
{"ok": true}
```

## Local run

```bash
pip install -r requirements.txt
python app.py
```

Open http://localhost:8000.

## Notes

- Free Render services sleep during inactivity; the first request after sleep can take some time.
- Extraction depends on external providers and links may stop working if upstream services change.
- Only download media you own or have permission to save.
- Never commit a real `.env` or Telegram session. `.env.example` contains placeholders only.
