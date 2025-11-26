import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// ✅ Import AG Grid modules
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';


// ✅ Register once for the whole app
ModuleRegistry.registerModules([AllCommunityModule]);


// bootstrapApplication(App, appConfig)
//   .catch((err) => console.error(err));
bootstrapApplication(App, {
  providers: [provideHttpClient(),provideRouter(routes)] 
});
