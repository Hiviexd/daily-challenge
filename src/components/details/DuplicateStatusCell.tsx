import { Popover, Text } from "@mantine/core";
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
            };
        } else if (warning.type === "duplicate_set") {
            return {
                icon: "file-circle-exclamation" as IconProp,
                iconColor: "var(--mantine-color-warning-6)",
                textColor: "warning",
                label: "Duplicate beatmapset in:",
            };
        } else if (warning.type === "duplicate_song") {
            return {
                icon: "music" as IconProp,
                iconColor: "var(--mantine-color-warning-6)",
                textColor: "warning",
                label: "Duplicate song in:",
            };
        }
        return {
            icon: "check-circle" as IconProp,
            iconColor: "var(--mantine-color-success-6)",
            textColor: "success",
            label: "No duplicates found",
        };
    };

    if (!hasCheckedDuplicates) {
        return <FontAwesomeIcon icon="question-circle" color="var(--mantine-color-gray-6)" />;
    }

    if (warning) {
        return (
            <Popover position="top" withArrow shadow="md" opened={opened}>
                <Popover.Target>
                    <Text onMouseEnter={open} onMouseLeave={close}>
                        <FontAwesomeIcon icon={getMetadata(warning).icon} color={getMetadata(warning).iconColor} />
                    </Text>
                </Popover.Target>
                <Popover.Dropdown>
                    <Text fw={500} c={getMetadata(warning).textColor} mb={4}>
                        {getMetadata(warning).label}
                    </Text>
                    {warning.duplicates.map((title, i) => (
                        <Text key={i} size="sm">
                            {title}
                        </Text>
                    ))}
                </Popover.Dropdown>
            </Popover>
        );
    }
    return <FontAwesomeIcon icon="check-circle" color="var(--mantine-color-success-6)" />;
}
