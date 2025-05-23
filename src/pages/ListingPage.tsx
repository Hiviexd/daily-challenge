import { AppShell, Card } from "@mantine/core";
import { useState, useEffect, useMemo } from "react";
import { useDisclosure } from "@mantine/hooks";
import { selectedRoundIdAtom, loggedInUserAtom, roundsAtom } from "@store/atoms";
import { useAtom } from "jotai";
import { useRoundsQuery } from "@hooks/useRounds";
import { useDebouncedValue } from "@mantine/hooks";
import utils from "@utils/index";

// components
import MobileHeader from "@components/navigation/MobileHeader";
import CreateRoundModal from "@components/listing/CreateRoundModal";
import ListingDesktopNavbar from "@components/navigation/ListingDesktopNavbar";
import ListingMobileNavbar from "@components/navigation/ListingMobileNavbar";
import RoundDetails from "@components/details/RoundDetails";
import CurationGuideModal from "@components/listing/CurationGuideModal";

export default function ListingPage() {
    const [loggedInUser] = useAtom(loggedInUserAtom);
    const [themeSearch, setThemeSearch] = useState("");
    const [artistTitleSearch, setArtistTitleSearch] = useState("");
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const [debouncedThemeSearch] = useDebouncedValue(themeSearch, 500);
    const [debouncedArtistTitleSearch] = useDebouncedValue(artistTitleSearch, 500);

    const [selectedRoundId, setSelectedRoundId] = useAtom(selectedRoundIdAtom);

    const filterParams = useMemo(
        () => ({
            theme: debouncedThemeSearch.trim() || undefined,
            artistTitle: debouncedArtistTitleSearch.trim() || undefined,
            date: selectedDate ? utils.toUTCDateOnly(selectedDate).toISOString() : undefined,
        }),
        [debouncedThemeSearch, debouncedArtistTitleSearch, selectedDate]
    );

    const { fetchNextPage } = useRoundsQuery(filterParams);
    const [rounds] = useAtom(roundsAtom);

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

    const [curationGuideModalOpen, { open: openCurationGuideModal, close: closeCurationGuideModal }] =
        useDisclosure(false);

    return (
        <AppShell
            padding="md"
            header={{ height: { base: 70, sm: 0 } }}
            navbar={{
                width: 300,
                breakpoint: "sm",
                collapsed: { mobile: !MobileNavbarOpen, desktop: false },
            }}>
            <CreateRoundModal opened={createRoundModalOpen} onClose={closeCreateRoundModal} />
            <CurationGuideModal opened={curationGuideModalOpen} onClose={closeCurationGuideModal} />

            <ListingDesktopNavbar
                themeSearch={themeSearch}
                setThemeSearch={setThemeSearch}
                artistTitleSearch={artistTitleSearch}
                setArtistTitleSearch={setArtistTitleSearch}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                loggedInUser={loggedInUser}
                openCreateRoundModal={openCreateRoundModal}
                openCurationGuideModal={openCurationGuideModal}
                fetchNextPage={fetchNextPage}
            />

            <AppShell.Header hiddenFrom="sm">
                <MobileHeader MobileNavbarOpen={MobileNavbarOpen} toggleMobileNavbar={toggleMobileNavbar} />
            </AppShell.Header>

            <ListingMobileNavbar
                themeSearch={themeSearch}
                setThemeSearch={setThemeSearch}
                artistTitleSearch={artistTitleSearch}
                setArtistTitleSearch={setArtistTitleSearch}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                loggedInUser={loggedInUser}
                openCreateRoundModal={openCreateRoundModal}
                closeMobileNavbar={closeMobileNavbar}
                openCurationGuideModal={openCurationGuideModal}
                fetchNextPage={fetchNextPage}
            />

            <AppShell.Main>
                <Card shadow="sm" p="xl">
                    <RoundDetails round={selectedRound} />
                </Card>
            </AppShell.Main>
        </AppShell>
    );
}
