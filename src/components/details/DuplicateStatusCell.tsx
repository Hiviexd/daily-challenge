import { Popover, Text, Tooltip, Box } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { IWarning } from "@interfaces/Round";

interface IProps {
    warning?: IWarning;
    hasCheckedDuplicates: boolean;
}

export default function DuplicateStatusCell({ warning, hasCheckedDuplicates }: IProps) {
    const [opened, { open, close }] = useDisclosure(false);

    const getMetadata = (warning: IWarning) => {
        if (warning.type === "duplicate_difficulty") {
            return {
                icon: "clone" as IconProp,
                iconColor: "var(--mantine-color-red-6)",
                textColor: "danger",
                label: "Duplicate difficulty in:",
                tooltip: "Duplicate difficulty found",
            };
        } else if (warning.type === "duplicate_set") {
            return {
                icon: "file-circle-exclamation" as IconProp,
                iconColor: "var(--mantine-color-warning-6)",
                textColor: "warning",
                label: "Duplicate beatmapset in:",
                tooltip: "Duplicate beatmapset found",
            };
        } else if (warning.type === "duplicate_song") {
            return {
                icon: "music" as IconProp,
                iconColor: "var(--mantine-color-warning-6)",
                textColor: "warning",
                label: "Duplicate song in:",
                tooltip: "Duplicate song found",
            };
        }
        return {
            icon: "check-circle" as IconProp,
            iconColor: "var(--mantine-color-success-6)",
            textColor: "success",
            label: "No duplicates found",
            tooltip: "No duplicates found",
        };
    };

    if (!hasCheckedDuplicates) {
        return (
            <Tooltip label="Duplicates not checked">
                <Box component="span" style={{ display: "inline-flex", cursor: "default" }}>
                    <FontAwesomeIcon icon="question-circle" color="var(--mantine-color-gray-6)" />
                </Box>
            </Tooltip>
        );
    }

    if (warning) {
        const metadata = getMetadata(warning);
        return (
            <Tooltip label={metadata.tooltip}>
                <Popover position="top" withArrow shadow="md" opened={opened}>
                    <Popover.Target>
                        <Box
                            component="span"
                            style={{ display: "inline-flex", cursor: "default" }}
                            onMouseEnter={open}
                            onMouseLeave={close}>
                            <FontAwesomeIcon icon={metadata.icon} color={metadata.iconColor} />
                        </Box>
                    </Popover.Target>
                    <Popover.Dropdown>
                        <Text fw={500} c={metadata.textColor} mb={4}>
                            {metadata.label}
                        </Text>
                        {warning.duplicates.map((title, i) => (
                            <Text key={i} size="sm">
                                {title}
                            </Text>
                        ))}
                    </Popover.Dropdown>
                </Popover>
            </Tooltip>
        );
    }

    return (
        <Tooltip label="No duplicates found">
            <Box component="span" style={{ display: "inline-flex", cursor: "default" }}>
                <FontAwesomeIcon icon="check-circle" color="var(--mantine-color-success-6)" />
            </Box>
        </Tooltip>
    );
}
