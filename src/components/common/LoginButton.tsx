import { Button, Image, ButtonProps } from "@mantine/core";
import { useState } from "react";
import { useAtom } from "jotai";
import { loggedInUserAtom } from "@store/atoms";

interface IProps extends Omit<ButtonProps, "onClick" | "loading" | "leftSection" | "variant" | "gradient"> {
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    text?: string;
}

export default function LoginButton({ size = "md", text = "Sign in with osu!", ...props }: IProps) {
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [user] = useAtom(loggedInUserAtom);

    const handleLogin = () => {
        setIsLoggingIn(true);
        window.location.href = "/api/auth/login";
    };

    const getIconSize = () => {
        if (size === "xs") return 16;
        if (size === "sm") return 20;
        return 26;
    };

    if (user) return;

    return (
        <Button
            onClick={handleLogin}
            variant="gradient"
            loading={isLoggingIn}
            gradient={{ from: "primary.9", to: "primary.4", deg: 45 }}
            leftSection={<Image src="/assets/logo-osu.svg" h={getIconSize()} />}
            size={size}
            {...props}>
            {text}
        </Button>
    );
}
