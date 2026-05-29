import { OsuGameMode } from "@interfaces/OsuApi";
import { Group, Tooltip } from "@mantine/core";
import { getGameModeLabel } from "@themes/modeConfig";

interface Props {
    mode: OsuGameMode | OsuGameMode[];
    noTooltip?: boolean;
}

export default function GameModeIcon({ mode, noTooltip = false }: Props) {
    if (Array.isArray(mode)) {
        const orderedModes = [...mode].sort((a, b) => {
            const order: OsuGameMode[] = ["osu", "taiko", "fruits", "mania"];
            return order.indexOf(a) - order.indexOf(b);
        });

        return (
            <Group gap={0} wrap="nowrap">
                {orderedModes.map((m) =>
                    noTooltip ? (
                        <div key={m} className={`gamemode-icon ${m}`} />
                    ) : (
                        <Tooltip key={m} label={getGameModeLabel(m)}>
                            <div className={`gamemode-icon ${m}`} />
                        </Tooltip>
                    )
                )}
            </Group>
        );
    }

    return noTooltip ? (
        <div className={`gamemode-icon ${mode}`} />
    ) : (
        <Tooltip label={getGameModeLabel(mode)}>
            <div className={`gamemode-icon ${mode}`} />
        </Tooltip>
    );
}
