import { AppShell, Stack, Button, Divider } from "@mantine/core";
import RoundFilters from "@components/listing/RoundFilters";
import RoundsList from "@components/listing/RoundsList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface IProps {
    search: string;
    setSearch: (search: string) => void;
    selectedDate: Date | null;
    setSelectedDate: (selectedDate: Date | null) => void;
    loggedInUser: any;
    openCreateRoundModal: () => void;
    closeMobileNavbar: () => void;
    openCurationGuideModal: () => void;
}

export default function ListingMobileNavbar({
    search,
    setSearch,
    selectedDate,
    setSelectedDate,
    loggedInUser,
    openCreateRoundModal,
    closeMobileNavbar,
    openCurationGuideModal,
}: IProps) {
    return (
        <AppShell.Navbar p="md" hiddenFrom="sm" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Stack style={{ flex: 1, minHeight: 0 }}>
                <RoundFilters
                    search={search}
                    setSearch={setSearch}
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
                <Divider />
                <RoundsList closeMobileNavbar={closeMobileNavbar} />
            </Stack>
        </AppShell.Navbar>
    );
}
