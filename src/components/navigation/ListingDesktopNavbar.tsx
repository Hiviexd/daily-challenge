import { AppShell, Group, Image, Stack, Button, Divider, Anchor, Text } from "@mantine/core";
import RoundFilters from "@components/listing/RoundFilters";
import RoundsList from "@components/listing/RoundsList";
import UserMenuDesktop from "@components/navigation/UserMenuDesktop";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useTimer from "@hooks/useTimer";

interface IProps {
    themeSearch: string;
    setThemeSearch: (search: string) => void;
    artistTitleSearch: string;
    setArtistTitleSearch: (search: string) => void;
    selectedDate: Date | null;
    setSelectedDate: (selectedDate: Date | null) => void;
    selectedCreator: string | null;
    setSelectedCreator: (creator: string | null) => void;
    loggedInUser: any;
    openCreateRoundModal: () => void;
    openCurationGuideModal: () => void;
    fetchNextPage: (...args: any[]) => void;
}

export default function ListingDesktopNavbar({
    themeSearch,
    setThemeSearch,
    artistTitleSearch,
    setArtistTitleSearch,
    selectedDate,
    setSelectedDate,
    selectedCreator,
    setSelectedCreator,
    loggedInUser,
    openCreateRoundModal,
    openCurationGuideModal,
    fetchNextPage,
}: IProps) {
    const timeLeft = useTimer();

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
                        themeSearch={themeSearch}
                        setThemeSearch={setThemeSearch}
                        artistTitleSearch={artistTitleSearch}
                        setArtistTitleSearch={setArtistTitleSearch}
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        selectedCreator={selectedCreator}
                        setSelectedCreator={setSelectedCreator}
                        isStaff={!!loggedInUser?.isStaff}
                    />
                    {loggedInUser?.isStaff && (
                        <>
                            <Button onClick={openCreateRoundModal} leftSection={<FontAwesomeIcon icon="plus" />}>
                                Create Round
                            </Button>
                            <Button
                                onClick={openCurationGuideModal}
                                leftSection={<FontAwesomeIcon icon="book" />}
                                variant="outline">
                                Curation Guide
                            </Button>
                        </>
                    )}
                    <Group justify="center">
                        <Text c="dimmed" size="xs" fw={500}>
                            Next daily in: {timeLeft}
                        </Text>
                    </Group>
                    <Divider />
                </Stack>
            </AppShell.Section>
            <RoundsList closeMobileNavbar={() => {}} fetchNextPage={fetchNextPage} />
            <AppShell.Section>
                <UserMenuDesktop user={loggedInUser} />
            </AppShell.Section>
        </AppShell.Navbar>
    );
}
