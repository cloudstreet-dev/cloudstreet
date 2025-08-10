import { load } from "@std/dotenv";
import { GoogleAuth, TokenData } from './auth/google-auth.ts';
import { APIRoutes } from './routes/api.ts';

await load({ export: true });

const PORT = parseInt(Deno.env.get('PORT') || '8000');
const CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
const CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');
const REDIRECT_URI = Deno.env.get('GOOGLE_REDIRECT_URI') || `http://localhost:${PORT}/auth/callback`;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing required environment variables: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET');
  console.error('Please create a .env file based on .env.example');
  Deno.exit(1);
}

const googleAuth = new GoogleAuth(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

try {
  const tokenData = JSON.parse(await Deno.readTextFile('./tokens.json')) as TokenData;
  googleAuth.setTokenData(tokenData);
  console.log('Loaded existing token data');
} catch {
  console.log('No existing token data found. Please authenticate first.');
}

const apiRoutes = new APIRoutes(googleAuth);

async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  console.log(`${request.method} ${path}`);

  if (request.method === 'GET' && path === '/') {
    return new Response(`
      <html>
        <head>
          <title>Dynalist to Google Slides Converter</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #333; }
            pre { background: #f4f4f4; padding: 10px; border-radius: 5px; }
            .endpoint { margin: 20px 0; }
            .method { font-weight: bold; color: #0066cc; }
          </style>
        </head>
        <body>
          <h1>Dynalist to Google Slides Converter API</h1>
          
          <div class="endpoint">
            <h2>Authentication</h2>
            <p><span class="method">GET</span> <code>/auth</code> - Start OAuth2 flow</p>
            <p><span class="method">GET</span> <code>/auth/callback</code> - OAuth2 callback (handled automatically)</p>
          </div>

          <div class="endpoint">
            <h2>Create Slides</h2>
            <p><span class="method">POST</span> <code>/api/create-slides</code></p>
            <p>Request body:</p>
            <pre>{
  "bullets": ["Slide 1 content", "Slide 2 content", "..."],
  "presentationTitle": "Optional title"
}</pre>
            <p>Response:</p>
            <pre>{
  "success": true,
  "presentationId": "...",
  "presentationUrl": "https://docs.google.com/presentation/d/.../edit",
  "slidesCreated": 2
}</pre>
          </div>

          <h2>Setup Instructions</h2>
          <ol>
            <li>Create a Google Cloud project and enable the Google Slides API</li>
            <li>Create OAuth2 credentials (Web application type)</li>
            <li>Add <code>http://localhost:8000/auth/callback</code> to authorized redirect URIs</li>
            <li>Copy <code>.env.example</code> to <code>.env</code> and add your credentials</li>
            <li>Visit <a href="/auth">/auth</a> to authenticate</li>
            <li>Send POST requests to <code>/api/create-slides</code> with your bullet points</li>
          </ol>
        </body>
      </html>
    `, {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    });
  }

  if (request.method === 'GET' && path === '/auth') {
    return apiRoutes.handleAuthStart();
  }

  if (request.method === 'GET' && path === '/auth/callback') {
    return apiRoutes.handleAuthCallback(request);
  }

  if (request.method === 'POST' && path === '/api/create-slides') {
    return apiRoutes.handleCreateSlides(request);
  }

  if (request.method === 'GET' && path === '/health') {
    const hasToken = googleAuth.getAccessToken() !== null;
    return new Response(JSON.stringify({ 
      status: 'ok', 
      authenticated: hasToken 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response('Not Found', { status: 404 });
}

console.log(`Server starting on http://localhost:${PORT}`);
console.log(`Visit http://localhost:${PORT} for documentation`);
console.log(`Visit http://localhost:${PORT}/auth to authenticate with Google`);

Deno.serve({ port: PORT }, handler);