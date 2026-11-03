# Velodesk HubSpot app

The HubSpot developer project behind "Connect HubSpot" in Velodesk. It holds no secrets.

## One-time setup (on your computer, with the HubSpot CLI already authenticated)

```bash
cd hubspot
hs project upload
hs project open
```

In the project, open the **Velodesk** app → **Auth** tab → *Client credentials*. Then in Vercel
(velodesk-app → Settings → Environment Variables, Production) add:

- `NEXT_PUBLIC_HUBSPOT_CLIENT_ID` = the Client ID
- `HUBSPOT_CLIENT_SECRET` = the Client secret (mark as Sensitive)

Redeploy. HubSpot's card on /dashboard/integrations switches from "Connect with API Key" to
"Connect with OAuth" automatically once the client ID is set.

Scopes must match `HUBSPOT_SCOPES` in `src/lib/integrations/oauth-tokens.ts`.
