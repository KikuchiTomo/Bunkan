import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './src/App';

const root = createRoot(document.getElementById('contents')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
