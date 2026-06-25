import { Stack, Card, Group, Skeleton, Text, Divider, Box } from "@mantine/core";
import { LOADED_ROW_MIN_HEIGHT } from "./beatmap-row/constants";

export default function RoundDetailsSkeleton({ isStaff }: { isStaff: boolean }) {
    return (
        <Stack gap="md">
            <Card
                shadow="sm"
                p="md"
                bg="primary.11"
                radius="md"
                style={{ borderTop: "4px solid var(--mantine-color-primary-6)" }}>
                <Stack gap="md">
                    <Group gap="xs">
                        <Skeleton height={28} width={220} radius="sm" />
                        <Skeleton height={22} width={80} radius="sm" />
                        <Skeleton height={22} width={40} radius="sm" />
                    </Group>
                    <Group gap="xs">
                        <Text size="sm" fw={700}>
                            Theme:
                        </Text>
                        <Skeleton height={20} width={180} radius="sm" />
                    </Group>
                </Stack>
            </Card>
            <Card shadow="sm" p="md" bg="primary.11">
                <Group justify="space-between" mb="sm">
                    <Skeleton height={20} width={90} radius="sm" />
                    {isStaff && <Skeleton height={28} width={130} radius="sm" />}
                </Group>
                <Stack gap={0}>
                    {Array.from({ length: 7 }).map((_, idx) => (
                        <Box key={idx} pos="relative" mih={LOADED_ROW_MIN_HEIGHT} style={{ overflow: "hidden" }}>
                            <Skeleton pos="absolute" top={0} left={0} right={0} bottom={0} radius={0} />
                            <Group align="center" wrap="nowrap" gap="sm" py={8} px="md" pos="relative" style={{ zIndex: 1 }}>
                                <Stack gap={4} align="center" w={44}>
                                    <Skeleton height={14} width={28} radius="sm" />
                                    <Skeleton height={12} width={16} radius="sm" />
                                </Stack>
                                <Stack gap={6} style={{ flex: 1 }}>
                                    <Group justify="space-between">
                                        <Skeleton height={16} width="60%" radius="sm" />
                                        <Skeleton height={20} width={80} radius="sm" />
                                    </Group>
                                    <Skeleton height={14} width="45%" radius="sm" />
                                </Stack>
                            </Group>
                            {idx < 6 && <Divider />}
                        </Box>
                    ))}
                </Stack>
            </Card>
        </Stack>
    );
}
