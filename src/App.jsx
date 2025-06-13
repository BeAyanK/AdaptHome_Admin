import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "./components/Layout/RootLayout";
import Auth from "./components/Auth/Auth";
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

  return (<div style={{
      background: 'linear-gradient(135deg, rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 35%, rgba(0, 212, 255, 1) 100%)',
      minHeight: '100vh',
      backgroundAttachment: 'fixed'
    }}>
      <RouterProvider router={router} />
    </div>);
};

export default App;
