import ListingPage from "@pages/ListingPage";
import { Navigate } from "react-router-dom";

interface RouteConfig {
    path: string;
    page: JSX.Element;
    permissions?: string[];
}

const routes: RouteConfig[] = [
    {
        path: "/",
        page: <ListingPage />,
        permissions: [],
    },
    {
        path: "*",
        page: <Navigate to="/" />,
        permissions: [],
    },
];

export default routes;
