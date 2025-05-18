import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useLoggedInUser from "../hooks/useLoggedInUser";
import { useAtom } from "jotai";
import { loggedInUserAtom, redirectAtom } from "../store/atoms";
import utils from "../../utils";
import { notifications } from "@mantine/notifications";
import Loading from "../components/common/Loading";

interface IPropTypes {
    permissions?: string[];
    children: JSX.Element;
}

export default function ProtectedRoute({ permissions = [], children }: IPropTypes) {
    const { data: user, isLoading } = useLoggedInUser();
    const [, setLoggedInUser] = useAtom(loggedInUserAtom);
    const [redirect, setRedirect] = useAtom(redirectAtom);
    const navigate = useNavigate();
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        if (utils.httpIsValid(user)) {
            setLoggedInUser(user);
        }
        setAuthChecked(true);
    }, [user, setLoggedInUser]);

    useEffect(() => {
        if (authChecked && permissions.length && !utils.hasRequiredPermissions(user, permissions)) {
            notifications.show({
                title: "Missing Permissions",
                message: "You don't have the required permissions to view this page.",
                color: "red",
                autoClose: 300000,
            });
            setRedirect(true);
        }
    }, [user, permissions, authChecked, setRedirect]);

    useEffect(() => {
        if (redirect) {
            setRedirect(false);
            navigate("/");
        }
    }, [redirect, setRedirect, navigate]);

    if (isLoading || !authChecked) {
        return <Loading />;
    }

    return children;
}
