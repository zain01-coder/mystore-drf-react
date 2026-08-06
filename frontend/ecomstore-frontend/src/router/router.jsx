import React from "react";
import Home from "../pages/Home";
import Layout from "../components/Layout";
import Login from "../pages/Login";
import { createBrowserRouter } from 'react-router-dom'
import Store from "../pages/Store";
import ProductDetail from "../pages/ProductDetail";
import Cart from "../pages/Cart";
import Signup from "../pages/Signup";
import VerifyEmail from "../pages/VerifyEmail";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import PublicOnlyRoute from "../components/PublicOnlyroute";
import Checkout from "../pages/Checkout";
import OrderSuccess from "../pages/OrderSuccess";
import Payment from "../pages/Payment";
import Dashboard from "../pages/Dashboard";
import Wishlist from "../pages/Wishlist";
import Orders from '../pages/Orders'
import Addresses from '../pages/Addresses'



const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children: [
            { index: true, element: <Home /> },
            {
                element: <PublicOnlyRoute />,
                children: [
                    { path: "login", element: <Login /> },
                    { path: "register", element: <Signup /> },
                ],
            },
            { path: "verify-email", element: <VerifyEmail /> },
            { path: "verifyemail", element: <VerifyEmail /> },
            { path: "forgotpassword", element: <ForgotPassword /> },
            { path: "reset-password/:uid/:token", element: <ResetPassword /> },
            { path: "cart", element: <Cart /> },
            { path: "wishlist", element: <Wishlist /> },
            { path: "checkout", element: <Checkout /> },
            { path: "payment/:order_number", element: <Payment /> },
            { path: "order-success/:orderNumber", element: <OrderSuccess /> },
            { path: "orders", element: <Orders /> },
            { path: "addresses", element: <Addresses /> },
            { path: "dashboard", element: <Dashboard /> },
            { path: "store", element: <Store /> },
            { path: "store/category/:slug", element: <Store /> },
            { path: "store/category/:category_slug/:product_slug", element: <ProductDetail /> },
        ]
    }
])

export default router
