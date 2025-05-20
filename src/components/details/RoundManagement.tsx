import { useState, useEffect } from "react";
import { Select, TextInput, Group } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IRound } from "@interfaces/Round";
import useStaff from "@hooks/useUsers";
import { useUpdateRound } from "@hooks/useRounds";

interface IProps {
    round: IRound;
}

export default function RoundManagement({ round }: IProps) {
    const { data: staff = [] } = useStaff();
    const updateRound = useUpdateRound(round?._id || "");
    const [theme, setTheme] = useState(round?.theme || "");
    const [debouncedTheme] = useDebouncedValue(theme, 500);

    // Auto-save theme
    useEffect(() => {
        const original = round?.theme || "";
        if (debouncedTheme !== original) {
            updateRound.mutateAsync({ theme: debouncedTheme });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedTheme]);

    // sync theme with prop changes
    useEffect(() => {
        setTheme(round?.theme || "");
    }, [round?.theme]);

    // Handler for assigned user change
    const handleAssignedUserChange = (val: string | null) => {
        if (typeof val === "string" && val !== (round?.assignedUser?._id || "")) {
            updateRound.mutateAsync({ assignedUserId: val });
        }
    };

    return (
        <Group align="flex-end" gap="md">
            <Select
                label="Assigned User"
                data={staff.map((user) => ({ value: user._id, label: user.username }))}
                value={round?.assignedUser?._id || null}
                onChange={handleAssignedUserChange}
                style={{ maxWidth: 220 }}
            />
            <TextInput
                label="Theme"
                value={theme}
                onChange={(e) => setTheme(e.currentTarget.value)}
                style={{ minWidth: 300 }}
            />
        </Group>
    );
}
