import { Modal, Tabs } from "@mantine/core";
import { useAtom } from "jotai";
import { loggedInUserAtom } from "@store/atoms";

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
                    <Tabs.Tab value="stats">Stats</Tabs.Tab>
                    <Tabs.Tab value="logs">Logs</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="users" pt="md">
                    Users settings placeholder
                </Tabs.Panel>
                <Tabs.Panel value="mods" pt="md">
                    Mods settings placeholder
                </Tabs.Panel>
                <Tabs.Panel value="stats" pt="md">
                    Stats settings placeholder
                </Tabs.Panel>
                <Tabs.Panel value="logs" pt="md">
                    Logs settings placeholder
                </Tabs.Panel>
            </Tabs>
        </Modal>
    );
}
