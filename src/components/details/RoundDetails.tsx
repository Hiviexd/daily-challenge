import { Table, Select, TextInput, Image, ScrollArea, Group, Box, Stack, Card, Text, Divider } from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import { IconCheck } from "@tabler/icons-react";
import { IRound } from "@interfaces/Round";
import { IBeatmap } from "@interfaces/Beatmap";
import { useUpdateRoundBeatmap, useUpdateRound } from "@hooks/useRounds";
import useStaff from "@hooks/useUsers";
import { IUser } from "@interfaces/User";

interface IProps {
    round: IRound | null;
}

type UpdateRoundBeatmapArg = { index: number } & { [key: string]: string | number };

export default function RoundDetails({ round }: IProps) {
    const updateRoundBeatmap = useUpdateRoundBeatmap(round?._id || "");
    const updateRound = useUpdateRound(round?._id || "");

    const { data: staff } = useStaff();

    const getAssignedUserOptions = () => {
        if (!staff) return [];
        return staff.map((user: IUser) => ({ value: user._id, label: user.username }));
    };

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

    const debouncedUpdateRoundBeatmap = useDebouncedCallback(async (updatedRound: UpdateRoundBeatmapArg) => {
        await updateRoundBeatmap.mutateAsync(updatedRound);
    }, 1000);

    const debouncedUpdateRound = useDebouncedCallback(async (updatedRound: Record<string, string>) => {
        await updateRound.mutateAsync(updatedRound);
    }, 1000);

    // Handler for editing fields
    const handleEditBeatmap = (rowIdx: number, field: string, value: string) => {
        const updatedRound: UpdateRoundBeatmapArg = { index: rowIdx, [field]: value };
        debouncedUpdateRoundBeatmap(updatedRound);
    };

    const handleEditRound = (field: string, value: string) => {
        const updatedRound = { [field]: value };
        debouncedUpdateRound(updatedRound);
    };

    // Render a single row (for reuse)
    const renderRow = (bm: IBeatmap | null, idx: number) => (
        <Table.Tr key={idx}>
            {/* Beatmap ID Input (for empty rows, this is how you add a beatmap) */}
            <Table.Td style={{ minWidth: 80, maxWidth: 100, width: 100 }}>
                <TextInput
                    value={bm?.beatmapId === 0 ? "" : bm?.beatmapId?.toString()}
                    onChange={(e) => handleEditBeatmap(idx, "beatmapId", e.currentTarget.value)}
                    size="xs"
                    placeholder="..."
                />
            </Table.Td>
            {/* Star Range (predefined) */}
            <Table.Td style={{ textAlign: "center" }}>
                {typeof bm?.starRating === "number" ? `${bm?.starRating}★` : "-"}
            </Table.Td>
            {/* Artist - Title with Banner */}
            <Table.Td>
                {bm?.artist ? (
                    <Group gap="sm" wrap="nowrap">
                        <Image src={bm.cover} width={48} height={32} radius="sm" alt="cover" />
                        <Box>
                            <div style={{ fontWeight: 500 }}>
                                {bm?.artist} - {bm?.title} [{bm?.version}]
                            </div>
                        </Box>
                    </Group>
                ) : (
                    "-"
                )}
            </Table.Td>
            {/* Mapper */}
            <Table.Td>{bm?.creator?.username || "-"}</Table.Td>
            {/* Date Ranked */}
            <Table.Td>
                {bm?.rankedDate instanceof Date ? bm?.rankedDate.toLocaleDateString() : bm?.rankedDate || "-"}
            </Table.Td>
            {/* Notes Input */}
            <Table.Td>
                <TextInput
                    value={bm?.notes || ""}
                    onChange={(e) => handleEditBeatmap(idx, "notes", e.currentTarget.value)}
                    size="xs"
                    placeholder="..."
                />
            </Table.Td>
            {/* Duplicate Status Placeholder */}
            <Table.Td>
                <IconCheck color="var(--mantine-color-green-6)" />
            </Table.Td>
        </Table.Tr>
    );

    return (
        <Stack gap="md">
            <Card shadow="sm" p="md" bg="primary.11">
                <Stack gap="md">
                    <Text fw={500} size="lg">
                        {round?.title}
                    </Text>
                    <Divider />
                    <Group align="flex-end" gap="md">
                        <Select
                            label="Assigned User"
                            data={getAssignedUserOptions()}
                            value={round?.assignedUser?._id}
                            onChange={(val) => {
                                handleEditRound("assignedUser", val!);
                            }}
                            style={{ maxWidth: 220 }}
                        />
                        <TextInput
                            label="Theme"
                            value={round?.theme}
                            onChange={(e) => {
                                handleEditRound("theme", e.currentTarget.value);
                            }}
                            style={{ minWidth: 300 }}
                        />
                    </Group>
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
                                <Table.Th>Notes</Table.Th>
                                <Table.Th>Duplicate status</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>{displayBeatmaps.map((bm, idx) => renderRow(bm, idx))}</Table.Tbody>
                    </Table>
                </ScrollArea>
            </Card>
        </Stack>
    );
}
