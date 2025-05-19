import { AppShell, TextInput, Stack, Paper, Divider, Button, Card } from "@mantine/core";
import { useState, useEffect } from "react";
import { useDisclosure } from "@mantine/hooks";
import { selectedRoundIdAtom, roundsAtom, loggedInUserAtom } from "@store/atoms";
import { useAtom } from "jotai";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// components
import Header from "@components/common/Header";
import CreateRoundModal from "@components/listing/CreateRoundModal";
import RoundsList from "@components/listing/RoundsList";
import RoundDetails from "@components/details/RoundDetails";

export default function ListingPage() {
    const [loggedInUser] = useAtom(loggedInUserAtom);
    const [search, setSearch] = useState("");

    const [selectedRoundId, setSelectedRoundId] = useAtom(selectedRoundIdAtom);
    const [rounds] = useAtom(roundsAtom);

    const selectedRound = rounds.find((r) => r.id === selectedRoundId) ?? null;

    // Set selected round ID to the active round on initial load
    useEffect(() => {
        if (rounds.length > 0 && !selectedRoundId) {
            const active = rounds.find((r) => r.isActive);
            if (active) setSelectedRoundId(active.id);
        }
    }, [rounds, selectedRoundId, setSelectedRoundId]);

    const [createRoundModalOpen, { open: openCreateRoundModal, close: closeCreateRoundModal }] = useDisclosure(false);

    return (
        <AppShell
            padding="md"
            header={{ height: 70 }}
            navbar={{
                width: 300,
                breakpoint: "sm",
            }}>
            <CreateRoundModal opened={createRoundModalOpen} onClose={closeCreateRoundModal} />
            <AppShell.Header>
                <Header />
            </AppShell.Header>
            <AppShell.Navbar p="md" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <Stack style={{ flex: 1, minHeight: 0 }}>
                    {/* TODO: move filters to a separate component */}
                    <TextInput
                        placeholder="Search rounds..."
                        value={search}
                        onChange={(e) => setSearch(e.currentTarget.value)}
                        leftSection={<FontAwesomeIcon icon="search" />}
                    />
                    {loggedInUser?.isAdmin && (
                        <Button onClick={openCreateRoundModal} leftSection={<FontAwesomeIcon icon="plus" />}>
                            Create Round
                        </Button>
                    )}

                    <Divider />

                    <RoundsList />
                </Stack>
            </AppShell.Navbar>

            <AppShell.Main>
                <Card shadow="sm" p="xl">
                    <RoundDetails selectedRound={selectedRound} />
                </Card>
            </AppShell.Main>
        </AppShell>
    );
}
