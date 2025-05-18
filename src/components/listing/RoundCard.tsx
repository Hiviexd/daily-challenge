import { Card, Text, Group } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import UserLink from "../common/UserLink";
import { IUser } from "@interfaces/User";

interface IProps {
    title: string;
    isPublished: boolean;
    assignedUser: { username: string };
    theme?: string;
    isActive: boolean;
    isPast: boolean;
}

export default function RoundCard({ title, isPublished, assignedUser, theme, isActive, isPast }: IProps) {
    return (
        <Card
            radius="md"
            p="md"
            className={`round-card ${isActive ? "active" : isPast ? "past" : ""}`}>
            <Group gap="xs" align="center" mb={4}>
                {isPublished ? (
                    <FontAwesomeIcon icon="eye" color="var(--mantine-color-info-6)" />
                ) : (
                    <FontAwesomeIcon icon="eye-slash" color="var(--mantine-color-gray-6)" />
                )}
                <Text fw={700} size="md" truncate>
                    {title}
                </Text>
            </Group>
            <Text size="sm" c="dimmed" mb={2}>
                by <UserLink user={assignedUser as IUser} />
            </Text>
            <Text size="sm" fs="italic">{theme || "No Theme"}</Text>
        </Card>
    );
}
