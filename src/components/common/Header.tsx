// state
import { useAtom } from "jotai";
import { loggedInUserAtom } from "@store/atoms";

// Mantine
import { AppShell, Group, Image } from "@mantine/core";

// components
import UserMenu from "@components/common/header/UserMenu";

export default function Header() {
    const [user] = useAtom(loggedInUserAtom);

    return (
        <AppShell.Header>
            <Group h="100%" px="xl">
                <div className="nav-group">
                    <div className="logo-flip-container">
                        <div className="logo-flip-card">
                            <Image src="/assets/logo-main.svg" alt="Logo" h={45} className="logo-image-front" />
                            <Image src="/assets/logo-decidious.svg" alt="Logo" h={45} className="logo-image-back" />
                        </div>
                    </div>
                    <UserMenu user={user} />
                </div>
            </Group>
        </AppShell.Header>
    );
}
