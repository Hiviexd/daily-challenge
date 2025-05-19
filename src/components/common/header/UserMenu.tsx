import { useState } from "react";
import { Menu, Avatar } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useHover } from "@mantine/hooks";
import { IUser } from "@interfaces/User";
import LoginButton from "@components/common/LoginButton";

interface IProps {
    user: IUser | null;
}

export default function UserMenu({ user }: IProps) {
    const [menuOpened, setMenuOpened] = useState(false);
    const { hovered, ref } = useHover();

    if (!user) return <LoginButton size="sm" />;

    return (
        <>
            <Menu withArrow shadow="md" trigger="hover" opened={menuOpened} onChange={setMenuOpened}>
                <Menu.Target>
                    <Avatar
                        ref={ref}
                        src={user.avatarUrl}
                        size="3rem"
                        className="user-avatar"
                        style={{
                            borderColor: hovered || menuOpened ? "var(--mantine-color-primary-4)" : "transparent",
                        }}
                    />
                </Menu.Target>
                <Menu.Dropdown>
                    <Menu.Label>Welcome back, {user.username}!</Menu.Label>

                    <Menu.Divider />

                    <Menu.Item
                        onClick={() => {
                            window.location.href = "/api/auth/logout";
                        }}
                        color="danger"
                        leftSection={<FontAwesomeIcon icon="sign-out-alt" />}>
                        Sign Out
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
        </>
    );
}
