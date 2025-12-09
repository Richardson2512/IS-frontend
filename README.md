# InsightSnap Frontend

React + TypeScript + Vite frontend application for InsightSnap.

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Supabase** - Authentication and database
- **Lucide React** - Icons

## Project Structure

```
insightsnap-frontend/
├── src/
│   ├── components/     # React components
│   ├── services/       # API services and business logic
│   ├── lib/           # Third-party library configurations
│   └── utils/         # Utility functions
├── public/            # Static assets
├── index.html         # HTML entry point
└── package.json       # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js 20+ 
- npm or yarn

### Installation

```bash
cd insightsnap-frontend
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Backend API URL
VITE_BACKEND_URL=https://backend-production-be5d.up.railway.app

# Meta Pixel ID (for analytics)
VITE_META_PIXEL_ID=782862880877552

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

Output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Deployment

### Netlify

The frontend is configured for Netlify deployment:

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

### Environment Variables for Production

Set these in Netlify dashboard:

- `VITE_BACKEND_URL` - Backend API URL
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_META_PIXEL_ID` - Meta Pixel ID (optional)

## Features

- 🔍 **Social Media Research** - Search across Reddit, X, YouTube, LinkedIn, Threads
- 🤖 **AI-Powered Analysis** - Focus area generation and content categorization
- 📝 **Script Generation** - Generate content scripts based on research
- 💳 **Subscription Plans** - Standard and Pro plans via DoDo Payments
- 📊 **Analytics** - Search history and relevance ratings
- 📱 **Responsive Design** - Mobile-first approach

## License

MIT

