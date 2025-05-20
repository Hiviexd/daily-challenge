import { ScrollArea, Stack, Skeleton, Text } from "@mantine/core";
import { useAtom } from "jotai";
import { roundsAtom, selectedRoundIdAtom } from "@store/atoms";
import { useInfiniteRounds } from "@hooks/useRounds";
import RoundCard from "@components/listing/RoundCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface IProps {
    closeMobileNavbar: () => void;
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

export default function RoundsList({ closeMobileNavbar }: IProps) {
    const [rounds] = useAtom(roundsAtom);
    const [selectedRoundId, setSelectedRoundId] = useAtom(selectedRoundIdAtom);
    const { fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = useInfiniteRounds();

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
                                    animationDelay: `${idx * 60}ms`,
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
                        <div style={{ height: 64 }} />
                    </>
                )}
            </Stack>
        </ScrollArea>
    );
}
