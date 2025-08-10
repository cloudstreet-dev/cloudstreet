export interface Slide {
  objectId?: string;
  pageElements?: any[];
  slideProperties?: any;
}

export interface Presentation {
  presentationId?: string;
  title?: string;
  slides?: Slide[];
}

export interface BatchUpdateRequest {
  requests: any[];
}

export class GoogleSlidesAPI {
  private baseUrl = 'https://slides.googleapis.com/v1';
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async makeRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google Slides API error: ${error}`);
    }

    return response;
  }

  async createPresentation(title: string): Promise<Presentation> {
    const response = await this.makeRequest(`${this.baseUrl}/presentations`, {
      method: 'POST',
      body: JSON.stringify({ title }),
    });

    return response.json();
  }

  async getPresentation(presentationId: string): Promise<Presentation> {
    const response = await this.makeRequest(`${this.baseUrl}/presentations/${presentationId}`);
    return response.json();
  }

  async batchUpdate(presentationId: string, requests: any[]): Promise<any> {
    const response = await this.makeRequest(
      `${this.baseUrl}/presentations/${presentationId}:batchUpdate`,
      {
        method: 'POST',
        body: JSON.stringify({ requests }),
      }
    );

    return response.json();
  }

  async createSlidesFromBullets(presentationId: string, bullets: string[]): Promise<void> {
    const requests: any[] = [];

    for (let i = 0; i < bullets.length; i++) {
      const slideId = `slide_${Date.now()}_${i}`;
      const textBoxId = `textbox_${Date.now()}_${i}`;

      requests.push({
        createSlide: {
          objectId: slideId,
          insertionIndex: i + 1,
          slideLayoutReference: {
            predefinedLayout: 'TITLE_AND_BODY'
          }
        }
      });

      requests.push({
        insertText: {
          objectId: slideId,
          insertionIndex: 0,
          text: bullets[i]
        }
      });
    }

    if (requests.length > 0) {
      await this.batchUpdate(presentationId, requests);
    }
  }

  async addTextToSlide(presentationId: string, slideId: string, text: string): Promise<void> {
    const requests = [
      {
        createShape: {
          objectId: `textbox_${Date.now()}`,
          shapeType: 'TEXT_BOX',
          elementProperties: {
            pageObjectId: slideId,
            size: {
              width: { magnitude: 600, unit: 'PT' },
              height: { magnitude: 300, unit: 'PT' }
            },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: 50,
              translateY: 100,
              unit: 'PT'
            }
          }
        }
      },
      {
        insertText: {
          objectId: `textbox_${Date.now()}`,
          insertionIndex: 0,
          text: text
        }
      }
    ];

    await this.batchUpdate(presentationId, requests);
  }
}