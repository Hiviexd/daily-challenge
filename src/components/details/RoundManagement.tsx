import { useState, useEffect } from "react";
import { Select, TextInput, Group, ActionIcon, Text, Loader, Stack, Button } from "@mantine/core";
import { IRound } from "@interfaces/Round";
import useStaff from "@hooks/useUsers";
import { useUpdateRound } from "@hooks/useRounds";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface IProps {
    round: IRound;
}

export default function RoundManagement({ round }: IProps) {
    const { data: staff = [] } = useStaff();
    const updateRound = useUpdateRound(round?._id || "");
    const [theme, setTheme] = useState(round?.theme || "");
    const [isEditingTheme, setIsEditingTheme] = useState(false);

    // sync theme with prop changes
    useEffect(() => {
        setTheme(round?.theme || "");
    }, [round?.theme]);

    // Save handler for theme
    const handleSaveTheme = async () => {
        await updateRound.mutateAsync({ theme });
        setIsEditingTheme(false);
    };

    // Handler for assigned user change
    const handleAssignedUserChange = async (val: string | null) => {
        if (typeof val === "string" && val !== (round?.assignedUser?._id || "")) {
            await updateRound.mutateAsync({ assignedUserId: val });
        }
    };

    const handleUpdateIsPublished = async () => {
        if (!confirm("Are you sure? This will affect the public visibility of this round.")) return;
        await updateRound.mutateAsync({ isPublished: !round?.isPublished });
    };

    return (
        <Stack>
            <Group align="flex-end" gap="xl">
                <Select
                    label="Assigned User"
                    data={staff.map((user) => ({ value: user._id, label: user.username }))}
                    value={round?.assignedUser?._id || null}
                    onChange={handleAssignedUserChange}
                    style={{ maxWidth: 220 }}
                    rightSection={updateRound.isPending ? <Loader size="xs" /> : null}
                    disabled={updateRound.isPending}
                />
                <div style={{ minWidth: 300 }}>
                    <label style={{ fontSize: 14, fontWeight: 500, display: "block", marginBottom: 4 }}>Theme</label>
                    {isEditingTheme ? (
                        <Group gap={4} wrap="nowrap">
                            <TextInput
                                value={theme}
                                onChange={(e) => setTheme(e.currentTarget.value)}
                                size="sm"
                                style={{ maxWidth: 200 }}
                                disabled={updateRound.isPending}
                            />
                            <ActionIcon
                                color="green"
                                variant="light"
                                onClick={handleSaveTheme}
                                loading={updateRound.isPending}>
                                <FontAwesomeIcon icon="floppy-disk" size="sm" />
                            </ActionIcon>
                        </Group>
                    ) : (
                        <Group gap={4} wrap="nowrap">
                            {theme ? (
                                <Text size="sm" fw={500}>
                                    {theme}
                                </Text>
                            ) : (
                                <Text size="sm" c="dimmed" fs="italic">
                                    No Theme
                                </Text>
                            )}

                            <ActionIcon color="blue" variant="subtle" onClick={() => setIsEditingTheme(true)}>
                                <FontAwesomeIcon icon="pen-to-square" size="sm" />
                            </ActionIcon>
                        </Group>
                    )}
                </div>
            </Group>

            <Group>
                <Button
                    variant="light"
                    color={round?.isPublished ? "gray" : "info"}
                    leftSection={<FontAwesomeIcon icon={round?.isPublished ? "eye-slash" : "eye"} />}
                    onClick={handleUpdateIsPublished}
                    loading={updateRound.isPending}>
                    {round?.isPublished ? "Mark as hidden" : "Mark as public"}
                </Button>
            </Group>
        </Stack>
    );
}
