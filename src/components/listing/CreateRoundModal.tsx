import { Modal, TextInput, Stack, Select, Button, Group, Indicator } from "@mantine/core";
import { DateInput, DatePickerProps } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useCreateRound } from "@hooks/useRounds";
import { useStaff } from "@hooks/useUsers";
import { IUser } from "@interfaces/User";
import utils from "@utils/index";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { loggedInUserAtom } from "@store/atoms";
import { useAtom } from "jotai";
import dayjs from "dayjs";

interface IProps {
    opened: boolean;
    onClose: () => void;
}

export default function CreateRoundModal({ opened, onClose }: IProps) {
    const [loggedInUser] = useAtom(loggedInUserAtom);

    const createRoundMutation = useCreateRound();
    const { data: staff } = useStaff();

    const form = useForm({
        initialValues: {
            startDate: null as Date | null,
            theme: "",
            assignedUserId: "",
        },
        validate: {
            startDate: (value) => (!value ? "Start date is required" : null),
            theme: (value) => (value && value.length < 3 ? "Theme must be at least 3 characters long" : null),
            assignedUserId: (value) => (value === "" ? "Assigned user is required" : null),
        },
    });

    const getAssignedUserOptions = () => {
        if (!staff) return [];
        return staff.map((user: IUser) => ({ value: user._id, label: user.username }));
    };

    const handleSubmit = async (values) => {
        try {
            // Convert the start date to UTC midnight to avoid timezone schenanigans
            const utcStartDate = values.startDate ? utils.toUTCDateOnly(values.startDate) : null;

            await createRoundMutation.mutateAsync({
                ...values,
                startDate: utcStartDate,
            });

            form.reset();
            onClose();
        } catch (error) {
            console.error("Error creating round:", error);
        }
    };

    if (!loggedInUser?.isStaff) return null;

    const dayRenderer: DatePickerProps["renderDay"] = (date) => {
        const day = dayjs(date).date();
        const disableIndicator =
            !utils.checkIfFirstWeekOfMonth(date) ||
            date.getDay() !== 4 ||
            dayjs(date).isBefore("2026-01-01");
        return (
            <Indicator size={6} color="yellow" offset={-5} disabled={disableIndicator}>
                <div>{day}</div>
            </Indicator>
        );
    };

    return (
        <Modal opened={opened} onClose={onClose} title="Create Round">
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                    <DateInput
                        label="Start Date"
                        placeholder="Select start date"
                        description="End date will be 6 days after start date. Yellow dots are Monthly Beatmap Highlight weeks."
                        leftSection={<FontAwesomeIcon icon="calendar" />}
                        clearable
                        withAsterisk
                        {...form.getInputProps("startDate")}
                        excludeDate={(date) => date.getDay() !== 4}
                        renderDay={dayRenderer}
                    />
                    <Select
                        label="Assigned User"
                        placeholder="Select assigned user"
                        leftSection={<FontAwesomeIcon icon="user" />}
                        clearable
                        withAsterisk
                        data={getAssignedUserOptions()}
                        {...form.getInputProps("assignedUserId")}
                    />
                    <TextInput
                        label="Theme"
                        placeholder="Enter optional theme..."
                        leftSection={<FontAwesomeIcon icon="comment" />}
                        {...form.getInputProps("theme")}
                    />
                    <Group justify="flex-end">
                        <Button variant="subtle" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={createRoundMutation.isPending}>
                            Create Round
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
