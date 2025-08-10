import { GoogleSlidesAPI } from '../api/slides-api.ts';
import { GoogleAuth, TokenData } from '../auth/google-auth.ts';

export interface DynalistRequest {
  bullets: string[];
  presentationTitle?: string;
}

export class APIRoutes {
  private googleAuth: GoogleAuth;

  constructor(googleAuth: GoogleAuth) {
    this.googleAuth = googleAuth;
  }

  async handleCreateSlides(request: Request): Promise<Response> {
    try {
      const body: DynalistRequest = await request.json();
      
      if (!body.bullets || !Array.isArray(body.bullets) || body.bullets.length === 0) {
        return new Response(JSON.stringify({ error: 'Invalid request: bullets array is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const accessToken = this.googleAuth.getAccessToken();
      if (!accessToken) {
        return new Response(JSON.stringify({ error: 'Not authenticated. Please authenticate first.' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const slidesAPI = new GoogleSlidesAPI(accessToken);
      
      const presentationTitle = body.presentationTitle || `Dynalist Import - ${new Date().toISOString()}`;
      const presentation = await slidesAPI.createPresentation(presentationTitle);
      
      if (!presentation.presentationId) {
        throw new Error('Failed to create presentation');
      }

      const requests: any[] = [];
      
      for (let i = 0; i < body.bullets.length; i++) {
        const slideId = `slide_${Date.now()}_${i}`;
        
        requests.push({
          createSlide: {
            objectId: slideId,
            insertionIndex: i + 1,
            slideLayoutReference: {
              predefinedLayout: 'BLANK'
            }
          }
        });

        const textBoxId = `textbox_${Date.now()}_${i}`;
        
        requests.push({
          createShape: {
            objectId: textBoxId,
            shapeType: 'TEXT_BOX',
            elementProperties: {
              pageObjectId: slideId,
              size: {
                width: { magnitude: 600, unit: 'PT' },
                height: { magnitude: 400, unit: 'PT' }
              },
              transform: {
                scaleX: 1,
                scaleY: 1,
                translateX: 60,
                translateY: 100,
                unit: 'PT'
              }
            }
          }
        });

        requests.push({
          insertText: {
            objectId: textBoxId,
            insertionIndex: 0,
            text: body.bullets[i]
          }
        });

        requests.push({
          updateTextStyle: {
            objectId: textBoxId,
            style: {
              fontSize: {
                magnitude: 24,
                unit: 'PT'
              }
            },
            fields: 'fontSize'
          }
        });
      }

      if (requests.length > 0) {
        await slidesAPI.batchUpdate(presentation.presentationId, requests);
      }

      return new Response(JSON.stringify({
        success: true,
        presentationId: presentation.presentationId,
        presentationUrl: `https://docs.google.com/presentation/d/${presentation.presentationId}/edit`,
        slidesCreated: body.bullets.length
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Error creating slides:', error);
      return new Response(JSON.stringify({ 
        error: 'Failed to create slides', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  async handleAuthCallback(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    
    if (!code) {
      return new Response('Missing authorization code', { status: 400 });
    }

    try {
      const tokenData = await this.googleAuth.exchangeCodeForToken(code);
      
      await Deno.writeTextFile('./tokens.json', JSON.stringify(tokenData, null, 2));

      return new Response(`
        <html>
          <body>
            <h1>Authentication Successful!</h1>
            <p>You can now close this window and start using the API.</p>
            <p>Access token has been saved.</p>
          </body>
        </html>
      `, {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      });
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      return new Response(`Authentication failed: ${error}`, { status: 500 });
    }
  }

  async handleAuthStart(): Promise<Response> {
    const authUrl = this.googleAuth.getAuthUrl();
    
    return new Response(`
      <html>
        <body>
          <h1>Google Slides Authorization</h1>
          <p>Click the link below to authorize this application:</p>
          <a href="${authUrl}">Authorize with Google</a>
        </body>
      </html>
    `, {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}