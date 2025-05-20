import { AppShell, Stack, Divider, Button, Card } from "@mantine/core";
import { useState, useEffect } from "react";
import { useDisclosure } from "@mantine/hooks";
import { selectedRoundIdAtom, loggedInUserAtom } from "@store/atoms";
import { useAtom } from "jotai";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useInfiniteRounds } from "@hooks/useRounds";
import { useDebouncedValue } from "@mantine/hooks";
import utils from "@utils/index";

// components
import Header from "@components/common/Header";
import CreateRoundModal from "@components/listing/CreateRoundModal";
import RoundsList from "@components/listing/RoundsList";
import RoundDetails from "@components/details/RoundDetails";
import RoundFilters from "@components/listing/RoundFilters";

export default function ListingPage() {
    const [loggedInUser] = useAtom(loggedInUserAtom);
    const [search, setSearch] = useState("");
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const [debouncedSearch] = useDebouncedValue(search, 500);

    const [selectedRoundId, setSelectedRoundId] = useAtom(selectedRoundIdAtom);

    const { rounds } = useInfiniteRounds({
        theme: debouncedSearch.trim() || undefined,
        date: selectedDate ? utils.toUTCDateOnly(selectedDate).toISOString() : undefined,
    });

    const selectedRound = rounds.find((r) => r.id === selectedRoundId) ?? null;

    // Set selected round ID to the active round on initial load, if there is no active round, set it to the first round
    useEffect(() => {
        if (rounds.length === 0) {
            if (selectedRoundId) setSelectedRoundId(null);
            return;
        }
        // If the current selected round is not in the new rounds, or not set, update it
        const stillExists = rounds.some((r) => r.id === selectedRoundId);
        if (!stillExists) {
            const active = rounds.find((r) => r.isActive);
            if (active) setSelectedRoundId(active.id);
            else setSelectedRoundId(rounds[0].id);
        }
    }, [rounds, selectedRoundId, setSelectedRoundId]);

    const [MobileNavbarOpen, { toggle: toggleMobileNavbar, close: closeMobileNavbar }] = useDisclosure(false);

    const [createRoundModalOpen, { open: openCreateRoundModal, close: closeCreateRoundModal }] = useDisclosure(false);

    return (
        <AppShell
            padding="md"
            header={{ height: 70 }}
            navbar={{
                width: 300,
                breakpoint: "sm",
                collapsed: { mobile: !MobileNavbarOpen, desktop: false },
            }}>
            <CreateRoundModal opened={createRoundModalOpen} onClose={closeCreateRoundModal} />
            <AppShell.Header>
                <Header MobileNavbarOpen={MobileNavbarOpen} toggleMobileNavbar={toggleMobileNavbar} />
            </AppShell.Header>
            <AppShell.Navbar p="md" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <Stack style={{ flex: 1, minHeight: 0 }}>
                    {/* Filters */}
                    <RoundFilters
                        search={search}
                        setSearch={setSearch}
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                    />
                    {loggedInUser?.isAdmin && (
                        <Button onClick={openCreateRoundModal} leftSection={<FontAwesomeIcon icon="plus" />}>
                            Create Round
                        </Button>
                    )}

                    <Divider />

                    <RoundsList closeMobileNavbar={closeMobileNavbar} />
                </Stack>
            </AppShell.Navbar>

            <AppShell.Main>
                <Card shadow="sm" p="xl">
                    <RoundDetails round={selectedRound} />
                </Card>
            </AppShell.Main>
        </AppShell>
    );
}
