import { Stack, Text, Loader, Alert, Anchor } from "@mantine/core";
import { IconExternalLink } from "@tabler/icons-react";
import { useModsInfo } from "@hooks/useSettings";
import DateBadge from "@components/common/DateBadge";

export default function ModsInfoSettings() {
    const { data: modsInfo, isLoading, isError } = useModsInfo();

    return (
        <Stack gap="md">
            {isLoading && <Loader size="sm" />}
            {isError && <Alert color="red">Failed to load mods info.</Alert>}
            {modsInfo && (
                <>
                    <Text size="sm" c="dimmed">
                        Mod data is synced via the GitHub Actions workflow and committed to{" "}
                        <Text span ff="monospace">
                            mods/
                        </Text>
                        .
                    </Text>

                    <Stack gap="xs">
                        <Text size="sm">
                            <Text span fw={600}>
                                Mod catalog source:
                            </Text>{" "}
                            {modsInfo.modsCatalogSource}
                        </Text>
                        <Text size="sm">
                            <Text span fw={600}>
                                Default settings generated:
                            </Text>{" "}
                            {modsInfo.defaultSettingsGeneratedAt ? (
                                <DateBadge date={new Date(modsInfo.defaultSettingsGeneratedAt)} size="sm" />
                            ) : (
                                "Unknown"
                            )}
                        </Text>
                    </Stack>

                    {modsInfo.workflowUrl ? (
                        <Anchor href={modsInfo.workflowUrl} target="_blank" rel="noopener noreferrer" size="sm">
                            Open Sync Mods workflow
                            <IconExternalLink size={14} style={{ marginLeft: 4, verticalAlign: "middle" }} />
                        </Anchor>
                    ) : (
                        <Text size="sm" c="dimmed">
                            Configure{" "}
                            <Text span ff="monospace">
                                githubRepo
                            </Text>{" "}
                            in config.json to link the sync workflow.
                        </Text>
                    )}
                </>
            )}
        </Stack>
    );
}
