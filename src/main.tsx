import { createRoot } from 'react-dom/client';

// Temporarily suppress auth session errors
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  const errorMessage = args[0]?.toString() || '';
  if (
    errorMessage.includes('AuthSessionMissingError') ||
    errorMessage.includes('Auth session missing') ||
    args[0]?.name === 'AuthSessionMissingError'
  ) {
    // Suppress auth session errors - these are normal when not logged in
    return;
  }
  // Log all other errors normally
  originalConsoleError.apply(console, args);
};

import App from './App.tsx';
import './index.css';
import { publishContentCreatorsBlogPost } from './utils/publishBlogPost';

// Make blog post publisher available globally for easy console access
if (typeof window !== 'undefined') {
  (window as any).publishContentCreatorsBlogPost = publishContentCreatorsBlogPost;
}

createRoot(document.getElementById('root')!).render(
  <App />
);
