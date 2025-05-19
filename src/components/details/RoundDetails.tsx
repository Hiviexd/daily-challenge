import { useState } from "react";
import { Table, Select, TextInput, Image, ScrollArea, Group, Box, Stack, Card } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";

interface BeatmapRow {
    beatmapId: number | "";
    beatmapsetId?: number;
    starRating?: number;
    artist?: string;
    title?: string;
    version?: string;
    cover?: string;
    rankedDate?: Date;
    creator?: { osuId: number; username: string };
    notes?: string;
}

// No props needed for now

const staffOptions = [
    { value: "1", label: "TheMagicAnim" },
    { value: "2", label: "AnotherStaff" },
    { value: "3", label: "TestUser" },
];

const initialBeatmaps: BeatmapRow[] = [
    {
        beatmapId: 1863290,
        beatmapsetId: 1,
        starRating: 3.22,
        artist: "HyuN",
        title: "Illusion of Inflict",
        version: "Hard",
        cover: "https://assets.ppy.sh/beatmaps/1863290/covers/cover@2x.jpg",
        rankedDate: new Date("2018-12-28"),
        creator: { osuId: 1, username: "schoolboy" },
        notes: "",
    },
    null,
    {
        beatmapId: 1863290,
        beatmapsetId: 1,
        starRating: 3.22,
        artist: "HyuN",
        title: "Illusion of Inflict",
        version: "Hard",
        cover: "https://assets.ppy.sh/beatmaps/1863290/covers/cover@2x.jpg",
        rankedDate: new Date("2018-12-28"),
        creator: { osuId: 1, username: "schoolboy" },
        notes: "",
    },
    // Add more beatmaps here if needed
];

export default function RoundDetails() {
    // Editable fields for the round
    const [assignedUser, setAssignedUser] = useState(staffOptions[0].value);
    const [theme, setTheme] = useState("");

    // Beatmaps state (always 7 rows)
    const [beatmaps, setBeatmaps] = useState<BeatmapRow[]>(() => {
        const arr = Array(7)
            .fill(null)
            .map((_, i) => initialBeatmaps[i] || { beatmapId: "" });
        return arr;
    });

    // Handler for editing fields
    const handleEdit = (rowIdx: number, field: string, value: any) => {
        // For now, just log the change
        console.log(`Edit row ${rowIdx}: ${field} ->`, value);
        setBeatmaps((prev) => prev.map((bm, idx) => (idx === rowIdx ? { ...bm, [field]: value } : bm)));
    };

    // Render a single row (for reuse)
    const renderRow = (bm: BeatmapRow, idx: number) => (
        <Table.Tr key={idx}>
            {/* Beatmap ID Input (for empty rows, this is how you add a beatmap) */}
            <Table.Td style={{ minWidth: 80, maxWidth: 100, width: 100 }}>
                <TextInput
                    value={bm.beatmapId === "" ? "" : bm.beatmapId.toString()}
                    onChange={(e) => handleEdit(idx, "beatmapId", e.currentTarget.value)}
                    size="xs"
                    placeholder="..."
                />
            </Table.Td>
            {/* Star Range (predefined) */}
            <Table.Td style={{ textAlign: "center" }}>
                {typeof bm.starRating === "number" ? `${bm.starRating}★` : "-"}
            </Table.Td>
            {/* Artist - Title with Banner */}
            <Table.Td>
                {bm.artist ? (
                    <Group gap="sm" wrap="nowrap">
                        <Image src={bm.cover} width={48} height={32} radius="sm" alt="cover" />
                        <Box>
                            <div style={{ fontWeight: 500 }}>
                                {bm.artist} - {bm.title} [{bm.version}]
                            </div>
                        </Box>
                    </Group>
                ) : (
                    "-"
                )}
            </Table.Td>
            {/* Mapper */}
            <Table.Td>{bm.creator?.username || "-"}</Table.Td>
            {/* Date Ranked */}
            <Table.Td>
                {bm.rankedDate instanceof Date ? bm.rankedDate.toLocaleDateString() : bm.rankedDate || "-"}
            </Table.Td>
            {/* Notes Input */}
            <Table.Td>
                <TextInput
                    value={bm.notes || ""}
                    onChange={(e) => handleEdit(idx, "notes", e.currentTarget.value)}
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
                <Group align="flex-end" gap="md">
                    <Select
                        label="Assigned User"
                        data={staffOptions}
                        value={assignedUser}
                        onChange={(val) => {
                            setAssignedUser(val!);
                            handleEdit(-1, "assignedUser", val);
                        }}
                        style={{ maxWidth: 220 }}
                    />
                    <TextInput
                        label="Theme"
                        value={theme}
                        onChange={(e) => {
                            setTheme(e.currentTarget.value);
                            handleEdit(-1, "theme", e.currentTarget.value);
                        }}
                        style={{ minWidth: 300 }}
                    />
                </Group>
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
                        <Table.Tbody>{beatmaps.map((bm, idx) => renderRow(bm, idx))}</Table.Tbody>
                    </Table>
                </ScrollArea>
            </Card>
        </Stack>
    );
}
