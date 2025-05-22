import { useRef, useState, useLayoutEffect } from "react";
import { Menu, Avatar, Text, Group, Card } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDisclosure } from "@mantine/hooks";
import { IUser } from "@interfaces/User";
import LoginButton from "@components/common/LoginButton";
import SettingsModal from "@components/settings/SettingsModal";

interface IProps {
    user: IUser | null;
}

export default function UserMenuDesktop({ user }: IProps) {
    const [menuOpened, setMenuOpened] = useState(false);
    const [settingsModalOpen, { open: openSettingsModal, close: closeSettingsModal }] = useDisclosure(false);
    const triggerRef = useRef<HTMLDivElement>(null);
    const [dropdownWidth, setDropdownWidth] = useState<number | undefined>(undefined);

    useLayoutEffect(() => {
        if (triggerRef.current) {
            setDropdownWidth(triggerRef.current.offsetWidth);
        }
    }, [menuOpened]);

    if (!user) return <LoginButton size="md" style={{ width: "100%" }} />;

    return (
        <>
            <SettingsModal opened={settingsModalOpen} onClose={closeSettingsModal} />
            <Menu
                shadow="md"
                transitionProps={{ transition: "pop" }}
                opened={menuOpened}
                onChange={setMenuOpened}
                position="top-end"
                withinPortal
                trigger="click">
                <Menu.Target>
                    <Card
                        ref={triggerRef}
                        className="user-menu-card"
                        withBorder
                        shadow="sm"
                        p="md"
                        radius="md"
                        style={{ width: "100%", cursor: "pointer" }}>
                        <Group
                            style={{ cursor: "pointer", width: "100%" }}
                            gap="sm"
                            onClick={() => setMenuOpened((o) => !o)}>
                            <Avatar src={user.avatarUrl} size="2.5rem" radius="xl" />
                            <Text fw={500} size="md" truncate>
                                {user.username}
                            </Text>
                            <FontAwesomeIcon icon="bars" style={{ marginLeft: "auto" }} />
                        </Group>
                    </Card>
                </Menu.Target>
                <Menu.Dropdown
                    style={{ width: dropdownWidth, backgroundColor: "var(--mantine-color-primary-10) !important" }}>
                    <Menu.Label>Welcome back, {user.username}!</Menu.Label>
                    <Menu.Divider />
                    {user.isAdmin && (
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
