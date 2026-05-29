import { Modal, Stack, NumberInput, Switch, TextInput, Select, Group, Button, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { IModDefinition } from "@interfaces/Mod";
import { ModDefaultSettings, ModSettingValue } from "@interfaces/Settings";
import { OsuGameMode } from "@interfaces/OsuApi";
import { getModSettingsFormDefaults, modSettingAllowsNull, formatModSettingNumber } from "@utils/mods";

interface ModSettingsModalProps {
    opened: boolean;
    onClose: () => void;
    mod: IModDefinition | null;
    ruleset: OsuGameMode;
    defaultSettings?: ModDefaultSettings;
    initialSettings?: Record<string, ModSettingValue>;
    onApply: (settings: Record<string, ModSettingValue>) => void;
}

function formatNumberRange(min?: number, max?: number, precision?: number): string | undefined {
    const format = (value: number) => formatModSettingNumber(value, precision);
    if (min !== undefined && max !== undefined) return `Range: ${format(min)}–${format(max)}`;
    if (min !== undefined) return `Min: ${format(min)}`;
    if (max !== undefined) return `Max: ${format(max)}`;
    return undefined;
}

function buildSettingDescription(
    setting: IModDefinition["settings"][number],
    options?: { allowsNull?: boolean }
): string | undefined {
    const parts = [
        setting.description,
        formatNumberRange(setting.min, setting.max, setting.precision),
        options?.allowsNull ? "Leave empty for beatmap default." : "",
    ].filter(Boolean);
    return parts.length ? parts.join(" ") : undefined;
}

export default function ModSettingsModal({
    opened,
    onClose,
    mod,
    ruleset,
    defaultSettings,
    initialSettings,
    onApply,
}: ModSettingsModalProps) {
    const [values, setValues] = useState<Record<string, ModSettingValue>>({});

    useEffect(() => {
        if (!opened || !mod) return;
        setValues(getModSettingsFormDefaults(mod, ruleset, defaultSettings, initialSettings));
    }, [opened, mod, ruleset, defaultSettings, initialSettings]);

    const handleApply = () => {
        if (!mod) return;
        onApply(values);
        onClose();
    };

    return (
        <Modal
            opened={opened && !!mod}
            onClose={onClose}
            title={mod ? `Configure ${mod.name}` : "Configure mod"}
            size="md"
            zIndex={400}
            closeOnClickOutside
            withinPortal>
            {mod && (
                <Stack gap="md">
                    <Text size="sm" c="dimmed">
                        {mod.description}
                    </Text>
                    {mod.settings.map((setting) => {
                        if (setting.type === "boolean") {
                            return (
                                <Switch
                                    key={setting.name}
                                    label={setting.label}
                                    description={setting.description || undefined}
                                    checked={Boolean(values[setting.name])}
                                    onChange={(event) => {
                                        setValues((prev) => ({
                                            ...prev,
                                            [setting.name]: (event.target as HTMLInputElement).checked,
                                        }));
                                    }}
                                />
                            );
                        }

                        if (setting.type === "number") {
                            const numValue = values[setting.name];
                            const allowsNull = modSettingAllowsNull(setting);

                            return (
                                <NumberInput
                                    key={setting.name}
                                    label={setting.label}
                                    description={buildSettingDescription(setting, { allowsNull })}
                                    value={typeof numValue === "number" ? numValue : undefined}
                                    min={setting.min}
                                    max={setting.max}
                                    step={setting.precision}
                                    allowDecimal={setting.precision !== undefined && setting.precision < 1}
                                    onChange={(val) =>
                                        setValues((prev) => ({
                                            ...prev,
                                            [setting.name]: typeof val === "number" ? val : null,
                                        }))
                                    }
                                />
                            );
                        }

                        if (setting.options?.length) {
                            const strValue = values[setting.name];
                            return (
                                <Select
                                    key={setting.name}
                                    label={setting.label}
                                    description={buildSettingDescription(setting)}
                                    data={setting.options}
                                    value={typeof strValue === "string" ? strValue : null}
                                    styles={{
                                        dropdown: {
                                            zIndex: 400,
                                        },
                                    }}
                                    onChange={(val) =>
                                        setValues((prev) => ({
                                            ...prev,
                                            [setting.name]: val ?? setting.options?.[0] ?? "",
                                        }))
                                    }
                                />
                            );
                        }

                        const strValue = values[setting.name];
                        return (
                            <TextInput
                                key={setting.name}
                                label={setting.label}
                                description={setting.description || undefined}
                                value={typeof strValue === "string" ? strValue : ""}
                                onChange={(e) =>
                                    setValues((prev) => ({
                                        ...prev,
                                        [setting.name]: e.currentTarget.value || null,
                                    }))
                                }
                            />
                        );
                    })}
                    <Group justify="flex-end" gap="sm">
                        <Button variant="subtle" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={handleApply}>Apply</Button>
                    </Group>
                </Stack>
            )}
        </Modal>
    );
}
