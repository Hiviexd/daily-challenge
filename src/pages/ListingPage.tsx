import { AppShell, TextInput, Stack, Paper, Divider, Button, Skeleton, Text } from "@mantine/core";
import { useCallback, useState, useEffect } from "react";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";
import { selectedRoundAtom } from "../store/atoms";
import { useAtom } from "jotai";
import useRounds from "../hooks/useRounds";

// components
import Header from "../components/common/Header";
import RoundCard from "../components/listing/RoundCard";
import CreateRoundModal from "../components/listing/CreateRoundModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function ListingPage() {
    const [search, setSearch] = useState("");
    const [debouncedSearch] = useDebouncedValue(search, 300);
    const [cursor, setCursor] = useState<string | null>(null);

    const [selectedRound, setSelectedRound] = useAtom(selectedRoundAtom);

    const { data: rounds, isLoading: isLoadingRounds, isError: isErrorRounds } = useRounds();

    const [createRoundModalOpen, { open: openCreateRoundModal, close: closeCreateRoundModal }] = useDisclosure(false);

    // Set selected round to the active round on initial load
    useEffect(() => {
        if (rounds && rounds.length > 0 && !selectedRound) {
            const active = rounds.find((r) => r.isActive);
            if (active) setSelectedRound(active);
        }
    }, [rounds, selectedRound, setSelectedRound]);

    const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight * 1.5) {
            // Load more rounds here using the cursor
            // TODO: Implement loading more rounds
        }
    }, []);

    const loadingState = () => {
        return Array.from({ length: 10 }).map((_, index) => <Skeleton key={index} height={100} width="100%" />);
    };

    const EmptyState = ({ hasError }: { hasError: boolean }) => {
        return (
            <Stack align="center" justify="center" h={200}>
                <FontAwesomeIcon icon="poll-h" size="2x" style={{ opacity: 0.5 }} />
                <Text size="lg" c="dimmed">
                    {hasError ? "Error loading rounds" : "No rounds found..."}
                </Text>
                <Text size="sm" c="dimmed">
                    {hasError ? `Try refreshing the page.` : "Try adjusting your filters."}
                </Text>
            </Stack>
        );
    };

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
            <AppShell.Navbar p="md">
                <Stack>
                    <TextInput
                        placeholder="Search rounds..."
                        value={search}
                        onChange={(e) => setSearch(e.currentTarget.value)}
                        leftSection={<IconSearch size={16} />}
                    />
                    <Button onClick={openCreateRoundModal}>Create Round</Button>
                    <Divider />
                    <Stack style={{ flex: 1 }} onScroll={handleScroll}>
                        {isLoadingRounds ? (
                            loadingState()
                        ) : isErrorRounds || rounds?.length === 0 ? (
                            <EmptyState hasError={isErrorRounds} />
                        ) : (
                            rounds?.map((round, idx) => (
                                <div
                                    key={round.id}
                                    style={{
                                        animation: "roundCardPop 0.4s cubic-bezier(0.4,0,0.2,1) both",
                                        animationDelay: `${idx * 60}ms`,
                                    }}
                                    className="round-card-animate">
                                    <RoundCard
                                        round={round}
                                        selected={selectedRound && selectedRound.id === round.id}
                                        onClick={() => setSelectedRound(round)}
                                    />
                                </div>
                            ))
                        )}
                    </Stack>
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
