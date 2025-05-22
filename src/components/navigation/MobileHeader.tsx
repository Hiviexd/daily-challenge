// state
import { useAtom } from "jotai";
import { loggedInUserAtom } from "@store/atoms";

// Mantine
import { AppShell, Group, Image, Burger } from "@mantine/core";

// components
import UserMenuMobile from "@components/navigation/UserMenuMobile";

interface IProps {
    MobileNavbarOpen: boolean;
    toggleMobileNavbar: () => void;
}

export default function MobileHeader({ MobileNavbarOpen, toggleMobileNavbar }: IProps) {
    const [user] = useAtom(loggedInUserAtom);

    return (
        <AppShell.Header>
            <Group h="100%" px="xl">
                <div className="nav-group">
                    <Group>
                        <Burger hiddenFrom="sm" opened={MobileNavbarOpen} onClick={toggleMobileNavbar} />
                        <div className="logo-flip-container">
                            <div className="logo-flip-card">
                                <Image src="/assets/logo-main.svg" alt="Logo" h={45} className="logo-image-front" />
                                <Image src="/assets/logo-decidious.svg" alt="Logo" h={45} className="logo-image-back" />
                            </div>
                        </div>
                    </Group>
                    <UserMenuMobile user={user} />
                </div>
            </Group>
        </AppShell.Header>
    );
}
