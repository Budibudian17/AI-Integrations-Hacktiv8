# Hilmi Vision Chat

A minimalist, ChatGPT-style web application with Google Hilmi Vision AI integration. Supports both text-only and multimodal (image + text) conversations.

## 🎨 Features

- ✅ **Text & Image Chat** - Send text prompts with optional images
- ✅ **Markdown Support** - Bold, italic, and code formatting in responses
- ✅ **Paste Images** - Copy/paste images from clipboard (Ctrl+V)
- ✅ **Modern UI** - Black & white minimalist design with sidebar
- ✅ **Real-time Loading** - Animated loading indicators
- ✅ **Copy Responses** - One-click copy to clipboard
- ✅ **Temperature Control** - Adjust AI creativity level

## 📁 Project Structure

```
bootcamphacktiv8/
├── .env                    # Environment variables (API keys)
├── package.json            # Node.js dependencies
├── server.js               # Express backend server
├── public/                 # Static frontend files
│   ├── index.html         # Main HTML page
│   ├── css/
│   │   └── style.css      # Custom styles & animations
│   └── js/
│       └── app.js         # Client-side JavaScript
├── test.html              # (Legacy - can be removed)
└── gemini-integration.js  # (Legacy - can be removed)
```

## 🚀 Getting Started

### 1. Prerequisites

- Node.js (v18 or higher)
- Google Gemini API Key ([Get it here](https://makersuite.google.com/app/apikey))

### 2. Installation

```bash
# Install dependencies
npm install
```

### 3. Configuration

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_api_key_here
PORT=3000
```

### 4. Run the Server

```bash
# Production mode
npm start

# Development mode (auto-restart on file changes)
npm run dev
```

### 5. Open in Browser

Navigate to: **http://localhost:3000**

## 📡 API Endpoints

### `POST /generate`
Text-only generation without images.

**Request:**
```json
{
  "prompt": "What is the capital of France?",
  "temperature": 0.9
}
```

**Response:**
```json
{
  "result": "The capital of France is Paris."
}
```

### `POST /generate-multimodal`
Multimodal generation with image + text.

**Request:** `multipart/form-data`
- `file`: Image file (required)
- `prompt`: Text prompt (required)
- `temperature`: Float (optional, default: 0.9)

**Response:**
```json
{
  "result": "This image shows..."
}
```

## 🎯 Usage

### Text Chat
1. Type your prompt in the input field
2. Press **Enter** or click **Send**
3. Wait for AI response

### Image Chat
1. Click the **📎 paperclip** icon to upload an image
   - OR copy an image and press **Ctrl+V** to paste
2. Preview will appear showing filename and size
3. Type your prompt (e.g., "What's in this image?")
4. Press **Send**

### Features
- **New Chat** - Click sidebar button to clear conversation
- **Copy Response** - Click copy button on AI messages
- **Temperature** - Adjust 0.0 (focused) to 2.0 (creative)

## 🛠️ Tech Stack

**Frontend:**
- HTML5
- Tailwind CSS (via CDN)
- Lucide Icons
- Vanilla JavaScript

**Backend:**
- Node.js
- Express.js
- Multer (file uploads)
- Google Generative AI SDK
- dotenv

## 📝 Code Organization

### `server.js`
- Express server configuration
- API endpoint routing
- Static file serving from `public/`
- Gemini AI integration

### `public/index.html`
- Semantic HTML structure
- Sidebar navigation
- Chat area with messages
- Input form with file upload

### `public/css/style.css`
- CSS animations (slideIn, bounce, etc.)
- Custom scrollbar styles
- Utility classes

### `public/js/app.js`
- File handling (upload, paste, preview)
- Message rendering (user/AI)
- Markdown parsing (**bold**, *italic*, `code`)
- Form submission & API calls
- Loading states & notifications

## 🐛 Troubleshooting

**Server won't start:**
- Check if `.env` file exists with valid `GEMINI_API_KEY`
- Ensure port 3000 is not in use

**Images not uploading:**
- Check file size (Gemini has limits)
- Ensure image format is supported (jpg, png, gif, webp)

**API errors:**
- Verify API key is valid
- Check API quota/limits
- Review console logs for details

## 📄 License

ISC

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

**Built with ❤️ using Google Gemini AI**
