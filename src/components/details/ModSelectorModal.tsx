import {
    Modal,
    Text,
    TextInput,
    Group,
    Button,
    UnstyledButton,
    FloatingIndicator,
    Tooltip,
    Loader,
    Center,
} from "@mantine/core";
import { useEffect, useMemo, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { OsuGameMode } from "@interfaces/OsuApi";
import { IBeatmapSlotMods, IModDefinition, ISelectedMod, ModType } from "@interfaces/Mod";
import { ModSettingValue } from "@interfaces/Settings";
import useModCatalog from "@hooks/useModCatalog";
import ModSettingsModal from "./ModSettingsModal";
import { MODE_LABELS } from "@themes/modeConfig";
import GameModeIcon from "@components/common/GameModeIcon";
import ModBadge from "@components/common/ModBadge";
import ModHoverPopover from "@components/common/ModHoverPopover";
import {
    getDefaultBeatmapSlotMods,
    getDisabledModAcronyms,
    getModBadgeColor,
    hasCustomModSettings,
    modHasSettings,
    MOD_TYPE_COLORS,
    MOD_TYPE_LABELS,
    MOD_TYPES,
    OSU_GAME_MODES,
} from "@utils/mods";
import "@sass/ModSelectorModal.scss";

interface ModSelectorModalProps {
    opened: boolean;
    onClose: () => void;
    initialMods?: IBeatmapSlotMods | null;
    onSave: (mods: IBeatmapSlotMods) => void;
    isSaving?: boolean;
}

export default function ModSelectorModal({
    opened,
    onClose,
    initialMods,
    onSave,
    isSaving = false,
}: ModSelectorModalProps) {
    const { data: modCatalogData, isLoading, isError } = useModCatalog(opened);
    const catalog = modCatalogData?.catalog;
    const defaultSettings = modCatalogData?.defaultSettings;
    const [draft, setDraft] = useState<IBeatmapSlotMods>(getDefaultBeatmapSlotMods());
    const [search, setSearch] = useState("");
    const [settingsMod, setSettingsMod] = useState<IModDefinition | null>(null);
    const [settingsInitial, setSettingsInitial] = useState<Record<string, ModSettingValue> | undefined>();

    const [rootRef, setRootRef] = useState<HTMLDivElement | null>(null);
    const [controlsRefs, setControlsRefs] = useState<Partial<Record<OsuGameMode, HTMLButtonElement | null>>>({});

    const controlRefCallbacks = useRef<Partial<Record<OsuGameMode, (node: HTMLButtonElement | null) => void>>>({});
    const prevOpenedRef = useRef(false);

    if (Object.keys(controlRefCallbacks.current).length === 0) {
        for (const mode of OSU_GAME_MODES) {
            controlRefCallbacks.current[mode] = (node) => {
                setControlsRefs((prev) => (prev[mode] === node ? prev : { ...prev, [mode]: node }));
            };
        }
    }

    useEffect(() => {
        if (opened && !prevOpenedRef.current) {
            setDraft(initialMods ?? getDefaultBeatmapSlotMods());
            setSearch("");
            setSettingsMod(null);
        }
        prevOpenedRef.current = opened;
    }, [opened, initialMods]);

    const rulesetCatalog = useMemo(() => catalog?.[draft.ruleset] ?? [], [catalog, draft.ruleset]);

    const disabledAcronyms = useMemo(
        () => getDisabledModAcronyms(draft.selected, rulesetCatalog),
        [draft.selected, rulesetCatalog],
    );

    const filteredCatalog = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return rulesetCatalog;
        return rulesetCatalog.filter(
            (mod) =>
                mod.name.toLowerCase().includes(query) ||
                mod.acronym.toLowerCase().includes(query) ||
                mod.description.toLowerCase().includes(query),
        );
    }, [rulesetCatalog, search]);

    const modsByType = useMemo(() => {
        const grouped = Object.fromEntries(MOD_TYPES.map((type) => [type, [] as IModDefinition[]])) as Record<
            ModType,
            IModDefinition[]
        >;
        for (const mod of filteredCatalog) {
            grouped[mod.type].push(mod);
        }
        return grouped;
    }, [filteredCatalog]);

    const isSelected = (acronym: string) => draft.selected.some((mod) => mod.acronym === acronym);

    const handleRulesetChange = (ruleset: OsuGameMode) => {
        if (ruleset === draft.ruleset) return;
        setDraft({ ruleset, selected: [] });
    };

    const toggleMod = (mod: IModDefinition) => {
        if (disabledAcronyms.has(mod.acronym) && !isSelected(mod.acronym)) return;

        if (isSelected(mod.acronym)) {
            setDraft((prev) => ({
                ...prev,
                selected: prev.selected.filter((sel) => sel.acronym !== mod.acronym),
            }));
            return;
        }

        if (modHasSettings(mod)) {
            const existing = draft.selected.find((sel) => sel.acronym === mod.acronym);
            setSettingsInitial(existing?.settings);
            setSettingsMod(mod);
            return;
        }

        setDraft((prev) => ({
            ...prev,
            selected: [...prev.selected, { acronym: mod.acronym }],
        }));
    };

    const handleSettingsApply = (settings: Record<string, ModSettingValue>) => {
        if (!settingsMod) return;
        setDraft((prev) => {
            const without = prev.selected.filter((sel) => sel.acronym !== settingsMod.acronym);
            const entry: ISelectedMod = { acronym: settingsMod.acronym, settings };
            return { ...prev, selected: [...without, entry] };
        });
        setSettingsMod(null);
    };

    const handleSave = () => {
        onSave(draft);
    };

    const getIncompatibilityReason = (mod: IModDefinition): string | null => {
        if (!disabledAcronyms.has(mod.acronym)) return null;
        const conflicting = draft.selected.find(
            (sel) =>
                mod.incompatibleMods.includes(sel.acronym) ||
                rulesetCatalog.find((m) => m.acronym === sel.acronym)?.incompatibleMods.includes(mod.acronym),
        );
        if (conflicting) {
            return `Incompatible with ${conflicting.acronym}`;
        }
        return "Incompatible with current selection";
    };

    return (
        <>
            <Modal
                opened={opened}
                onClose={onClose}
                title="Mod Select"
                size="100%"
                closeOnClickOutside={!settingsMod}
                styles={{
                    body: {
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                    },
                }}>
                <div className="modSelectorRoot">
                    <div className="modSelectorScroll">
                        <Text size="sm" c="dimmed">
                            Select mods to force on this beatmap.
                        </Text>

                        <Group justify="space-between" align="center" wrap="wrap">
                            <div className="modeSelector" ref={setRootRef}>
                                {OSU_GAME_MODES.map((mode) => (
                                    <UnstyledButton
                                        key={mode}
                                        className="modeButton"
                                        onClick={() => handleRulesetChange(mode)}
                                        ref={controlRefCallbacks.current[mode]}
                                        aria-label={MODE_LABELS[mode]}
                                        title={MODE_LABELS[mode]}
                                        style={{ fontSize: 22 }}>
                                        <GameModeIcon mode={mode} noTooltip />
                                    </UnstyledButton>
                                ))}
                                <FloatingIndicator
                                    target={controlsRefs[draft.ruleset] ?? null}
                                    parent={rootRef}
                                    className="modeIndicator"
                                />
                            </div>

                            <TextInput
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.currentTarget.value)}
                                leftSection={<FontAwesomeIcon icon="search" size="sm" />}
                                style={{ flex: 1, maxWidth: 280 }}
                            />
                        </Group>

                        {isLoading ? (
                            <Center py="xl">
                                <Loader size="sm" />
                            </Center>
                        ) : isError || !catalog ? (
                            <Center py="xl">
                                <Text size="sm" c="danger">
                                    Failed to load mod catalog. Try refreshing the page.
                                </Text>
                            </Center>
                        ) : (
                            <div className="columns">
                                {MOD_TYPES.map((type) => (
                                    <div key={type} className="column">
                                        <div
                                            className="columnHeader"
                                            style={{
                                                background: `var(--mantine-color-${MOD_TYPE_COLORS[type]}-6)`,
                                            }}>
                                            <span className="columnHeaderText">{MOD_TYPE_LABELS[type]}</span>
                                        </div>
                                        <div className="columnList">
                                            {modsByType[type].map((mod) => {
                                                const selected = isSelected(mod.acronym);
                                                const disabled = !selected && disabledAcronyms.has(mod.acronym);
                                                const incompatibilityReason = getIncompatibilityReason(mod);
                                                const color = MOD_TYPE_COLORS[type];

                                                const selectedStyle = selected
                                                    ? { background: `var(--mantine-color-${color}-7)` }
                                                    : undefined;

                                                const selectedEntry = draft.selected.find(
                                                    (sel) => sel.acronym === mod.acronym,
                                                );
                                                const showSettingsIndicator =
                                                    selected &&
                                                    hasCustomModSettings(
                                                        mod,
                                                        draft.ruleset,
                                                        defaultSettings,
                                                        selectedEntry?.settings,
                                                    );

                                                let modButton = (
                                                    <button
                                                        key={mod.acronym}
                                                        type="button"
                                                        className={`modButton ${selected ? "modButtonSelected" : "modButtonIdle"}`}
                                                        data-mod-color={color}
                                                        style={selectedStyle}
                                                        disabled={disabled}
                                                        onClick={() => toggleMod(mod)}>
                                                        <ModBadge
                                                            acronym={mod.acronym}
                                                            color={getModBadgeColor(mod)}
                                                            selected={selected}
                                                            darkWhenSelected
                                                            showSettingsIndicator={showSettingsIndicator}
                                                        />
                                                        <span className="modContent">
                                                            <span className="modName">{mod.name}</span>
                                                            <span className="modDescription">{mod.description}</span>
                                                        </span>
                                                    </button>
                                                );

                                                if (selected) {
                                                    modButton = (
                                                        <ModHoverPopover
                                                            key={mod.acronym}
                                                            mod={mod}
                                                            ruleset={draft.ruleset}
                                                            defaultSettings={defaultSettings}
                                                            settings={selectedEntry?.settings}
                                                            zIndex={350}>
                                                            {modButton}
                                                        </ModHoverPopover>
                                                    );
                                                }

                                                if (disabled && incompatibilityReason) {
                                                    return (
                                                        <Tooltip key={mod.acronym} label={incompatibilityReason}>
                                                            <span style={{ display: "block" }}>{modButton}</span>
                                                        </Tooltip>
                                                    );
                                                }

                                                return modButton;
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="modSelectorFooter">
                        <Button variant="subtle" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} loading={isSaving}>
                            Save
                        </Button>
                    </div>
                </div>
            </Modal>

            <ModSettingsModal
                opened={!!settingsMod}
                onClose={() => setSettingsMod(null)}
                mod={settingsMod}
                ruleset={draft.ruleset}
                defaultSettings={defaultSettings}
                initialSettings={settingsInitial}
                onApply={handleSettingsApply}
            />
        </>
    );
}
