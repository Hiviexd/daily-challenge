import {
    Box,
    TextInput,
    Group,
    Anchor,
    Text,
    ActionIcon,
    Tooltip,
    Stack,
    Divider,
} from "@mantine/core";
import { IBeatmap } from "@interfaces/Beatmap";
import { IBeatmapSlotMods } from "@interfaces/Mod";
import {
    useUpdateRoundBeatmapId,
    useUpdateRoundBeatmapMods,
    useUpdateRoundBeatmapNote,
    useSyncBeatmapMode,
} from "@hooks/useRounds";
import { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import UserLink from "@components/common/UserLink";
import { IWarning } from "@interfaces/Round";
import DuplicateStatusCell from "../DuplicateStatusCell";
import ModSelectorModal from "../ModSelectorModal";
import { loggedInUserAtom } from "@store/atoms";
import { useAtom } from "jotai";
import StarRatingBadge from "@components/common/StarRatingBadge";
import DateBadge from "@components/common/DateBadge";
import CopyActionIcon from "@components/common/CopyActionIcon";
import utils from "@utils/index";
import useSettings from "@hooks/useSettings";
import { buildAddBeatmapCommand, resolveBeatmapSlotRuleset } from "@utils/mods";
import { getGameModeLabel } from "@themes/modeConfig";
import SelectedModsDisplay from "../SelectedModsDisplay";
import useModCatalog from "@hooks/useModCatalog";
import { useDisclosure } from "@mantine/hooks";
import GameModeIcon from "@components/common/GameModeIcon";
import BeatmapRowBackground from "./BeatmapRowBackground";
import BeatmapRowDayRail from "./BeatmapRowDayRail";
import { LOADED_ROW_MIN_HEIGHT } from "./constants";

interface IProps {
    beatmap: IBeatmap | null;
    slotMods?: IBeatmapSlotMods | null;
    index: number;
    roundId: string;
    startDate: Date;
    isActiveRound: boolean;
    roundIsQueued?: boolean;
    warning?: IWarning;
    hasCheckedDuplicates: boolean;
    isLast?: boolean;
}

export default function BeatmapRow({
    beatmap,
    slotMods,
    index,
    roundId,
    startDate,
    isActiveRound,
    roundIsQueued = false,
    warning,
    hasCheckedDuplicates,
    isLast = false,
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
    const dayLabel = utils.getBeatmapSlotDayLabel(startDate, index);
    const slotDateLabel = utils.getBeatmapSlotShortDate(startDate, index);
    const slotDate = utils.getBeatmapSlotDate(startDate, index);

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
    const hasBeatmap = !!beatmap?.artist;
    const hasNotes = !!notes.trim();

    const renderBeatmapId = () => {
        if (isEditingBeatmapId) {
            return (
                <Group gap={4} wrap="nowrap">
                    <TextInput
                        value={beatmapId}
                        onChange={(e) => setBeatmapId(e.currentTarget.value)}
                        size="xs"
                        placeholder="Beatmap ID"
                        disabled={updateRoundBeatmapId.isPending}
                        style={{ width: 100 }}
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
            );
        }

        return (
            <Group gap={4} wrap="nowrap">
                {beatmapId ? (
                    <>
                        <CopyActionIcon value={copyCommandString} tooltip={copyCommandTooltip} />
                        <Tooltip label={`Beatmap ID: ${beatmapId}`}>
                            <Text size="xs" c="dimmed" ff="monospace">
                                #{beatmapId}
                            </Text>
                        </Tooltip>
                    </>
                ) : (
                    <Text size="xs" c="dimmed">
                        No beatmap
                    </Text>
                )}
                {loggedInUser?.isStaff && (
                    <ActionIcon
                        color="blue"
                        variant="subtle"
                        onClick={() => setIsEditingBeatmapId(true)}
                        size="sm"
                        aria-label="Edit beatmap ID">
                        <FontAwesomeIcon icon="pen-to-square" size="sm" />
                    </ActionIcon>
                )}
            </Group>
        );
    };

    const renderNotes = () => {
        if (isEditingNotes) {
            return (
                <Group gap={4} wrap="nowrap" align="flex-start">
                    <TextInput
                        value={notes}
                        onChange={(e) => setNotes(e.currentTarget.value)}
                        size="xs"
                        placeholder="Add notes..."
                        disabled={updateRoundBeatmapNote.isPending || beatmapMissing}
                        style={{ flex: 1 }}
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
            );
        }

        if (!hasNotes) return null;

        return (
            <Text size="xs" c="dimmed" fs="italic" lineClamp={2}>
                {notes}
            </Text>
        );
    };

    const renderMode = () => {
        if (beatmapMissing) return null;

        if (beatmap?.mode) {
            return (
                <Box component="span" style={{ fontSize: 14, lineHeight: 1, display: "inline-flex" }}>
                    <GameModeIcon mode={beatmap.mode} />
                </Box>
            );
        }

        if (loggedInUser?.isAdmin) {
            return (
                <Tooltip label="Sync game mode from osu!">
                    <ActionIcon
                        color="blue"
                        variant="subtle"
                        onClick={handleSyncMode}
                        loading={syncBeatmapMode.isPending}
                        size="xs"
                        aria-label="Sync game mode">
                        <FontAwesomeIcon icon="arrows-rotate" size="xs" />
                    </ActionIcon>
                </Tooltip>
            );
        }

        return null;
    };

    const renderModeAndDifficulty = () => {
        const mode = renderMode();
        const hasVersion = !!beatmap?.version;

        if (!mode && !hasVersion) return null;

        return (
            <Group gap={4} wrap="nowrap" align="center">
                {mode}
                {hasVersion && (
                    <Text fz={11} fw={500} lh={1.2}>
                        [{beatmap.version}]
                    </Text>
                )}
            </Group>
        );
    };

    const modeAndDifficulty = renderModeAndDifficulty();
    const hasMetaPrefix = !!modeAndDifficulty;

    return (
        <>
            <Box
                pos="relative"
                py={hasBeatmap ? 8 : "xs"}
                px="md"
                mih={hasBeatmap ? LOADED_ROW_MIN_HEIGHT : undefined}
                style={{
                    overflow: "hidden",
                    borderLeft: isCurrentDailyChallenge
                        ? "3px solid var(--mantine-color-yellow-5)"
                        : "3px solid transparent",
                    backgroundColor: hasBeatmap
                        ? undefined
                        : isCurrentDailyChallenge
                            ? "rgba(255, 215, 0, 0.04)"
                            : "var(--mantine-color-dark-7)",
                }}>
                {hasBeatmap && beatmap.cover && (
                    <BeatmapRowBackground
                        cover={beatmap.cover}
                        isCurrentDailyChallenge={isCurrentDailyChallenge}
                    />
                )}

                <Group align="center" wrap="nowrap" gap="sm" pos="relative" style={{ zIndex: 2 }}>
                    <BeatmapRowDayRail
                        dayLabel={dayLabel}
                        dayOfMonth={slotDate.getUTCDate()}
                        slotDateLabel={slotDateLabel}
                        isCurrentDailyChallenge={isCurrentDailyChallenge}
                    />

                    <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                        <Group gap="xs" wrap="wrap" align="center" justify="space-between">
                            {hasBeatmap ? (
                                <Anchor
                                    fw={600}
                                    lineClamp={2}
                                    size="sm"
                                    href={`https://osu.ppy.sh/beatmaps/${beatmap?.beatmapId}`}
                                    target="_blank"
                                    style={{
                                        flex: "1 1 12rem",
                                        minWidth: 0,
                                        wordBreak: "break-word",
                                        lineHeight: 1.3,
                                    }}>
                                    {beatmap?.artist} - {beatmap?.title}
                                </Anchor>
                            ) : (
                                <Text size="sm" c="dimmed" fs="italic" style={{ flex: "1 1 12rem", minWidth: 0 }}>
                                    Empty slot
                                </Text>
                            )}

                            <Group gap={4} wrap="wrap" align="center" style={{ flexShrink: 0 }}>
                                {typeof beatmap?.starRating === "number" && (
                                    <StarRatingBadge rating={beatmap.starRating} />
                                )}
                                {canViewMods && slotMods && hasSelectedMods && (
                                    <SelectedModsDisplay
                                        slotMods={slotMods}
                                        catalog={modCatalogData?.catalog}
                                        defaultSettings={modCatalogData?.defaultSettings}
                                    />
                                )}
                                {loggedInUser?.isStaff && (
                                    <>
                                        <Tooltip label={hasNotes ? "Edit notes" : "Add notes"}>
                                            <ActionIcon
                                                color={isEditingNotes ? "yellow" : "blue"}
                                                variant={isEditingNotes ? "light" : "subtle"}
                                                onClick={() => setIsEditingNotes(true)}
                                                size="sm"
                                                disabled={beatmapMissing}
                                                aria-label={hasNotes ? "Edit notes" : "Add notes"}>
                                                <FontAwesomeIcon icon="note-sticky" size="sm" />
                                            </ActionIcon>
                                        </Tooltip>
                                        <Tooltip label="Edit mods">
                                            <ActionIcon
                                                color="blue"
                                                variant="subtle"
                                                onClick={openModModal}
                                                size="sm"
                                                disabled={beatmapMissing}
                                                aria-label="Edit mods">
                                                <FontAwesomeIcon icon="sliders" size="sm" />
                                            </ActionIcon>
                                        </Tooltip>
                                        <DuplicateStatusCell
                                            warning={warning}
                                            hasCheckedDuplicates={hasCheckedDuplicates}
                                        />
                                    </>
                                )}
                            </Group>
                        </Group>

                        <Group gap={6} wrap="wrap" align="center" justify="space-between">
                            <Group gap={6} wrap="wrap" align="center" style={{ flex: 1, minWidth: 0 }}>
                                {modeAndDifficulty}
                                {beatmap?.creator?.osuId && (
                                    <>
                                        {hasMetaPrefix && (
                                            <Text size="xs" c="dimmed">
                                                ·
                                            </Text>
                                        )}
                                        <UserLink
                                            size="xs"
                                            fw={500}
                                            osuId={beatmap.creator.osuId}
                                            username={beatmap.creator.username}
                                        />
                                    </>
                                )}
                                {beatmap?.rankedDate && (
                                    <>
                                        {(hasMetaPrefix || beatmap?.creator?.osuId) && (
                                            <Text size="xs" c="dimmed">
                                                ·
                                            </Text>
                                        )}
                                        <DateBadge date={beatmap.rankedDate} size="xs" />
                                    </>
                                )}
                            </Group>
                            <Group gap={4} wrap="nowrap" justify="flex-end" style={{ flexShrink: 0 }}>
                                {renderBeatmapId()}
                            </Group>
                        </Group>

                        {renderNotes()}
                    </Stack>
                </Group>
            </Box>
            {!isLast && <Divider />}

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
