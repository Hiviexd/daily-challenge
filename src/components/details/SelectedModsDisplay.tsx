import { Group } from "@mantine/core";
import ModBadge from "@components/common/ModBadge";
import ModHoverPopover from "@components/common/ModHoverPopover";
import { IBeatmapSlotMods, ISelectedMod, ModsCatalog } from "@interfaces/Mod";
import { ModDefaultSettings } from "@interfaces/Settings";
import { getModBadgeColor, getModDefinition, hasCustomModSettings } from "@utils/mods";

interface SelectedModBadgeProps {
    selectedMod: ISelectedMod;
    ruleset: IBeatmapSlotMods["ruleset"];
    catalog?: ModsCatalog;
    defaultSettings?: ModDefaultSettings;
}

function SelectedModBadge({ selectedMod, ruleset, catalog, defaultSettings }: SelectedModBadgeProps) {
    const modDef = catalog ? getModDefinition(catalog, ruleset, selectedMod.acronym) : undefined;
    const hasCustomSettings = modDef
        ? hasCustomModSettings(modDef, ruleset, defaultSettings, selectedMod.settings)
        : false;

    const badge = (
        <ModBadge
            acronym={selectedMod.acronym}
            color={getModBadgeColor(modDef)}
            size="sm"
            selected
            showSettingsIndicator={hasCustomSettings}
        />
    );

    if (!modDef) {
        return badge;
    }

    return (
        <ModHoverPopover
            mod={modDef}
            ruleset={ruleset}
            defaultSettings={defaultSettings}
            settings={selectedMod.settings}>
            <span style={{ display: "inline-flex", cursor: "default" }}>{badge}</span>
        </ModHoverPopover>
    );
}

interface SelectedModsDisplayProps {
    slotMods: IBeatmapSlotMods;
    catalog?: ModsCatalog;
    defaultSettings?: ModDefaultSettings;
}

export default function SelectedModsDisplay({ slotMods, catalog, defaultSettings }: SelectedModsDisplayProps) {
    if (!slotMods.selected.length) return null;

    return (
        <Group gap={6} wrap="wrap">
            {slotMods.selected.map((selectedMod) => (
                <SelectedModBadge
                    key={selectedMod.acronym}
                    selectedMod={selectedMod}
                    ruleset={slotMods.ruleset}
                    catalog={catalog}
                    defaultSettings={defaultSettings}
                />
            ))}
        </Group>
    );
}
