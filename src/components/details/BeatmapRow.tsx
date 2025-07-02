import { Table, TextInput, Image, Group, Anchor, Text, ActionIcon, Skeleton, Tooltip } from "@mantine/core";
import { IBeatmap } from "@interfaces/Beatmap";
import { useUpdateRoundBeatmapId, useUpdateRoundBeatmapNote } from "@hooks/useRounds";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import UserLink from "@components/common/UserLink";
import { IWarning } from "@interfaces/Round";
import DuplicateStatusCell from "./DuplicateStatusCell";
import { loggedInUserAtom } from "@store/atoms";
import { useAtom } from "jotai";
import StarRatingBadge from "@components/common/StarRatingBadge";
import DateBadge from "@components/common/DateBadge";
import CopyActionIcon from "@components/common/CopyActionIcon";
import utils from "@utils/index";

interface IProps {
    beatmap: IBeatmap | null;
    index: number;
    roundId: string;
    isActiveRound: boolean;
    warning?: IWarning;
    hasCheckedDuplicates: boolean;
    showSkeleton?: boolean;
    onImageLoad?: () => void;
}

export default function BeatmapRow({
    beatmap,
    index,
    roundId,
    isActiveRound,
    warning,
    hasCheckedDuplicates,
    showSkeleton,
    onImageLoad,
}: IProps) {
    const updateRoundBeatmapId = useUpdateRoundBeatmapId(roundId);
    const updateRoundBeatmapNote = useUpdateRoundBeatmapNote(roundId);
    const [loggedInUser] = useAtom(loggedInUserAtom);

    const [beatmapId, setBeatmapId] = useState(
        beatmap?.beatmapId === 0 || beatmap?.beatmapId == null ? "" : beatmap?.beatmapId?.toString()
    );
    const [notes, setNotes] = useState(beatmap?.notes || "");

    // Editing states
    const [isEditingBeatmapId, setIsEditingBeatmapId] = useState(false);
    const [isEditingNotes, setIsEditingNotes] = useState(false);

    // copy id string
    const copyIdString = loggedInUser?.isAdmin ? `add ${beatmapId}` : beatmapId;

    // Check if this is the current daily challenge (using UTC time, Thursday = 0)
    const isCurrentDailyChallenge = isActiveRound && index === utils.getCurrentDayIndex();

    // Sync state with prop changes if parent updates beatmap
    useEffect(() => {
        setBeatmapId(beatmap?.beatmapId === 0 || beatmap?.beatmapId == null ? "" : beatmap?.beatmapId?.toString());
        setNotes(beatmap?.notes || "");
        setIsEditingBeatmapId(false);
        setIsEditingNotes(false);
    }, [beatmap?.beatmapId, beatmap?.notes, beatmap?.cover]);

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

    const handleCancelNotes = () => {
        setNotes(beatmap?.notes || "");
        setIsEditingNotes(false);
    };

    const handleCancelBeatmapId = () => {
        setBeatmapId(beatmap?.beatmapId === 0 || beatmap?.beatmapId == null ? "" : beatmap?.beatmapId?.toString());
        setIsEditingBeatmapId(false);
    };

    return (
        <Table.Tr key={index}>
            {/* Beatmap ID Input (for empty rows, this is how you add a beatmap) */}
            <Table.Td style={{ width: loggedInUser?.isStaff ? 140 : 120, minWidth: 120, maxWidth: 180 }}>
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
                            variant="subtle"
                            onClick={handleSaveBeatmapId}
                            loading={updateRoundBeatmapId.isPending}
                            size="sm">
                            <FontAwesomeIcon icon="floppy-disk" size="sm" />
                        </ActionIcon>
                        <ActionIcon
                            color="red"
                            variant="subtle"
                            aria-label="Cancel Beatmap ID Edit"
                            onClick={handleCancelBeatmapId}
                            size="sm">
                            <FontAwesomeIcon icon="times" size="sm" />
                        </ActionIcon>
                    </Group>
                ) : (
                    <Group gap={4}>
                        {beatmapId && <CopyActionIcon value={copyIdString} />}
                        <Text size="sm" fw={500}>
                            {beatmapId || ""}
                        </Text>
                        {loggedInUser?.isStaff && (
                            <ActionIcon
                                color="blue"
                                variant="subtle"
                                onClick={() => setIsEditingBeatmapId(true)}
                                size="sm">
                                <FontAwesomeIcon icon="pen-to-square" size="sm" />
                            </ActionIcon>
                        )}
                    </Group>
                )}
            </Table.Td>
            {/* Star Rating */}
            <Table.Td style={{ textAlign: "center", width: 100, minWidth: 100, maxWidth: 120 }}>
                {typeof beatmap?.starRating === "number" ? <StarRatingBadge rating={beatmap?.starRating} /> : "-"}
            </Table.Td>
            {/* Banner */}
            <Table.Td>
                {beatmap?.artist && (
                    <div style={{ position: "relative", maxWidth: 120, width: "100%", height: 32, minWidth: 60 }}>
                        {showSkeleton && (
                            <Skeleton
                                width="100%"
                                height={32}
                                radius="sm"
                                style={{ position: "absolute", top: 0, left: 0 }}
                            />
                        )}
                        <Image
                            src={beatmap.cover}
                            radius="sm"
                            alt="cover"
                            style={{
                                display: showSkeleton ? "none" : "block",
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: 32,
                                objectFit: "cover",
                            }}
                            onLoad={onImageLoad}
                        />
                    </div>
                )}
            </Table.Td>
            {/* Artist - Title */}
            <Table.Td>
                {beatmap?.artist ? (
                    <Group gap="xs" wrap="nowrap">
                        {isCurrentDailyChallenge && (
                            <Tooltip label="Today's Daily Challenge">
                                <FontAwesomeIcon icon="star" size="sm" color="gold" />
                            </Tooltip>
                        )}
                        <Anchor
                            fw={500}
                            lineClamp={1}
                            size="sm"
                            href={`https://osu.ppy.sh/beatmaps/${beatmap?.beatmapId}`}
                            target="_blank">
                            {beatmap?.artist} - {beatmap?.title}
                        </Anchor>
                    </Group>
                ) : (
                    "-"
                )}
            </Table.Td>
            {/* Difficulty */}
            <Table.Td>{beatmap?.version || "-"}</Table.Td>
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
            <Table.Td style={{ width: 150, minWidth: 120, maxWidth: 150 }}>
                {beatmap?.rankedDate ? <DateBadge date={beatmap?.rankedDate} /> : "-"}
            </Table.Td>
            {/* Notes Input */}
            <Table.Td style={{ width: 140, minWidth: 140, maxWidth: 220 }}>
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
                            variant="subtle"
                            onClick={handleSaveNotes}
                            loading={updateRoundBeatmapNote.isPending}
                            size="sm">
                            <FontAwesomeIcon icon="floppy-disk" size="sm" />
                        </ActionIcon>
                        <ActionIcon
                            color="red"
                            variant="subtle"
                            aria-label="Cancel Notes Edit"
                            onClick={handleCancelNotes}
                            size="sm">
                            <FontAwesomeIcon icon="times" size="sm" />
                        </ActionIcon>
                    </Group>
                ) : (
                    <Group gap={4}>
                        <Text size="sm" fw={500}>
                            {notes || ""}
                        </Text>
                        {loggedInUser?.isStaff && (
                            <ActionIcon
                                color="blue"
                                variant="subtle"
                                onClick={() => setIsEditingNotes(true)}
                                size="sm"
                                disabled={beatmap?.beatmapId === 0 || beatmap?.beatmapId == null}>
                                <FontAwesomeIcon icon="pen-to-square" size="sm" />
                            </ActionIcon>
                        )}
                    </Group>
                )}
            </Table.Td>
            {/* Duplicate Status */}
            {loggedInUser?.isStaff && (
                <Table.Td style={{ textAlign: "center" }}>
                    <DuplicateStatusCell warning={warning} hasCheckedDuplicates={hasCheckedDuplicates} />
                </Table.Td>
            )}
        </Table.Tr>
    );
}
