import { Routes } from "@angular/router";
import { AuthCallbackComponent } from "./auth-callback/auth-callback.component";
import { HomeComponent } from "./home/home.component";
import { NotFoundComponent } from "./not-found/not-found.component";

export const routes: Routes = [
  { path: "", component: HomeComponent, title: "Tuurio Auth Angular Demo" },
  { path: "auth/callback", component: AuthCallbackComponent, title: "Completing sign-in" },
  { path: "callback", component: AuthCallbackComponent, title: "Completing sign-in" },
  { path: "**", component: NotFoundComponent, title: "Route not found" },
];
