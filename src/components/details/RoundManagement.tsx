import { useState, useEffect } from "react";
import { Select, TextInput, Group, ActionIcon, Text, Loader, Stack, Button } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IRound } from "@interfaces/Round";
import { useStaff } from "@hooks/useUsers";
import { useDeleteRound, useUpdateRound } from "@hooks/useRounds";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import utils from "@utils/index";
import UserLink from "@components/common/UserLink";
import { useAtom } from "jotai";
import { loggedInUserAtom } from "@store/atoms";
import moment from "moment";

interface IProps {
    round: IRound;
}

export default function RoundManagement({ round }: IProps) {
    const [loggedInUser] = useAtom(loggedInUserAtom);

    const { data: staff = [] } = useStaff();

    const updateRound = useUpdateRound(round?._id || "");
    const deleteRound = useDeleteRound(round?._id || "");

    const [theme, setTheme] = useState(round?.theme || "");
    const [assignedUserId, setAssignedUserId] = useState(round?.assignedUser?._id || "");
    const [startDate, setStartDate] = useState(round?.startDate ? new Date(round.startDate) : null);
    const [isEditingTheme, setIsEditingTheme] = useState(false);
    const [isEditingAssignedUser, setIsEditingAssignedUser] = useState(false);
    const [isEditingStartDate, setIsEditingStartDate] = useState(false);

    // sync theme with prop changes
    useEffect(() => {
        setTheme(round?.theme || "");
    }, [round?.theme]);

    // sync assigned user with prop changes
    useEffect(() => {
        setAssignedUserId(round?.assignedUser?._id || "");
    }, [round?.assignedUser?._id]);

    // sync startDate with prop changes
    useEffect(() => {
        setStartDate(round?.startDate ? new Date(round.startDate) : null);
    }, [round?.startDate]);

    // Save handler for theme
    const handleSaveTheme = async () => {
        await updateRound.mutateAsync({ theme });
        setIsEditingTheme(false);
    };

    // Save handler for assigned user
    const handleSaveAssignedUser = async () => {
        if (assignedUserId !== (round?.assignedUser?._id || "")) {
            await updateRound.mutateAsync({ assignedUserId });
        }
        setIsEditingAssignedUser(false);
    };

    const handleSaveStartDate = async () => {
        if (!startDate) return;
        // Convert to UTC midnight
        const utcStartDate = utils.toUTCDateOnly(startDate);
        await updateRound.mutateAsync({ startDate: utcStartDate });
        setIsEditingStartDate(false);
    };

    const handleCancelAssignedUser = () => {
        setAssignedUserId(round?.assignedUser?._id || "");
        setIsEditingAssignedUser(false);
    };

    const handleCancelTheme = () => {
        setTheme(round?.theme || "");
        setIsEditingTheme(false);
    };

    const handleDeleteRound = async () => {
        if (!confirm("Are you sure? This will delete the round and all associated data.")) return;
        await deleteRound.mutateAsync();
    };

    const handleCancelStartDate = () => {
        setStartDate(round?.startDate ? new Date(round.startDate) : null);
        setIsEditingStartDate(false);
    };

    return (
        <Stack>
            <Group align="flex-end" gap="xl">
                <div style={{ minWidth: 220 }}>
                    <label style={{ fontSize: 14, fontWeight: 500, display: "block", marginBottom: 4 }}>
                        Assigned User
                    </label>
                    {isEditingAssignedUser ? (
                        <Group gap={4} wrap="nowrap">
                            <Select
                                data={staff.map((user) => ({ value: user._id, label: user.username }))}
                                value={assignedUserId}
                                onChange={(val) => setAssignedUserId(val || "")}
                                style={{ maxWidth: 160 }}
                                rightSection={updateRound.isPending ? <Loader size="xs" /> : null}
                                disabled={updateRound.isPending}
                                size="sm"
                            />
                            <ActionIcon
                                color="green"
                                variant="subtle"
                                onClick={handleSaveAssignedUser}
                                loading={updateRound.isPending}
                                aria-label="Save Assigned User">
                                <FontAwesomeIcon icon="floppy-disk" size="sm" />
                            </ActionIcon>
                            <ActionIcon
                                color="red"
                                variant="subtle"
                                onClick={handleCancelAssignedUser}
                                disabled={updateRound.isPending}
                                aria-label="Cancel Assigned User Edit">
                                <FontAwesomeIcon icon="xmark" size="sm" />
                            </ActionIcon>
                        </Group>
                    ) : (
                        <Group gap={4} wrap="nowrap">
                            {round?.assignedUser ? (
                                <UserLink user={round.assignedUser} size="sm" />
                            ) : (
                                <Text size="sm" c="dimmed" fs="italic">
                                    No Assigned User
                                </Text>
                            )}
                            <ActionIcon color="blue" variant="subtle" onClick={() => setIsEditingAssignedUser(true)}>
                                <FontAwesomeIcon icon="pen-to-square" size="sm" />
                            </ActionIcon>
                        </Group>
                    )}
                </div>
                <div style={{ minWidth: 220 }}>
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
                                variant="subtle"
                                onClick={handleSaveTheme}
                                loading={updateRound.isPending}>
                                <FontAwesomeIcon icon="floppy-disk" size="sm" />
                            </ActionIcon>

                            <ActionIcon
                                color="red"
                                variant="subtle"
                                onClick={handleCancelTheme}
                                disabled={updateRound.isPending}
                                aria-label="Cancel Theme Edit">
                                <FontAwesomeIcon icon="xmark" size="sm" />
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
                <div style={{ minWidth: 220 }}>
                    <label style={{ fontSize: 14, fontWeight: 500, display: "block", marginBottom: 4 }}>
                        Start Date
                    </label>
                    {isEditingStartDate ? (
                        <Group gap={4} wrap="nowrap">
                            <DateInput
                                value={startDate}
                                onChange={setStartDate}
                                label={undefined}
                                placeholder="Select start date"
                                clearable
                                withAsterisk
                                excludeDate={(date) => date.getDay() !== 4}
                                style={{ maxWidth: 160 }}
                                disabled={updateRound.isPending}
                            />
                            <ActionIcon
                                color="green"
                                variant="subtle"
                                onClick={handleSaveStartDate}
                                loading={updateRound.isPending}
                                aria-label="Save Start Date">
                                <FontAwesomeIcon icon="floppy-disk" size="sm" />
                            </ActionIcon>
                            <ActionIcon
                                color="red"
                                variant="subtle"
                                onClick={handleCancelStartDate}
                                disabled={updateRound.isPending}
                                aria-label="Cancel Start Date Edit">
                                <FontAwesomeIcon icon="xmark" size="sm" />
                            </ActionIcon>
                        </Group>
                    ) : (
                        <Group gap={4} wrap="nowrap">
                            <Text size="sm" fw={500}>
                                {round?.startDate ? moment(round.startDate).format("MMM D, YYYY") : "No Start Date"}
                            </Text>
                            <ActionIcon color="blue" variant="subtle" onClick={() => setIsEditingStartDate(true)}>
                                <FontAwesomeIcon icon="pen-to-square" size="sm" />
                            </ActionIcon>
                        </Group>
                    )}
                </div>
            </Group>

            <Group>
                {loggedInUser?.isAdmin && (
                    <Button
                        variant="light"
                        color="red"
                        leftSection={<FontAwesomeIcon icon="trash" />}
                        onClick={handleDeleteRound}
                        loading={deleteRound.isPending}>
                        Delete Round
                    </Button>
                )}
            </Group>
        </Stack>
    );
}
