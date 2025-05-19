import { Modal, TextInput, Stack, Select, Button, Group } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useCreateRound } from "../../hooks/useRounds";
import useStaff from "../../hooks/useUsers";
import { IUser } from "../../../interfaces/User";
import { toUTCDateOnly } from "../../../utils/common";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface IProps {
    opened: boolean;
    onClose: () => void;
}

export default function CreateRoundModal({ opened, onClose }: IProps) {
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
            const utcStartDate = values.startDate ? toUTCDateOnly(values.startDate) : null;

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

    return (
        <Modal opened={opened} onClose={onClose} title="Create Round">
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                    <DateInput
                        label="Start Date"
                        placeholder="Select start date"
                        description="End date will be 7 days after start date"
                        leftSection={<FontAwesomeIcon icon="calendar" />}
                        clearable
                        withAsterisk
                        {...form.getInputProps("startDate")}
                        excludeDate={(date) => date.getDay() !== 4}
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
