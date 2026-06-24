import { Table, TextInput, Image, Group, Anchor, Text, ActionIcon, Skeleton, Tooltip } from "@mantine/core";
import { IBeatmap } from "@interfaces/Beatmap";
import { IBeatmapSlotMods } from "@interfaces/Mod";
import { useUpdateRoundBeatmapId, useUpdateRoundBeatmapMods, useUpdateRoundBeatmapNote, useSyncBeatmapMode } from "@hooks/useRounds";
import { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import UserLink from "@components/common/UserLink";
import { IWarning } from "@interfaces/Round";
import DuplicateStatusCell from "./DuplicateStatusCell";
import ModSelectorModal from "./ModSelectorModal";
import { loggedInUserAtom } from "@store/atoms";
import { useAtom } from "jotai";
import StarRatingBadge from "@components/common/StarRatingBadge";
import DateBadge from "@components/common/DateBadge";
import CopyActionIcon from "@components/common/CopyActionIcon";
import utils from "@utils/index";
import useSettings from "@hooks/useSettings";
import { buildAddBeatmapCommand, resolveBeatmapSlotRuleset } from "@utils/mods";
import { getGameModeLabel } from "@themes/modeConfig";
import SelectedModsDisplay from "./SelectedModsDisplay";
import useModCatalog from "@hooks/useModCatalog";
import { useDisclosure } from "@mantine/hooks";
import GameModeIcon from "@components/common/GameModeIcon";

interface IProps {
    beatmap: IBeatmap | null;
    slotMods?: IBeatmapSlotMods | null;
    index: number;
    roundId: string;
    isActiveRound: boolean;
    roundIsQueued?: boolean;
    warning?: IWarning;
    hasCheckedDuplicates: boolean;
    showSkeleton?: boolean;
    onImageLoad?: () => void;
}

export default function BeatmapRow({
    beatmap,
    slotMods,
    index,
    roundId,
    isActiveRound,
    roundIsQueued = false,
    warning,
    hasCheckedDuplicates,
    showSkeleton,
    onImageLoad,
}: IProps) {
    const updateRoundBeatmapId = useUpdateRoundBeatmapId(roundId);
    const updateRoundBeatmapNote = useUpdateRoundBeatmapNote(roundId);
    const updateRoundBeatmapMods = useUpdateRoundBeatmapMods(roundId);
    const syncBeatmapMode = useSyncBeatmapMode(roundId);
    const [loggedInUser] = useAtom(loggedInUserAtom);
    const [modModalOpen, { open: openModModal, close: closeModModal }] = useDisclosure(false);

    const [beatmapId, setBeatmapId] = useState(
        beatmap?.beatmapId === 0 || beatmap?.beatmapId == null ? "" : beatmap?.beatmapId?.toString()
    );
    const [notes, setNotes] = useState(beatmap?.notes || "");

    const [isEditingBeatmapId, setIsEditingBeatmapId] = useState(false);
    const [isEditingNotes, setIsEditingNotes] = useState(false);

    const { data: settings } = useSettings();

    const ruleset = resolveBeatmapSlotRuleset(slotMods, beatmap?.mode);
    const showModsToPublic = roundIsQueued || isActiveRound;
    const canViewMods = loggedInUser?.isStaff || showModsToPublic;
    const hasSelectedMods = !!slotMods?.selected.length;
    const { data: modCatalogData } = useModCatalog(canViewMods && hasSelectedMods);

    const copyCommandString = useMemo(() => {
        if (loggedInUser?.isAdmin) {
            return buildAddBeatmapCommand(beatmapId, ruleset, slotMods, settings?.mods);
        }
        return beatmapId;
    }, [beatmapId, loggedInUser?.isAdmin, settings?.mods, slotMods, ruleset]);

    const copyCommandTooltip = loggedInUser?.isAdmin
        ? `Copy default ${getGameModeLabel(ruleset)} command`
        : "Copy beatmap ID";

    const isCurrentDailyChallenge = isActiveRound && index === utils.getCurrentDayIndex();

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

    const handleSaveMods = async (mods: IBeatmapSlotMods) => {
        await updateRoundBeatmapMods.mutateAsync({ index, mods });
        closeModModal();
    };

    const handleCancelNotes = () => {
        setNotes(beatmap?.notes || "");
        setIsEditingNotes(false);
    };

    const handleCancelBeatmapId = () => {
        setBeatmapId(beatmap?.beatmapId === 0 || beatmap?.beatmapId == null ? "" : beatmap?.beatmapId?.toString());
        setIsEditingBeatmapId(false);
    };

    const handleSyncMode = async () => {
        await syncBeatmapMode.mutateAsync({ index });
    };

    const beatmapMissing = beatmap?.beatmapId === 0 || beatmap?.beatmapId == null;

    return (
        <>
            <Table.Tr key={index}>
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
                            {beatmapId && (
                                <CopyActionIcon
                                    value={copyCommandString}
                                    tooltip={copyCommandTooltip}
                                />
                            )}
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
                <Table.Td style={{ textAlign: "center", width: 100, minWidth: 100, maxWidth: 120 }}>
                    {typeof beatmap?.starRating === "number" ? <StarRatingBadge rating={beatmap?.starRating} /> : "-"}
                </Table.Td>
                <Table.Td style={{ textAlign: "center", width: 56, minWidth: 56, maxWidth: 64 }}>
                    {beatmapMissing ? (
                        "-"
                    ) : beatmap?.mode ? (
                        <div style={{ fontSize: 20, lineHeight: 1, display: "inline-flex", justifyContent: "center" }}>
                            <GameModeIcon mode={beatmap.mode} />
                        </div>
                    ) : loggedInUser?.isAdmin ? (
                        <Tooltip label="Sync game mode from osu!">
                            <ActionIcon
                                color="blue"
                                variant="subtle"
                                onClick={handleSyncMode}
                                loading={syncBeatmapMode.isPending}
                                size="sm"
                                aria-label="Sync game mode">
                                <FontAwesomeIcon icon="arrows-rotate" size="sm" />
                            </ActionIcon>
                        </Tooltip>
                    ) : (
                        "-"
                    )}
                </Table.Td>
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
                <Table.Td>{beatmap?.version || "-"}</Table.Td>
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
                <Table.Td style={{ width: 150, minWidth: 120, maxWidth: 150 }}>
                    {beatmap?.rankedDate ? <DateBadge date={beatmap?.rankedDate} /> : "-"}
                </Table.Td>
                <Table.Td style={{ width: 120, minWidth: 120, maxWidth: 180 }}>
                    {isEditingNotes ? (
                        <Group gap={4} wrap="nowrap">
                            <TextInput
                                value={notes}
                                onChange={(e) => setNotes(e.currentTarget.value)}
                                size="xs"
                                placeholder="..."
                                disabled={updateRoundBeatmapNote.isPending || beatmapMissing}
                                style={{ maxWidth: 100 }}
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
                                    disabled={beatmapMissing}>
                                    <FontAwesomeIcon icon="pen-to-square" size="sm" />
                                </ActionIcon>
                            )}
                        </Group>
                    )}
                </Table.Td>
                <Table.Td style={{ width: 140, minWidth: 140, maxWidth: 220 }}>
                    <Group gap={4} wrap="nowrap">
                        {canViewMods && slotMods && hasSelectedMods ? (
                            <SelectedModsDisplay
                                slotMods={slotMods}
                                catalog={modCatalogData?.catalog}
                                defaultSettings={modCatalogData?.defaultSettings}
                            />
                        ) : null}
                        {loggedInUser?.isStaff && (
                            <ActionIcon
                                color="blue"
                                variant="subtle"
                                onClick={openModModal}
                                size="sm"
                                disabled={beatmapMissing}
                                aria-label="Edit mods">
                                <FontAwesomeIcon icon="sliders" size="sm" />
                            </ActionIcon>
                        )}
                    </Group>
                </Table.Td>
                {loggedInUser?.isStaff && (
                    <Table.Td style={{ textAlign: "center" }}>
                        <DuplicateStatusCell warning={warning} hasCheckedDuplicates={hasCheckedDuplicates} />
                    </Table.Td>
                )}
            </Table.Tr>

            {loggedInUser?.isStaff && (
                <ModSelectorModal
                    opened={modModalOpen}
                    onClose={closeModModal}
                    initialMods={slotMods}
                    onSave={handleSaveMods}
                    isSaving={updateRoundBeatmapMods.isPending}
                />
            )}
        </>
    );
}
