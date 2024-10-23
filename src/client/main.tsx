import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './root/app';
import { Router } from './root/routes';

const root = createRoot(document.getElementById('root')!);

root.render(<StrictMode><App><Router /></App></StrictMode>);