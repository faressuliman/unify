import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import App from "../App";
import ErrorFallback from "../components/ErrorFallback";
import LoadingScreen from "../components/LoadingScreen";

// Lazy loaded pages
const Index = lazy(() => import("../pages/Index"));
const SearchPage = lazy(() => import("../pages/SearchPage"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorFallback />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <Index />
          </Suspense>
        ),
      },
      {
        path: "search",
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <SearchPage />
          </Suspense>
        ),
      },
    ],
  },
]);
