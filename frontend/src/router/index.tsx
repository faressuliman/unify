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
const ResetPassword = lazy(() => import("../pages/ResetPassword"));
const Contact = lazy(() => import("../pages/Contact"));
const CreatePost = lazy(() => import("../pages/CreatePost"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword"));
const AboutUs = lazy(() => import("../pages/AboutUs"));
const Donate = lazy(() => import("../pages/Donate"));

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
        path: "reset-password",
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <ResetPassword />
          </Suspense>
        ),
      },
      {
        path: "contact",
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <Contact />
          </Suspense>
        ),
      },
      {
        path: "create-post",
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <CreatePost />
          </Suspense>
        ),
      },
      {
        path: "forgot-password",
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <ForgotPassword />
          </Suspense>
        ),
      },
      {
        path: "about-us",
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <AboutUs />
          </Suspense>
        ),
      },
      {
        path: "donate",
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <Donate />
          </Suspense>
        ),
      }
    ],
  },
]);
