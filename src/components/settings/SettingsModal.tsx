import { Modal, Tabs } from "@mantine/core";
import { useAtom } from "jotai";
import { loggedInUserAtom } from "@store/atoms";
import ModsSyncSettings from "@components/settings/ModsSyncSettings";
import UsersSettings from "@components/settings/UsersSettings";
import UserActivity from "@components/settings/UserActivity";
import UserStats from "@components/settings/UserStats";

interface SettingsModalProps {
    opened: boolean;
    onClose: () => void;
}

export default function SettingsModal({ opened, onClose }: SettingsModalProps) {
    const [loggedInUser] = useAtom(loggedInUserAtom);

    if (!loggedInUser?.isAdmin) return null;

    return (
        <Modal opened={opened} onClose={onClose} title="Settings" size="lg">
            <Tabs defaultValue="users">
                <Tabs.List grow>
                    <Tabs.Tab value="users">Users</Tabs.Tab>
                    <Tabs.Tab value="mods">Mods</Tabs.Tab>
                    <Tabs.Tab value="activity">Activity</Tabs.Tab>
                    <Tabs.Tab value="stats">Stats</Tabs.Tab>
                    <Tabs.Tab value="logs" disabled>
                        Logs
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="users" pt="md">
                    <UsersSettings />
                </Tabs.Panel>
                <Tabs.Panel value="mods" pt="md">
                    <ModsSyncSettings />
                </Tabs.Panel>
                <Tabs.Panel value="activity" pt="md">
                    <UserActivity />
                </Tabs.Panel>
                <Tabs.Panel value="stats" pt="md">
                    <UserStats />
                </Tabs.Panel>
                <Tabs.Panel value="logs" pt="md">
                    Logs settings placeholder
                </Tabs.Panel>
            </Tabs>
        </Modal>
    );
}
