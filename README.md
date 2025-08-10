# 🎯 Dynalist to Google Slides Converter

> Transform your Dynalist bullet points into beautiful Google Slides presentations with a single API call!

A TypeScript application built for Deno that seamlessly converts bullet-point lists from Dynalist into individual Google Slides, making presentation creation effortless.

## ✨ Features

- **🔐 OAuth2 Authentication** - Secure Google account integration
- **📝 One Bullet = One Slide** - Each bullet point becomes a formatted slide
- **🚀 REST API** - Simple JSON endpoints for easy integration
- **⚡ Built for Deno** - Modern TypeScript runtime with top-level await
- **🎨 Auto-formatting** - Clean, readable slide layouts
- **💾 Token Management** - Automatic token storage and refresh
- **🛡️ Error Handling** - Comprehensive error reporting

## 🚀 Quick Start

### Prerequisites

1. **Google Cloud Setup**:
   - Create a [Google Cloud Project](https://console.cloud.google.com/)
   - Enable the **Google Slides API**
   - Create OAuth2 credentials (Web application)
   - Add `http://localhost:8000/auth/callback` to authorized redirect URIs

2. **Deno Installation**:
   ```bash
   # Install Deno (if not already installed)
   curl -fsSL https://deno.land/install.sh | sh
   ```

### Installation & Setup

1. **Clone and Configure**:
   ```bash
   git clone <repository-url>
   cd cloudstreet
   cp .env.example .env
   ```

2. **Add your Google credentials** to `.env`:
   ```env
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   GOOGLE_REDIRECT_URI=http://localhost:8000/auth/callback
   PORT=8000
   ```

3. **Start the server**:
   ```bash
   deno task dev
   ```

4. **Authenticate** by visiting: http://localhost:8000/auth

## 📚 API Reference

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/auth` | Start OAuth2 authentication flow |
| `GET` | `/auth/callback` | OAuth2 callback (automatic) |
| `GET` | `/health` | Check server and auth status |

### Slide Creation

#### `POST /api/create-slides`

Convert bullet points to slides.

**Request Body:**
```json
{
  "bullets": [
    "Introduction to the project",
    "Key features and benefits", 
    "Implementation timeline",
    "Next steps and questions"
  ],
  "presentationTitle": "My Amazing Presentation"
}
```

**Response:**
```json
{
  "success": true,
  "presentationId": "1BxAB1C2D3E4F5G6H7I8J9K0L",
  "presentationUrl": "https://docs.google.com/presentation/d/1BxAB.../edit",
  "slidesCreated": 4
}
```

## 💡 Usage Examples

### Using curl

```bash
# Create a presentation from bullet points
curl -X POST http://localhost:8000/api/create-slides \
  -H "Content-Type: application/json" \
  -d '{
    "bullets": [
      "Welcome to our quarterly review",
      "Q3 achievements and milestones",
      "Challenges we overcame",
      "Q4 goals and objectives"
    ],
    "presentationTitle": "Q3 Review - Team Alpha"
  }'
```

### Using JavaScript/fetch

```javascript
const response = await fetch('http://localhost:8000/api/create-slides', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    bullets: [
      'Market analysis overview',
      'Competitive landscape',
      'Our unique value proposition',
      'Go-to-market strategy'
    ],
    presentationTitle: 'Business Strategy 2024'
  })
});

const result = await response.json();
console.log(`✅ Created presentation: ${result.presentationUrl}`);
```

## 🏗️ Project Structure

```
cloudstreet/
├── src/
│   ├── auth/
│   │   └── google-auth.ts      # OAuth2 authentication logic
│   ├── api/
│   │   └── slides-api.ts       # Google Slides API client
│   ├── routes/
│   │   └── api.ts             # API route handlers
│   └── main.ts                # Application entry point
├── deno.json                  # Deno configuration
├── .env.example              # Environment variables template
└── README.md                 # This file
```

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `GOOGLE_CLIENT_ID` | ✅ | Google OAuth2 client ID | - |
| `GOOGLE_CLIENT_SECRET` | ✅ | Google OAuth2 client secret | - |
| `GOOGLE_REDIRECT_URI` | ❌ | OAuth2 redirect URI | `http://localhost:8000/auth/callback` |
| `PORT` | ❌ | Server port | `8000` |

### Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Google Slides API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
5. Choose **Web application**
6. Add authorized redirect URI: `http://localhost:8000/auth/callback`
7. Copy Client ID and Client Secret to your `.env` file

## 🚀 Development

### Available Scripts

```bash
# Start development server with file watching
deno task dev

# Start production server
deno task start

# Run with custom permissions
deno run --allow-net --allow-env --allow-read --allow-write src/main.ts
```

### Required Permissions

- `--allow-net` - HTTP server and Google API calls
- `--allow-env` - Environment variable access
- `--allow-read` - Read token files and configuration
- `--allow-write` - Save authentication tokens

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙋‍♂️ Support

- 📖 Visit http://localhost:8000 for interactive documentation
- 🐛 Report issues on GitHub
- 💡 Suggest features via GitHub Issues

---

<div align="center">

**Made with ❤️ using Deno and TypeScript**

*Transform your bullets into beautiful slides!*

</div>
