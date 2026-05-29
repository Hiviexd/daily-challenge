import { Popover, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IModDefinition } from "@interfaces/Mod";
import { ModDefaultSettings, ModSettingValue } from "@interfaces/Settings";
import { OsuGameMode } from "@interfaces/OsuApi";
import { getModSettingsLines } from "@utils/mods";

interface ModHoverPopoverProps {
    mod: IModDefinition;
    ruleset: OsuGameMode;
    defaultSettings?: ModDefaultSettings;
    settings?: Record<string, ModSettingValue>;
    children: React.ReactNode;
    zIndex?: number;
}

export default function ModHoverPopover({
    mod,
    ruleset,
    defaultSettings,
    settings,
    children,
    zIndex = 300,
}: ModHoverPopoverProps) {
    const [opened, { open, close }] = useDisclosure(false);
    const settingsLines = getModSettingsLines(mod, ruleset, defaultSettings, settings);

    return (
        <Popover position="top" withArrow shadow="md" opened={opened} zIndex={zIndex}>
            <Popover.Target>
                <span onMouseEnter={open} onMouseLeave={close} style={{ display: "block" }}>
                    {children}
                </span>
            </Popover.Target>
            <Popover.Dropdown onMouseEnter={open} onMouseLeave={close}>
                <Stack gap={4}>
                    <Text size="sm" fw={600}>
                        {mod.name}
                    </Text>
                    {settingsLines.map((line) => (
                        <Text key={line.label} size="xs">
                            <Text span fw={600}>
                                {line.label}:
                            </Text>{" "}
                            {line.value}
                        </Text>
                    ))}
                </Stack>
            </Popover.Dropdown>
        </Popover>
    );
}
