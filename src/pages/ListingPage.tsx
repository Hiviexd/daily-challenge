import { AppShell, TextInput, Stack, Paper, Divider, Button } from "@mantine/core";
import { useState, useEffect } from "react";
import { useDisclosure } from "@mantine/hooks";
import { selectedRoundAtom, roundsAtom, loggedInUserAtom } from "@store/atoms";
import { useAtom } from "jotai";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// components
import Header from "@components/common/Header";
import CreateRoundModal from "@components/listing/CreateRoundModal";
import RoundsList from "@components/listing/RoundsList";

export default function ListingPage() {
    const [loggedInUser] = useAtom(loggedInUserAtom);
    const [search, setSearch] = useState("");

    const [selectedRound, setSelectedRound] = useAtom(selectedRoundAtom);
    const [rounds] = useAtom(roundsAtom);

    // Set selected round to the active round on initial load
    useEffect(() => {
        if (rounds.length > 0 && !selectedRound) {
            const active = rounds.find((r) => r.isActive);
            if (active) setSelectedRound(active);
        }
    }, [rounds, selectedRound, setSelectedRound]);

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
                <Paper
                    shadow="sm"
                    p="xl"
                    withBorder
                    h={400}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}>
                    Selected Round: {selectedRound?.title}
                </Paper>
            </AppShell.Main>
        </AppShell>
    );
}
