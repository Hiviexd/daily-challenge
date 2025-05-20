import { Table, ScrollArea, Stack, Card, Text, Divider, Badge, Group } from "@mantine/core";
import { IRound } from "@interfaces/Round";
import { IBeatmap } from "@interfaces/Beatmap";
import BeatmapRow from "./BeatmapRow";
import RoundManagement from "./RoundManagement";

interface IProps {
    round: IRound | null;
}

export default function RoundDetails({ round }: IProps) {
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

    const getColors = (round: IRound) => {
        if (round?.isActive) return { title: "Active", color: "success", cssColor: "var(--mantine-color-success-6)" };
        if (round?.isPast) return { title: "Past", color: "danger", cssColor: "var(--mantine-color-danger-6)" };
        if (round?.isUpcoming) return { title: "Upcoming", color: "gray", cssColor: "var(--mantine-color-gray-6)" };
        return { title: "Unknown", color: "primary", cssColor: "var(--mantine-color-primary-6)" };
    };

    return (
        <Stack gap="md">
            <Card
                shadow="sm"
                p="md"
                bg="primary.11"
                radius="md"
                style={{ borderTop: `4px solid ${getColors(round!).cssColor}` }}>
                <Stack gap="md">
                    <Group>
                        <Text fw={700} size="xl">
                            {round?.title}
                        </Text>
                        <Badge color={getColors(round!).color} variant="light">
                            {getColors(round!).title}
                        </Badge>
                    </Group>
                    {/* round management */}
                    <Divider />
                    <RoundManagement round={round!} />
                </Stack>
            </Card>
            <Card shadow="sm" p="md" bg="primary.11">
                <ScrollArea w="100%" type="auto" style={{ minWidth: 1200 }}>
                    <Table>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th style={{ minWidth: 80, maxWidth: 100, width: 100 }}>Beatmap ID</Table.Th>
                                <Table.Th style={{ textAlign: "center" }}>Star Rating</Table.Th>
                                <Table.Th>Artist - Title</Table.Th>
                                <Table.Th>Mapper</Table.Th>
                                <Table.Th>Date Ranked</Table.Th>
                                <Table.Th>Notes/Mods</Table.Th>
                                <Table.Th style={{ textAlign: "center" }}>Duplicate status</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {displayBeatmaps.map((bm, idx) => (
                                <BeatmapRow key={idx} beatmap={bm} index={idx} roundId={round?._id || ""} />
                            ))}
                        </Table.Tbody>
                    </Table>
                </ScrollArea>
            </Card>
        </Stack>
    );
}
