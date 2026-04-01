import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import App from "../App";
import ErrorFallback from "../components/ErrorFallback";
import LoadingScreen from "../components/LoadingScreen";

// Lazy loaded pages
const Index = lazy(() => import("../pages/Index"));
const Search = lazy(() => import("../pages/Search"));
const PosterBuilder = lazy(() => import("../pages/PosterBuilder"));
const Login = lazy(() => import("../pages/LoginPage"));
const SignUp = lazy(() => import("../pages/SignUpPage"));

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
            <Search />
          </Suspense>
        ),
      },
      {
        path: "poster-builder",
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <PosterBuilder />
          </Suspense>
        ),
      },
      {
        path: "login",
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <Login />
          </Suspense>
        ),
      },
      {
        path: "signup",
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <SignUp />
          </Suspense>
        ),
      },
    ],
  },
]);
