import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "./components/Layout/RootLayout";
import Auth from "./components/Auth/Auth";
import HomePage from "./components/Pages/HomePage";
import CategoryPage from "./components/Pages/CategoryPage";
import OrderPage from "./components/Pages/OrderPage";
import ProductPage from "./components/Pages/ProductPage";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const App = () => {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const router = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      children: [
        { path: "/", element: <Auth /> },

            {
          path: "/home",
          element: isLoggedIn ? <HomePage /> : <Navigate to="/" replace />,
        },
        {
          path: "/product",
          element: isLoggedIn ? <ProductPage /> : <Navigate to="/" replace />,
        },
        {
          path: "/orders",
          element: isLoggedIn ? <OrderPage /> : <Navigate to="/" replace />,
        },
        {
          path: "/category",
          element: isLoggedIn ? <CategoryPage /> : <Navigate to="/" replace />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router}></RouterProvider>;
};

export default App;
