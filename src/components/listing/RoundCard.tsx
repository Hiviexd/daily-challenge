import { Card, Text, Group } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import UserLink from "@components/common/UserLink";
import { IRound } from "@interfaces/Round";
import { loggedInUserAtom } from "@store/atoms";
import { useAtom } from "jotai";

interface IProps {
    round: IRound;
    selected?: boolean | null;
    onClick?: () => void;
}

export default function RoundCard({ round, selected = false, onClick }: IProps) {
    const [loggedInUser] = useAtom(loggedInUserAtom);

    return (
        <Card
            radius="md"
            p="md"
            className={`round-card ${
                loggedInUser?.hasAccess ? (round.isActive ? "active" : round.isPast ? "past" : "") : "primary"
            }${selected ? " selected" : ""}`}
            onClick={onClick}
            style={{ cursor: onClick ? "pointer" : undefined }}>
            <Group gap="xs" align="center" mb={4}>
                {round.isPublished ? (
                    <FontAwesomeIcon icon="eye" color="var(--mantine-color-info-6)" />
                ) : (
                    <FontAwesomeIcon icon="eye-slash" color="var(--mantine-color-gray-6)" />
                )}
                <Text fw={700} size="md" truncate>
                    {round.title}
                </Text>
            </Group>
            {loggedInUser?.hasAccess && (
                <Text size="sm" c="dimmed" mb={2}>
                    by <UserLink user={round.assignedUser} />
                </Text>
            )}
            <Text size="xs" c={!round.theme ? "dimmed" : undefined}>
                {round.theme || "No Theme"}
            </Text>
        </Card>
    );
}
