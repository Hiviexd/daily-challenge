import { ScrollArea, Stack, Skeleton, Text } from "@mantine/core";
import { useAtom } from "jotai";
import { selectedRoundIdAtom, roundsAtom, roundsQueryStateAtom } from "@store/atoms";
import RoundCard from "@components/listing/RoundCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface IProps {
    closeMobileNavbar: () => void;
    fetchNextPage: (...args: any[]) => void;
}

function EmptyState({ hasError }: { hasError: boolean }) {
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
}

export default function RoundsList({ closeMobileNavbar, fetchNextPage }: IProps) {
    const [rounds] = useAtom(roundsAtom);
    const [queryState] = useAtom(roundsQueryStateAtom);
    const { isLoading, isError, hasNextPage, isFetchingNextPage } = queryState;
    const [selectedRoundId, setSelectedRoundId] = useAtom(selectedRoundIdAtom);

    const loadingState = () => {
        return Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} radius="md" height={100} width="100%" />
        ));
    };

    return (
        <ScrollArea
            style={{ flex: 1, minHeight: 0 }}
            onBottomReached={() => {
                if (hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            }}>
            <Stack>
                {isLoading ? (
                    loadingState()
                ) : isError || rounds.length === 0 ? (
                    <EmptyState hasError={isError} />
                ) : (
                    <>
                        {rounds.map((round, idx) => (
                            <div
                                key={round.id}
                                style={{
                                    animation: "roundCardPop 0.4s cubic-bezier(0.4,0,0.2,1) both",
                                    animationDelay: `${120 + (idx % 10) * 60}ms`,
                                    overflow: "visible",
                                }}
                                className="round-card-animate">
                                <RoundCard
                                    round={round}
                                    selected={selectedRoundId === round.id}
                                    onClick={() => {
                                        setSelectedRoundId(round.id);
                                        closeMobileNavbar();
                                    }}
                                />
                            </div>
                        ))}
                        {isFetchingNextPage && loadingState()}
                    </>
                )}
            </Stack>
            <div
                style={{
                    position: "sticky",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 32,
                    marginTop: "auto",
                    pointerEvents: "none",
                    zIndex: 2,
                    background:
                        "linear-gradient(to bottom, rgba(255,255,255,0) 0%, var(--mantine-color-body, #fff) 100%)",
                }}
            />
        </ScrollArea>
    );
}
