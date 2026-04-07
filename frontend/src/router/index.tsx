import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import App from "../App";
import ErrorFallback from "../components/ui/ErrorFallback";
import LoadingScreen from "../components/ui/LoadingScreen";


// Lazy loaded pages
const Index = lazy(() => import("../pages/Index"));
const Search = lazy(() => import("../pages/Search"));
const PosterBuilder = lazy(() => import("../pages/PosterBuilder"));
const Map = lazy(() => import("../pages/Map"));
const Login = lazy(() => import("../pages/Login"));
const SignUp = lazy(() => import("../pages/Register"));
const Profile = lazy(() => import("../pages/Profile"));
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
        path: "map",
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <Map />
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
        path: "profile",
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <Profile />
          </Suspense>
        ),
      },
      {
        path: "forgot-password",
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <ForgetPasswordPage />
          </Suspense>
        ),
      },
      {
        path: "contact",
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <ContactPage />
          </Suspense>
        ),
      },
    ],
  },
]);
