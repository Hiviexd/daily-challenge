import ListingPage from "@pages/ListingPage";

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
    /*{
        path: "/admin",
        page: <AdminPage />,
        permissions: ["admin"],
    },*/
    /*{
        path: "*",
        page: <NotFoundPage />,
        permissions: [],
    },*/
];

export default routes;
