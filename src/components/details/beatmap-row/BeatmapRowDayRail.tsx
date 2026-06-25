import { Stack, Text, Tooltip } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DAY_RAIL_WIDTH } from "./constants";

interface Props {
    dayLabel: string;
    dayOfMonth: number;
    slotDateLabel: string;
    isCurrentDailyChallenge: boolean;
}

export default function BeatmapRowDayRail({
    dayLabel,
    dayOfMonth,
    slotDateLabel,
    isCurrentDailyChallenge,
}: Props) {
    return (
        <Tooltip
            label={isCurrentDailyChallenge ? `Today's Daily Challenge · ${slotDateLabel}` : slotDateLabel}>
            <Stack
                gap={2}
                align="center"
                justify="center"
                w={DAY_RAIL_WIDTH}
                style={{ cursor: "default" }}>
                <Text fw={700} size="sm" lh={1}>
                    {dayLabel}
                </Text>
                <Text size="xs" c="dimmed" lh={1}>
                    {dayOfMonth}
                </Text>
                {isCurrentDailyChallenge && <FontAwesomeIcon icon="star" size="xs" color="gold" />}
            </Stack>
        </Tooltip>
    );
}
