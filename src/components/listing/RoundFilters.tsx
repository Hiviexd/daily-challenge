import { TextInput, ActionIcon, Popover, Tooltip, Stack } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface IProps {
    themeSearch: string;
    setThemeSearch: (val: string) => void;
    artistTitleSearch: string;
    setArtistTitleSearch: (val: string) => void;
    selectedDate: Date | null;
    setSelectedDate: (date: Date | null) => void;
}

export default function RoundFilters({
    themeSearch,
    setThemeSearch,
    artistTitleSearch,
    setArtistTitleSearch,
    selectedDate,
    setSelectedDate,
}: IProps) {
    const [calendarOpen, setCalendarOpen] = useState(false);

    return (
        <Stack>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <TextInput
                    placeholder="Search by theme..."
                    value={themeSearch}
                    onChange={(e) => setThemeSearch(e.currentTarget.value)}
                    leftSection={<FontAwesomeIcon icon="search" />}
                    style={{ flex: 1 }}
                />
                <Popover
                    opened={calendarOpen}
                    onChange={setCalendarOpen}
                    transitionProps={{ transition: "pop" }}
                    position="bottom-end"
                    shadow="md">
                    <Popover.Target>
                        <Tooltip
                            multiline
                            w={170}
                            label="Filter by round which selected date is part of"
                            position="bottom">
                            <ActionIcon
                                variant={selectedDate ? "light" : "default"}
                                size="lg"
                                color={selectedDate ? "primary" : undefined}
                                onClick={() => setCalendarOpen((o) => !o)}
                                aria-label="Filter by date">
                                <FontAwesomeIcon icon="calendar" />
                            </ActionIcon>
                        </Tooltip>
                    </Popover.Target>
                    <Popover.Dropdown>
                        <DatePicker
                            value={selectedDate}
                            onChange={(date) => {
                                setSelectedDate(date);
                                setCalendarOpen(false);
                            }}
                            maxDate={new Date()}
                            size="sm"
                        />
                    </Popover.Dropdown>
                </Popover>
                {selectedDate && (
                    <ActionIcon
                        variant="outline"
                        color="danger"
                        size="lg"
                        onClick={() => setSelectedDate(null)}
                        aria-label="Clear date filter">
                        <FontAwesomeIcon icon="times" />
                    </ActionIcon>
                )}
            </div>
            <TextInput
                placeholder="Search by artist title..."
                value={artistTitleSearch}
                onChange={(e) => setArtistTitleSearch(e.currentTarget.value)}
                leftSection={<FontAwesomeIcon icon="search" />}
                style={{ flex: 1 }}
            />
        </Stack>
    );
}
