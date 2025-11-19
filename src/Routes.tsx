import {createBrowserRouter, type RouteObject} from "react-router";
import App from "./App.tsx";
import {StockPage} from "./pages/StockPage.tsx";
import {OrdersPage} from "./pages/OrdersPage.tsx";
import NotFoundPage from "./pages/NotFoundPage.tsx";
import MainLayout from "./MainLayout.tsx";
import MainLayoutProvider from "./providers/MainLayoutProvider.tsx";
import {PurchasePage} from "./pages/PurchasePage.tsx";

export type AppRouteObject = RouteObject & {
    title?: string;
    children?: AppRouteObject[];
}
export const routes: AppRouteObject[] = [
    {
        element: <App/>,
        children: [
            {
                path: '/',
                element: (
                    <MainLayoutProvider>
                        <MainLayout/>
                    </MainLayoutProvider>
                ),
                children: [
                    {
                        element: <StockPage/>,
                        title: 'Склад',
                        path: '/',
                    },
                    {
                        element: <StockPage/>,
                        title: 'Склад',
                        path: '/stock'
                    },
                    {
                        element: <PurchasePage/>,
                        title: 'Закупка',
                        path: '/purchase'
                    },
                    {
                        element: <OrdersPage/>,
                        title: 'Заказы',
                        path: '/orders'
                    },
                ]
            },
            {
                path: '*',
                element: <NotFoundPage/>
            }
        ]
    }
];

export const router = createBrowserRouter(routes);