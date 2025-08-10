export interface TokenData {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope?: string;
}

export class GoogleAuth {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private tokenData: TokenData | null = null;

  constructor(clientId: string, clientSecret: string, redirectUri: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
  }

  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/presentations https://www.googleapis.com/auth/drive.file',
      access_type: 'offline',
      prompt: 'consent'
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }

  async exchangeCodeForToken(code: string): Promise<TokenData> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to exchange code for token: ${error}`);
    }

    this.tokenData = await response.json();
    return this.tokenData;
  }

  async refreshAccessToken(refreshToken: string): Promise<TokenData> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to refresh token: ${error}`);
    }

    const newTokenData = await response.json();
    this.tokenData = { ...this.tokenData, ...newTokenData };
    return this.tokenData;
  }

  getAccessToken(): string | null {
    return this.tokenData?.access_token || null;
  }

  setTokenData(tokenData: TokenData): void {
    this.tokenData = tokenData;
  }

  getTokenData(): TokenData | null {
    return this.tokenData;
  }
}