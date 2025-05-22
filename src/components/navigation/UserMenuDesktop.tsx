import { Avatar, Group, Card, ActionIcon, Tooltip } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDisclosure } from "@mantine/hooks";
import { IUser } from "@interfaces/User";
import LoginButton from "@components/common/LoginButton";
import SettingsModal from "@components/settings/SettingsModal";
import UserLink from "@components/common/UserLink";

interface IProps {
    user: IUser | null;
}

export default function UserMenuDesktop({ user }: IProps) {
    const [settingsModalOpen, { open: openSettingsModal, close: closeSettingsModal }] = useDisclosure(false);

    if (!user) return <LoginButton size="md" style={{ width: "100%" }} />;

    return (
        <>
            <SettingsModal opened={settingsModalOpen} onClose={closeSettingsModal} />
            <Card withBorder shadow="sm" p="md" radius="md" style={{ width: "100%" }}>
                <Group style={{ width: "100%" }} gap="sm">
                    <Avatar src={user.avatarUrl} size="2.5rem" radius="xl" />
                    <UserLink user={user} c="white" />
                    <Group gap={4} ml="auto">
                        {user.isAdmin && (
                            <Tooltip label="Settings">
                                <ActionIcon
                                    variant="subtle"
                                    color="primary"
                                    onClick={openSettingsModal}
                                    size="lg"
                                    aria-label="Settings">
                                    <FontAwesomeIcon icon="cog" />
                                </ActionIcon>
                            </Tooltip>
                        )}
                        <Tooltip label="Sign Out">
                            <ActionIcon
                                variant="subtle"
                                color="danger"
                                onClick={() => {
                                    window.location.href = "/api/auth/logout";
                                }}
                                size="lg"
                                aria-label="Sign Out">
                                <FontAwesomeIcon icon="sign-out-alt" />
                            </ActionIcon>
                        </Tooltip>
                    </Group>
                </Group>
            </Card>
        </>
    );
}
