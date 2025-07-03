import { AppShell, Stack, Button, Divider, Group, Text } from "@mantine/core";
import RoundFilters from "@components/listing/RoundFilters";
import RoundsList from "@components/listing/RoundsList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useTimer from "@hooks/useTimer";

interface IProps {
    themeSearch: string;
    setThemeSearch: (search: string) => void;
    artistTitleSearch: string;
    setArtistTitleSearch: (search: string) => void;
    selectedDate: Date | null;
    setSelectedDate: (selectedDate: Date | null) => void;
    loggedInUser: any;
    openCreateRoundModal: () => void;
    closeMobileNavbar: () => void;
    openCurationGuideModal: () => void;
    fetchNextPage: (...args: any[]) => void;
}

export default function ListingMobileNavbar({
    themeSearch,
    setThemeSearch,
    artistTitleSearch,
    setArtistTitleSearch,
    selectedDate,
    setSelectedDate,
    loggedInUser,
    openCreateRoundModal,
    closeMobileNavbar,
    openCurationGuideModal,
    fetchNextPage,
}: IProps) {
    const timeLeft = useTimer();

    return (
        <AppShell.Navbar p="md" hiddenFrom="sm" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Stack style={{ flex: 1, minHeight: 0 }}>
                <RoundFilters
                    themeSearch={themeSearch}
                    setThemeSearch={setThemeSearch}
                    artistTitleSearch={artistTitleSearch}
                    setArtistTitleSearch={setArtistTitleSearch}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
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
                        Next daily is in: {timeLeft}
                    </Text>
                </Group>
                <Divider />
                <RoundsList closeMobileNavbar={closeMobileNavbar} fetchNextPage={fetchNextPage} />
            </Stack>
        </AppShell.Navbar>
    );
}
