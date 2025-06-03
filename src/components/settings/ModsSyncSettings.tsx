import { Button, Stack, Text, Loader, Alert } from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import useSettings, { useSyncMods } from "@hooks/useSettings";
import { OsuGameMode } from "@interfaces/OsuApi";
import DateBadge from "@components/common/DateBadge";

const GAME_MODE_LABELS: Record<OsuGameMode, string> = {
    osu: "osu!",
    taiko: "osu!taiko",
    fruits: "osu!catch",
    mania: "osu!mania",
};

export default function ModsSyncSettings() {
    const { data: settings, isLoading, isError } = useSettings();
    const syncModsMutation = useSyncMods();

    const handleSyncMods = async () => {
        await syncModsMutation.mutateAsync();
    };

    return (
        <Stack gap="xl">
            {isLoading && <Loader />}
            {isError && <Alert color="red">Failed to load settings.</Alert>}
            {settings?.mods && (
                <Stack gap="sm">
                    {Object.entries(settings.mods).map(([mode, mods]) => (
                        <div key={mode}>
                            <Text fw={600} size="md" mb={4}>
                                {GAME_MODE_LABELS[mode as OsuGameMode] || mode}
                            </Text>
                            <Text size="sm" c="dimmed" style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                                {(mods as string[]).length > 0 ? (mods as string[]).join(",") : "No mods available."}
                            </Text>
                        </div>
                    ))}
                </Stack>
            )}
            <Text size="sm" c="dimmed">
                Last updated: {settings?.modsUpdatedAt ? <DateBadge date={settings.modsUpdatedAt} size="sm" /> : "Never"}
            </Text>
            <Button
                leftSection={<IconRefresh size={18} />}
                onClick={handleSyncMods}
                loading={syncModsMutation.isPending}
                variant="light"
                color="blue">
                Sync Mods
            </Button>
        </Stack>
    );
}
