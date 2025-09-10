import { useState } from "react";
import { Menu, Avatar } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDisclosure, useHover } from "@mantine/hooks";
import { IUser } from "@interfaces/User";
import LoginButton from "@components/common/LoginButton";
import SettingsModal from "@components/settings/SettingsModal";

interface IProps {
    user: IUser | null;
}

export default function UserMenuMobile({ user }: IProps) {
    const [menuOpened, setMenuOpened] = useState(false);
    const { hovered, ref } = useHover();
    const [settingsModalOpen, { open: openSettingsModal, close: closeSettingsModal }] = useDisclosure(false);

    if (!user) return <LoginButton size="sm" />;

    return (
        <>
            <SettingsModal opened={settingsModalOpen} onClose={closeSettingsModal} />

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

                    {user.hasAccess && (
                        <Menu.Item onClick={openSettingsModal} leftSection={<FontAwesomeIcon icon="cog" />}>
                            Settings
                        </Menu.Item>
                    )}

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
