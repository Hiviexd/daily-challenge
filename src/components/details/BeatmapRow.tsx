import { Table, TextInput, Image, Group, Anchor, Popover, Text, ActionIcon } from "@mantine/core";
import { IBeatmap } from "@interfaces/Beatmap";
import { useUpdateRoundBeatmapId, useUpdateRoundBeatmapNote } from "@hooks/useRounds";
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

    // Editing states
    const [isEditingBeatmapId, setIsEditingBeatmapId] = useState(false);
    const [isEditingNotes, setIsEditingNotes] = useState(false);

    // Sync state with prop changes if parent updates beatmap
    useEffect(() => {
        setBeatmapId(beatmap?.beatmapId === 0 || beatmap?.beatmapId == null ? "" : beatmap?.beatmapId?.toString());
        setNotes(beatmap?.notes || "");
    }, [beatmap?.beatmapId, beatmap?.notes]);

    const handleSaveBeatmapId = async () => {
        if (beatmap?.beatmapId === Number(beatmapId)) {
            setIsEditingBeatmapId(false);
            return;
        }

        await updateRoundBeatmapId.mutateAsync({
            index,
            beatmapId: beatmapId === "" ? "" : Number(beatmapId),
        });
        setIsEditingBeatmapId(false);
    };
    const handleSaveNotes = async () => {
        if (beatmap?.notes === notes) {
            setIsEditingNotes(false);
            return;
        }

        await updateRoundBeatmapNote.mutateAsync({
            index,
            notes,
        });
        setIsEditingNotes(false);
    };

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
                        <Text fw={500} c="danger" mb={4}>
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
                        <Text fw={500} c="warning" mb={4}>
                            Duplicate beatmapset in:
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
            <Table.Td style={{ width: 140, minWidth: 120, maxWidth: 180 }}>
                {isEditingBeatmapId ? (
                    <Group gap={4} wrap="nowrap">
                        <TextInput
                            value={beatmapId}
                            onChange={(e) => setBeatmapId(e.currentTarget.value)}
                            size="xs"
                            placeholder="..."
                            disabled={updateRoundBeatmapId.isPending}
                            style={{ maxWidth: 90 }}
                        />
                        <ActionIcon
                            color="green"
                            variant="light"
                            onClick={handleSaveBeatmapId}
                            loading={updateRoundBeatmapId.isPending}
                            size="sm">
                            <FontAwesomeIcon icon="floppy-disk" size="sm" />
                        </ActionIcon>
                    </Group>
                ) : (
                    <Group gap={4}>
                        <Text size="sm" fw={500}>
                            {beatmapId || ""}
                        </Text>
                        <ActionIcon color="blue" variant="subtle" onClick={() => setIsEditingBeatmapId(true)} size="sm">
                            <FontAwesomeIcon icon="pen-to-square" size="sm" />
                        </ActionIcon>
                    </Group>
                )}
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
                            {beatmap?.artist} - {beatmap?.title}
                        </Anchor>
                    </Group>
                ) : (
                    "-"
                )}
            </Table.Td>
            {/* Difficulty */}
            <Table.Td>{beatmap?.version}</Table.Td>
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
            <Table.Td>{beatmap?.rankedDate ? moment(beatmap?.rankedDate).format("DD MMM YYYY") : "-"}</Table.Td>
            {/* Notes Input */}
            <Table.Td style={{ width: 180, minWidth: 180, maxWidth: 220 }}>
                {isEditingNotes ? (
                    <Group gap={4} wrap="nowrap">
                        <TextInput
                            value={notes}
                            onChange={(e) => setNotes(e.currentTarget.value)}
                            size="xs"
                            placeholder="..."
                            disabled={
                                updateRoundBeatmapNote.isPending ||
                                beatmap?.beatmapId === 0 ||
                                beatmap?.beatmapId == null
                            }
                            style={{ maxWidth: 120 }}
                        />
                        <ActionIcon
                            color="green"
                            variant="light"
                            onClick={handleSaveNotes}
                            loading={updateRoundBeatmapNote.isPending}
                            size="sm">
                            <FontAwesomeIcon icon="floppy-disk" size="sm" />
                        </ActionIcon>
                    </Group>
                ) : (
                    <Group gap={4}>
                        <Text size="sm" fw={500}>
                            {notes || ""}
                        </Text>
                        <ActionIcon
                            color="blue"
                            variant="subtle"
                            onClick={() => setIsEditingNotes(true)}
                            size="sm"
                            disabled={beatmap?.beatmapId === 0 || beatmap?.beatmapId == null}>
                            <FontAwesomeIcon icon="pen-to-square" size="sm" />
                        </ActionIcon>
                    </Group>
                )}
            </Table.Td>
            {/* Duplicate Status */}
            <Table.Td style={{ textAlign: "center" }}>{duplicateStatus}</Table.Td>
        </Table.Tr>
    );
}
