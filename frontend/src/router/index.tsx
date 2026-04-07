import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import App from "../App";
import ErrorFallback from "../components/ErrorFallback";
import LoadingScreen from "../components/LoadingScreen";


// Lazy loaded pages
const Index = lazy(() => import("../pages/Index"));
const Search = lazy(() => import("../pages/Search"));
const PosterBuilder = lazy(() => import("../pages/PosterBuilder"));
const Login = lazy(() => import("../pages/Login"));
const SignUp = lazy(() => import("../pages/Register"));
const ForgetPasswordPage = lazy(() => import("../pages/ForgetPasswordPage"));
const ContactPage = lazy(() => import("../pages/ContactPage"));

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
        path: "register",
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <SignUp />
          </Suspense>
        ),
      },
      {
        path: "ForgetPasswordPage",
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <ForgetPasswordPage />
          </Suspense>
        ),
      },
      {
        path: "ContactPage",
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <ContactPage />
          </Suspense>
        ),
      },
    ],
  },
]);
