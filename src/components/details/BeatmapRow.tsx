import { Table, TextInput, Image, Group, Loader, Anchor, Popover, Text, ActionIcon } from "@mantine/core";
import { IBeatmap } from "@interfaces/Beatmap";
import { useUpdateRoundBeatmapId, useUpdateRoundBeatmapNote } from "@hooks/useRounds";
import { useDebouncedValue } from "@mantine/hooks";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import UserLink from "@components/common/UserLink";
import { IWarning } from "@interfaces/Round";

interface IProps {
    beatmap: IBeatmap | null;
    index: number;
    roundId: string;
    warning?: IWarning;
    hasCheckedDuplicates: boolean;
}

export default function BeatmapRow({ beatmap, index, roundId, warning, hasCheckedDuplicates }: IProps) {
    const updateRoundBeatmapId = useUpdateRoundBeatmapId(roundId);
    const updateRoundBeatmapNote = useUpdateRoundBeatmapNote(roundId);

    const [beatmapId, setBeatmapId] = useState(
        beatmap?.beatmapId === 0 || beatmap?.beatmapId == null ? "" : beatmap?.beatmapId?.toString()
    );
    const [notes, setNotes] = useState(beatmap?.notes || "");

    const [debouncedBeatmapId] = useDebouncedValue(beatmapId, 500);
    const [debouncedNotes] = useDebouncedValue(notes, 500);

    // Auto-save beatmapId
    useEffect(() => {
        const original = beatmap?.beatmapId === 0 || beatmap?.beatmapId == null ? "" : beatmap?.beatmapId?.toString();
        if (debouncedBeatmapId === "" && original !== "") {
            // Delete beatmap from round
            updateRoundBeatmapId.mutateAsync({
                index,
                beatmapId: "",
            });
        } else if (debouncedBeatmapId !== "" && debouncedBeatmapId !== original) {
            updateRoundBeatmapId.mutateAsync({
                index,
                beatmapId: Number(debouncedBeatmapId),
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedBeatmapId]);

    // Auto-save notes
    useEffect(() => {
        const original = beatmap?.notes || "";
        if (debouncedNotes !== original) {
            updateRoundBeatmapNote.mutateAsync({
                index,
                notes: debouncedNotes,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedNotes]);

    // Sync state with prop changes if parent updates beatmap
    useEffect(() => {
        setBeatmapId(beatmap?.beatmapId === 0 || beatmap?.beatmapId == null ? "" : beatmap?.beatmapId?.toString());
        setNotes(beatmap?.notes || "");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [beatmap?.beatmapId, beatmap?.notes]);

    // Duplicate status cell
    let duplicateStatus;
    if (!hasCheckedDuplicates) {
        duplicateStatus = <FontAwesomeIcon icon="question-circle" color="var(--mantine-color-gray-6)" />;
    } else if (warning) {
        if (warning.type === "duplicate_difficulty") {
            duplicateStatus = (
                <Popover width={260} position="bottom" withArrow shadow="md">
                    <Popover.Target>
                        <ActionIcon color="red" variant="subtle">
                            <FontAwesomeIcon icon="times-circle" color="var(--mantine-color-red-6)" />
                        </ActionIcon>
                    </Popover.Target>
                    <Popover.Dropdown>
                        <Text fw={500} color="red" mb={4}>
                            Duplicate difficulty in:
                        </Text>
                        {warning.duplicates.map((title, i) => (
                            <Text key={i} size="sm">
                                {title}
                            </Text>
                        ))}
                    </Popover.Dropdown>
                </Popover>
            );
        } else if (warning.type === "duplicate_set") {
            duplicateStatus = (
                <Popover width={260} position="bottom" withArrow shadow="md">
                    <Popover.Target>
                        <ActionIcon color="yellow" variant="subtle">
                            <FontAwesomeIcon icon="exclamation-triangle" color="var(--mantine-color-warning-6)" />
                        </ActionIcon>
                    </Popover.Target>
                    <Popover.Dropdown>
                        <Text fw={500} color="yellow.7" mb={4}>
                            Duplicate set in:
                        </Text>
                        {warning.duplicates.map((title, i) => (
                            <Text key={i} size="sm">
                                {title}
                            </Text>
                        ))}
                    </Popover.Dropdown>
                </Popover>
            );
        }
    } else {
        duplicateStatus = <FontAwesomeIcon icon="check-circle" color="var(--mantine-color-success-6)" />;
    }

    return (
        <Table.Tr key={index}>
            {/* Beatmap ID Input (for empty rows, this is how you add a beatmap) */}
            <Table.Td style={{ width: 120 }}>
                <TextInput
                    value={beatmapId}
                    onChange={(e) => setBeatmapId(e.currentTarget.value)}
                    rightSection={updateRoundBeatmapId.isPending && <Loader size={16} />}
                    size="xs"
                    placeholder="..."
                />
            </Table.Td>
            {/* Star Rating */}
            <Table.Td style={{ textAlign: "center" }}>
                {typeof beatmap?.starRating === "number" ? `★ ${beatmap?.starRating}` : "-"}
            </Table.Td>
            {/* Artist - Title with Banner */}
            <Table.Td>
                {beatmap?.artist ? (
                    <Group gap="sm" wrap="nowrap">
                        <Image src={beatmap.cover} width={48} height={32} radius="sm" alt="cover" />
                        <Anchor
                            fw={500}
                            size="sm"
                            href={`https://osu.ppy.sh/beatmapsets/${beatmap?.beatmapsetId}`}
                            target="_blank">
                            {beatmap?.artist} - {beatmap?.title} [{beatmap?.version}]
                        </Anchor>
                    </Group>
                ) : (
                    "-"
                )}
            </Table.Td>
            {/* Mapper */}
            <Table.Td>
                {beatmap?.creator?.osuId ? (
                    <UserLink
                        size="sm"
                        fw={500}
                        osuId={beatmap?.creator?.osuId}
                        username={beatmap?.creator?.username}
                    />
                ) : (
                    "-"
                )}
            </Table.Td>
            {/* Date Ranked */}
            <Table.Td>{beatmap?.rankedDate ? moment(beatmap?.rankedDate).format("YYYY-MM-DD") : "-"}</Table.Td>
            {/* Notes Input */}
            <Table.Td style={{ width: 150, minWidth: 150, maxWidth: 200 }}>
                <TextInput
                    value={notes}
                    onChange={(e) => setNotes(e.currentTarget.value)}
                    rightSection={updateRoundBeatmapNote.isPending && <Loader size={16} />}
                    size="xs"
                    placeholder="..."
                    disabled={beatmap?.beatmapId === 0 || beatmap?.beatmapId == null}
                />
            </Table.Td>
            {/* Duplicate Status */}
            <Table.Td style={{ textAlign: "center" }}>{duplicateStatus}</Table.Td>
        </Table.Tr>
    );
}
