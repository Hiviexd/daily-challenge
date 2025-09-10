import { Stack, Group, Avatar, Text, Card, Skeleton, Alert, Badge } from "@mantine/core";
import { useUserActivity } from "@hooks/useUsers";

interface StaffStat {
    user: {
        _id: string;
        username: string;
        osuId: number;
        avatarUrl: string;
    };
    weeksSinceLastAssignment: number | null;
    lastRoundTitle: string | null;
}

export default function UserActivity() {
    const { data: userActivity, isLoading, isError } = useUserActivity();

    const StaffStatsSkeleton = () => {
        return (
            <Stack gap="sm">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i} radius="md" p="md">
                        <Group gap="md" justify="space-between">
                            <Group gap="sm">
                                <Skeleton height={40} width={40} circle />
                                <Stack gap={2}>
                                    <Skeleton height={16} width={120} radius="sm" />
                                    <Skeleton height={14} width={80} radius="sm" />
                                </Stack>
                            </Group>
                            <Stack gap={2} align="flex-end">
                                <Skeleton height={20} width={100} radius="sm" />
                                <Skeleton height={14} width={150} radius="sm" />
                            </Stack>
                        </Group>
                    </Card>
                ))}
            </Stack>
        );
    };

    const formatWeeksText = (weeks: number | null) => {
        if (weeks === null) return "Never assigned";
        if (weeks === 0) return "This week";
        if (weeks < 0) {
            const absWeeks = Math.abs(weeks);
            if (absWeeks === 1) return "Next week";
            return `In ${absWeeks} weeks`;
        }
        if (weeks === 1) return "1 week ago";
        return `${weeks} weeks ago`;
    };

    const getWeeksBadgeColor = (weeks: number | null) => {
        if (weeks === null) return "gray";
        if (weeks <= -2) return "primary"; // Future assignments
        if (weeks <= -1) return "cyan"; // Next week
        if (weeks === 0) return "green"; // This week
        if (weeks <= 3) return "blue"; // 1–3 weeks ago
        if (weeks <= 6) return "yellow"; // 4–6 weeks ago
        if (weeks <= 8) return "orange"; // 7–8 weeks ago
        return "red"; // 9+ weeks ago
    };

    if (isLoading) {
        return (
            <Stack gap="md">
                <Text fw={600} size="lg">
                    Staff Assignment Activity
                </Text>
                <StaffStatsSkeleton />
            </Stack>
        );
    }

    if (isError) {
        return (
            <Stack gap="md">
                <Text fw={600} size="lg">
                    Staff Assignment Activity
                </Text>
                <Alert color="red">Failed to load staff statistics</Alert>
            </Stack>
        );
    }

    if (!Array.isArray(userActivity) || userActivity.length === 0) {
        return (
            <Stack gap="md">
                <Text fw={600} size="lg">
                    Staff Assignment Statistics
                </Text>
                <Text size="sm" c="dimmed">
                    No staff members found
                </Text>
            </Stack>
        );
    }

    return (
        <Stack gap="md">
            <Text fw={600} size="lg">
                Staff Assignment Statistics
            </Text>
            <Text size="sm" c="dimmed">
                Shows staff members ordered by time since their last round assignment
            </Text>

            <Stack gap="sm">
                {userActivity.map((stat: StaffStat) => (
                    <Card key={stat.user._id} radius="md" p="md">
                        <Group justify="space-between" align="flex-start">
                            <Group gap="sm">
                                <Avatar src={stat.user.avatarUrl} size={40} radius="xl" />
                                <Stack gap={2}>
                                    <Text fw={500} c="white">
                                        {stat.user.username || `User ${stat.user.osuId}`}
                                    </Text>
                                    {stat.lastRoundTitle && (
                                        <Text size="xs" c="dimmed">
                                            Last: {stat.lastRoundTitle}
                                        </Text>
                                    )}
                                </Stack>
                            </Group>

                            <Stack gap={4} align="flex-end">
                                <Badge
                                    variant="light"
                                    color={getWeeksBadgeColor(stat.weeksSinceLastAssignment)}
                                    size="md">
                                    {formatWeeksText(stat.weeksSinceLastAssignment)}
                                </Badge>
                                {stat.weeksSinceLastAssignment !== null && stat.weeksSinceLastAssignment !== 0 && (
                                    <Text size="xs" c="dimmed" ta="right">
                                        {Math.abs(stat.weeksSinceLastAssignment)} week
                                        {Math.abs(stat.weeksSinceLastAssignment) !== 1 ? "s" : ""}
                                        {stat.weeksSinceLastAssignment < 0 ? " (upcoming)" : " (past)"}
                                    </Text>
                                )}
                            </Stack>
                        </Group>
                    </Card>
                ))}
            </Stack>
        </Stack>
    );
}
