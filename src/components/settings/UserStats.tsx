import { Stack, Group, Avatar, Text, Card, Skeleton, Alert, Badge } from "@mantine/core";
import { useUserStats } from "@hooks/useUsers";

interface UserStat {
    user: {
        _id: string;
        username: string;
        osuId: number;
        avatarUrl: string;
        groups?: string[];
    };
    assignedRoundsCount: number;
}

export default function UserStats() {
    const { data: userStats, isLoading, isError } = useUserStats();

    const UserStatsSkeleton = () => {
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
                            <Skeleton height={24} width={60} radius="sm" />
                        </Group>
                    </Card>
                ))}
            </Stack>
        );
    };

    const getCountBadgeColor = (count: number) => {
        if (count === 0) return "gray";
        if (count <= 2) return "blue";
        if (count <= 5) return "green";
        if (count <= 10) return "yellow";
        if (count <= 15) return "orange";
        return "red";
    };

    const getUserStatusBadge = (groups?: string[]) => {
        if (!groups || groups.length === 0) return null;

        if (groups.includes("staff")) {
            return (
                <Badge variant="light" color="primary" size="xs">
                    Staff
                </Badge>
            );
        }

        if (groups.includes("spectator")) {
            return (
                <Badge variant="light" color="cyan" size="xs">
                    Spectator
                </Badge>
            );
        }

        return (
            <Badge variant="light" color="gray" size="xs">
                User
            </Badge>
        );
    };

    if (isLoading) {
        return (
            <Stack gap="md">
                <Text fw={600} size="lg">
                    User Statistics
                </Text>
                <UserStatsSkeleton />
            </Stack>
        );
    }

    if (isError) {
        return (
            <Stack gap="md">
                <Text fw={600} size="lg">
                    User Statistics
                </Text>
                <Alert color="red">Failed to load user statistics</Alert>
            </Stack>
        );
    }

    if (!Array.isArray(userStats) || userStats.length === 0) {
        return (
            <Stack gap="md">
                <Text fw={600} size="lg">
                    User Statistics
                </Text>
                <Text size="sm" c="dimmed">
                    No users with assigned rounds found
                </Text>
            </Stack>
        );
    }

    return (
        <Stack gap="md">
            <Text fw={600} size="lg">
                User Statistics
            </Text>
            <Text size="sm" c="dimmed">
                All users who have been assigned rounds, sorted by assignment count
            </Text>

            <Stack gap="sm">
                {userStats.map((stat: UserStat) => (
                    <Card key={stat.user._id} radius="md" p="md">
                        <Group justify="space-between" align="center">
                            <Group gap="sm">
                                <Avatar src={stat.user.avatarUrl} size={40} radius="xl" />
                                <Stack gap={2}>
                                    <Group gap="xs" align="center">
                                        <Text fw={500} c="white">
                                            {stat.user.username || `User ${stat.user.osuId}`}
                                        </Text>
                                        {getUserStatusBadge(stat.user.groups)}
                                    </Group>
                                </Stack>
                            </Group>

                            <Badge variant="light" color={getCountBadgeColor(stat.assignedRoundsCount)}>
                                {stat.assignedRoundsCount} round{stat.assignedRoundsCount !== 1 ? "s" : ""}
                            </Badge>
                        </Group>
                    </Card>
                ))}
            </Stack>
        </Stack>
    );
}
