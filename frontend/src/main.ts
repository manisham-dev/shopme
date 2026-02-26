import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

console.log('Starting Angular app...');
bootstrapApplication(App, appConfig)
  .then(() => console.log('Angular app started successfully'))
  .catch((err) => console.error('Angular bootstrap error:', err));
