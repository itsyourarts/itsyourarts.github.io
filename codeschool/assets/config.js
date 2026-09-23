/* GodxShadow runtime config
   ------------------------------------------------------------------
   window.GXS_API = code-runner backend base URL.

   ""  (default)  → same origin. Use this when you serve the site with
                    server.py (locally or on Render/Railway/Fly), or when
                    you host the backend yourself.

   A full URL     → set this when the site is static (e.g. GitHub Pages)
                    and the runner lives somewhere else. The backend sends
                    CORS headers, so cross-origin calls work.

   Example:
   window.GXS_API = "https://godxshadow-api.onrender.com";
*/
window.GXS_API = "";
