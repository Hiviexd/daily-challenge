import { AppShell, Group, Image, Stack, Button, Divider, Anchor } from "@mantine/core";
import RoundFilters from "@components/listing/RoundFilters";
import RoundsList from "@components/listing/RoundsList";
import UserMenuDesktop from "@components/navigation/UserMenuDesktop";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function ListingDesktopNavbar({
    search,
    setSearch,
    selectedDate,
    setSelectedDate,
    loggedInUser,
    openCreateRoundModal,
}: any) {
    return (
        <AppShell.Navbar p="md" visibleFrom="sm" style={{ height: "100%" }}>
            <AppShell.Section>
                <Group justify="center" mb="md">
                    <div className="logo-flip-container">
                        <div className="logo-flip-card">
                            <Image src="/assets/logo-main.svg" alt="Logo" h={45} className="logo-image-front" />
                            <Image src="/assets/logo-decidious.svg" alt="Logo" h={45} className="logo-image-back" />
                        </div>
                    </div>
                    <Anchor
                        c="white"
                        fw={700}
                        size="lg"
                        href="https://osu.ppy.sh/wiki/en/Gameplay/Daily_challenge"
                        target="_blank">
                        Daily Challenge
                    </Anchor>
                </Group>
            </AppShell.Section>
            <AppShell.Section mb="md">
                <Stack style={{ flex: 1, minHeight: 0 }}>
                    <RoundFilters
                        search={search}
                        setSearch={setSearch}
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                    />
                    {loggedInUser?.isStaff && (
                        <Button onClick={openCreateRoundModal} leftSection={<FontAwesomeIcon icon="plus" />}>
                            Create Round
                        </Button>
                    )}
                    <Divider />
                </Stack>
            </AppShell.Section>
            <RoundsList closeMobileNavbar={() => {}} />
            <AppShell.Section>
                <UserMenuDesktop user={loggedInUser} />
            </AppShell.Section>
        </AppShell.Navbar>
    );
}
