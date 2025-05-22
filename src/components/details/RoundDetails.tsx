import { Table, ScrollArea, Stack, Card, Text, Divider, Badge, Group, Button } from "@mantine/core";
import { IRound, IWarning } from "@interfaces/Round";
import { IBeatmap } from "@interfaces/Beatmap";
import BeatmapRow from "./BeatmapRow";
import RoundManagement from "./RoundManagement";
import { useCheckRoundDuplicates } from "@hooks/useRounds";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAtom } from "jotai";
import { roundDuplicateWarningsAtom } from "@store/atoms";
import { loggedInUserAtom } from "@store/atoms";
import RoundDetailsSkeleton from "./RoundDetailsSkeleton";
import { useState, useEffect } from "react";

interface IProps {
    round: IRound | null;
}

export default function RoundDetails({ round }: IProps) {
    const [loggedInUser] = useAtom(loggedInUserAtom);
    const isStaff = loggedInUser?.isStaff;
    const isLoading = !round;

    // Build a map from beatmapId to beatmap object
    const beatmapMap = new Map<string, IBeatmap>();
    (round?.beatmaps ?? []).forEach((bm) => {
        if (bm && bm._id) beatmapMap.set(bm._id.toString(), bm);
    });

    // Build the display array using beatmapOrder (length 7, null for empty slots)
    const displayBeatmaps: (IBeatmap | null)[] = Array(7).fill(null);
    (round?.beatmapOrder ?? []).forEach((entry) => {
        if (typeof entry.order === "number" && entry.order >= 0 && entry.order < 7) {
            const bm = beatmapMap.get(entry.beatmapId.toString()) ?? null;
            displayBeatmaps[entry.order] = bm;
        }
    });

    const roundId = round?._id || "";

    // Only track image loading for non-null beatmaps
    const imageBeatmapIndices = displayBeatmaps
        .map((bm, idx) => (bm ? idx : null))
        .filter((idx) => idx !== null) as number[];
    const [imagesLoaded, setImagesLoaded] = useState<boolean[]>(imageBeatmapIndices.map(() => false));
    const allImagesLoaded = imagesLoaded.every(Boolean);

    useEffect(() => {
        setImagesLoaded(displayBeatmaps.filter(Boolean).map(() => false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roundId]);

    const handleImageLoad = (imgIdx: number) => {
        setImagesLoaded((prev) => {
            if (prev[imgIdx]) return prev;
            const next = [...prev];
            next[imgIdx] = true;
            return next;
        });
    };

    const getColors = (round: IRound) => {
        if (round?.isActive) return { title: "Active", color: "success", cssColor: "var(--mantine-color-success-6)" };
        if (round?.isPast) return { title: "Past", color: "danger", cssColor: "var(--mantine-color-danger-6)" };
        if (round?.isUpcoming) return { title: "Upcoming", color: "gray", cssColor: "var(--mantine-color-gray-6)" };
        return { title: "Unknown", color: "primary", cssColor: "var(--mantine-color-primary-6)" };
    };

    // Atom for duplicate warnings per round
    const [roundDuplicateWarnings, setRoundDuplicateWarnings] = useAtom(roundDuplicateWarningsAtom);
    const roundWarnings = roundDuplicateWarnings[roundId]?.warnings || [];
    const hasCheckedDuplicates = !!roundDuplicateWarnings[roundId]?.checked;

    // Map warnings by targetBeatmapId for quick lookup
    const warningMap = new Map<string, IWarning>();
    roundWarnings.forEach((w) => {
        warningMap.set(w.targetBeatmapId, w);
    });

    // React Query mutation for checking duplicates
    const checkDuplicatesMutation = useCheckRoundDuplicates(roundId);

    // Handler for checking duplicates
    const handleCheckDuplicates = () => {
        if (!roundId) return;
        checkDuplicatesMutation.mutate(undefined, {
            onSuccess: (data) => {
                setRoundDuplicateWarnings((prev) => ({
                    ...prev,
                    [roundId]: { warnings: data, checked: true },
                }));
            },
            onError: () => {
                setRoundDuplicateWarnings((prev) => ({
                    ...prev,
                    [roundId]: { warnings: [], checked: true },
                }));
            },
        });
    };

    if (isLoading) {
        return <RoundDetailsSkeleton isStaff={!!isStaff} />;
    }

    return (
        <Stack gap="md">
            <Card
                shadow="sm"
                p="md"
                bg="primary.11"
                radius="md"
                style={{
                    borderTop: `4px solid ${round ? getColors(round).cssColor : "var(--mantine-color-primary-6)"}`,
                }}>
                <Stack gap="md">
                    <Group gap="xs">
                        <Text fw={700} size="xl">
                            {round?.title}
                        </Text>
                        {!isLoading && (
                            <Badge color={getColors(round!).color} variant="light">
                                {getColors(round!).title}
                            </Badge>
                        )}
                        {!isLoading && loggedInUser?.hasAccess && (
                            <Badge color={!round?.isUpcoming ? "info" : "gray"} variant="light">
                                <FontAwesomeIcon icon={!round?.isUpcoming ? "eye" : "eye-slash"} />
                            </Badge>
                        )}
                    </Group>
                    {/* round management or theme */}
                    {isStaff ? (
                        <>
                            <Divider />
                            <RoundManagement round={round!} />
                        </>
                    ) : (
                        <Group gap="xs">
                            <Text size="sm" fw={700}>
                                Theme:
                            </Text>
                            {round?.theme ? (
                                <Text size="sm" fw={500}>
                                    {round?.theme}
                                </Text>
                            ) : (
                                <Text size="sm" c="dimmed" fs="italic">
                                    No Theme
                                </Text>
                            )}
                        </Group>
                    )}
                </Stack>
            </Card>
            <Card shadow="sm" p="md" bg="primary.11">
                <ScrollArea>
                    <Table miw={{ base: 1200 }}>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th style={{ minWidth: 80, maxWidth: 100, width: 100 }}>Beatmap ID</Table.Th>
                                <Table.Th style={{ textAlign: "center" }}>Star Rating</Table.Th>
                                <Table.Th>Artist - Title</Table.Th>
                                <Table.Th>Difficulty</Table.Th>
                                <Table.Th>Host</Table.Th>
                                <Table.Th>Date Ranked</Table.Th>
                                <Table.Th>Notes/Mods</Table.Th>
                                {isStaff && (
                                    <Table.Th style={{ textAlign: "center" }}>
                                        {!hasCheckedDuplicates ? (
                                            <Button
                                                size="xs"
                                                variant="light"
                                                onClick={handleCheckDuplicates}
                                                loading={checkDuplicatesMutation.isPending}
                                                leftSection={<FontAwesomeIcon icon="clone" />}>
                                                Check Duplicates
                                            </Button>
                                        ) : (
                                            "Duplicate Status"
                                        )}
                                    </Table.Th>
                                )}
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {displayBeatmaps.map((bm, idx) => {
                                // Only show skeleton logic for non-null beatmaps
                                const imgIdx = imageBeatmapIndices.indexOf(idx);
                                return (
                                    <BeatmapRow
                                        key={idx}
                                        beatmap={bm}
                                        index={idx}
                                        roundId={roundId}
                                        warning={
                                            bm && bm.beatmapId ? warningMap.get(bm.beatmapId.toString()) : undefined
                                        }
                                        hasCheckedDuplicates={hasCheckedDuplicates}
                                        showSkeleton={!!bm && !allImagesLoaded}
                                        onImageLoad={bm ? () => handleImageLoad(imgIdx) : undefined}
                                    />
                                );
                            })}
                        </Table.Tbody>
                    </Table>
                </ScrollArea>
            </Card>
        </Stack>
    );
}
