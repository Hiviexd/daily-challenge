import { Stack, Card, Group, Skeleton, Text, ScrollArea, Table } from "@mantine/core";

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
                <ScrollArea w="100%" type="auto" style={{ minWidth: 1200 }}>
                    <Table>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th style={{ minWidth: 80, maxWidth: 100, width: 100 }}>Beatmap ID</Table.Th>
                                <Table.Th style={{ textAlign: "center" }}>Star Rating</Table.Th>
                                <Table.Th style={{ width: 140 }} />
                                <Table.Th>Artist - Title</Table.Th>
                                <Table.Th>Difficulty</Table.Th>
                                <Table.Th>Host</Table.Th>
                                <Table.Th>Date Ranked</Table.Th>
                                <Table.Th>Notes/Mods</Table.Th>
                                {isStaff && (
                                    <Table.Th style={{ textAlign: "center" }}>
                                        <Skeleton height={18} width={60} radius="sm" />
                                    </Table.Th>
                                )}
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {Array.from({ length: 7 }).map((_, idx) => (
                                <Table.Tr key={idx}>
                                    <Table.Td>
                                        <Skeleton height={18} width={60} radius="sm" />
                                    </Table.Td>
                                    <Table.Td>
                                        <Skeleton height={18} width={50} radius="sm" />
                                    </Table.Td>
                                    <Table.Td>
                                        <Skeleton height={32} width={120} radius="sm" />
                                    </Table.Td>
                                    <Table.Td>
                                        <Skeleton height={18} width={180} radius="sm" />
                                    </Table.Td>
                                    <Table.Td>
                                        <Skeleton height={18} width={80} radius="sm" />
                                    </Table.Td>
                                    <Table.Td>
                                        <Skeleton height={18} width={100} radius="sm" />
                                    </Table.Td>
                                    <Table.Td>
                                        <Skeleton height={18} width={90} radius="sm" />
                                    </Table.Td>
                                    <Table.Td>
                                        <Skeleton height={18} width={120} radius="sm" />
                                    </Table.Td>
                                    {isStaff && (
                                        <Table.Td>
                                            <Skeleton height={18} width={60} radius="sm" />
                                        </Table.Td>
                                    )}
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </ScrollArea>
            </Card>
        </Stack>
    );
}
