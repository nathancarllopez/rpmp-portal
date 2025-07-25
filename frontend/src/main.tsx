import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dropzone/styles.css";
import '@mantine/dates/styles.css';
import { theme } from "@/theme.ts";
import { Notifications } from "@mantine/notifications";
import { MantineProvider } from "@mantine/core";

import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";

import * as TanStackQueryProvider from "./integrations/tanstack-query/root-provider.tsx";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

import reportWebVitals from "./reportWebVitals.ts";

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    ...TanStackQueryProvider.getContext(),
    userId: null,
  },
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
  defaultPendingMs: 500,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <MantineProvider defaultColorScheme="dark" theme={theme}>
        <Notifications />
        <TanStackQueryProvider.Provider>
          <RouterProvider router={router}/>
        </TanStackQueryProvider.Provider>
      </MantineProvider>
    </StrictMode>
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
