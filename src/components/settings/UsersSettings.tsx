import { useState } from "react";
import { TextInput, Button, Stack, Group, Avatar, Text, Badge, Alert, Card, Skeleton } from "@mantine/core";
import { useGroupMove, useStaff, useUser, useSpectators } from "@hooks/useUsers";
import UserLink from "@components/common/UserLink";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IUser, UserGroupAction } from "@interfaces/User";

const GROUPS = ["staff", "spectator", "admin"];

export default function UsersSettings() {
    const [userInput, setUserInput] = useState("");
    const [submittedInput, setSubmittedInput] = useState<string | null>(null);
    const { data: user, isLoading, isError } = useUser(submittedInput || "");
    const groupMoveMutation = useGroupMove(submittedInput || "");
    const { data: staff } = useStaff();
    const { data: spectators } = useSpectators();

    const handleLoadUser = () => {
        setSubmittedInput(userInput.trim());
    };

    const handleGroupMove = (group: string, action: UserGroupAction) => {
        groupMoveMutation.mutate({ group, action });
    };

    const LoadingSkeleton = () => {
        return (
            <Card radius="md">
                <Stack gap="sm">
                    <Group gap="md">
                        <Skeleton height={64} width={64} circle />
                        <Stack gap={2} style={{ flex: 1 }}>
                            <Skeleton height={24} width={120} radius="sm" />
                            <Group gap={4}>
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton key={i} height={22} width={60} radius="xl" />
                                ))}
                            </Group>
                        </Stack>
                    </Group>
                    <Group gap="sm">
                        {GROUPS.map((_, i) => (
                            <Skeleton key={i} height={28} width={120} radius="md" />
                        ))}
                    </Group>
                </Stack>
            </Card>
        );
    };

    const userList = (users: IUser[]) => {
        return (
            <Group gap="md">
                {users.map((user) => (
                    <Card className="user-card" key={user._id} radius="md" p="sm" component="a" href={user.osuProfileUrl}>
                        <Group gap="xs">
                            <Avatar src={user.avatarUrl} size={32} radius="xl" />
                            <UserLink fw={500} size="sm" user={user} c="white" asText />
                        </Group>
                    </Card>
                ))}
            </Group>
        );
    };

    return (
        <Stack gap="md">
            {/* Staff List */}
            {Array.isArray(staff) && staff.length > 0 && (
                <Stack gap="xs">
                    <Text fw={600} size="sm">
                        Staff List
                    </Text>
                    {userList(staff)}
                </Stack>
            )}
            {Array.isArray(spectators) && spectators.length > 0 && (
                <Stack gap="xs">
                    <Text fw={600} size="sm">
                        Spectators List
                    </Text>
                    {userList(spectators)}
                </Stack>
            )}
            <Group align="flex-end" gap="sm">
                <TextInput
                    label="User Input"
                    placeholder="Enter username or user ID..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.currentTarget.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleLoadUser();
                    }}
                    style={{ minWidth: 240 }}
                />
                <Button onClick={handleLoadUser} loading={isLoading} disabled={!userInput.trim()}>
                    Load User
                </Button>
            </Group>
            {isLoading && <LoadingSkeleton />}
            {isError && submittedInput && <Alert color="red">User not found or error loading user.</Alert>}
            {user && !isLoading && !isError && (
                <Card radius="md">
                    <Stack gap="sm">
                        <Group gap="md">
                            <Avatar src={user.avatarUrl} size={64} radius="xl" />
                            <Stack gap={2}>
                                <Text fw={700} size="lg">
                                    {user && user.osuId ? (
                                        <UserLink user={user} c="white" asText={!user.username} />
                                    ) : (
                                        "Unknown"
                                    )}
                                </Text>
                                <Group gap={4}>
                                    {user.groups?.length > 0 ? (
                                        user.groups.map((group: string) => (
                                            <Badge key={group} variant="light">
                                                {group}
                                            </Badge>
                                        ))
                                    ) : (
                                        <Text size="sm" c="dimmed">
                                            No groups
                                        </Text>
                                    )}
                                </Group>
                            </Stack>
                        </Group>
                        <Group gap="sm">
                            {GROUPS.map((group) => (
                                <Button
                                    key={group}
                                    size="xs"
                                    variant="light"
                                    color={user.groups?.includes(group) ? "danger" : "success"}
                                    loading={groupMoveMutation.isPending}
                                    disabled={!user || user.error}
                                    onClick={() =>
                                        handleGroupMove(group, user.groups?.includes(group) ? "remove" : "add")
                                    }
                                    leftSection={
                                        user.groups?.includes(group) ? (
                                            <FontAwesomeIcon icon="user-minus" />
                                        ) : (
                                            <FontAwesomeIcon icon="user-plus" />
                                        )
                                    }>
                                    {user.groups?.includes(group) ? `Remove from ${group}` : `Add to ${group}`}
                                </Button>
                            ))}
                        </Group>
                    </Stack>
                </Card>
            )}
        </Stack>
    );
}
