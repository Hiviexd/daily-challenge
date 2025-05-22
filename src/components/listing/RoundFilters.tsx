import { TextInput, ActionIcon, Popover } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface IProps {
    search: string;
    setSearch: (val: string) => void;
    selectedDate: Date | null;
    setSelectedDate: (date: Date | null) => void;
}

export default function RoundFilters({ search, setSearch, selectedDate, setSelectedDate }: IProps) {
    const [calendarOpen, setCalendarOpen] = useState(false);

    return (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <TextInput
                placeholder="Search rounds by theme..."
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
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
                    <ActionIcon
                        variant={selectedDate ? "light" : "default"}
                        size="lg"
                        color={selectedDate ? "primary" : undefined}
                        onClick={() => setCalendarOpen((o) => !o)}
                        aria-label="Filter by date">
                        <FontAwesomeIcon icon="calendar" />
                    </ActionIcon>
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
    );
}
