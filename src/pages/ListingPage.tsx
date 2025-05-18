import { AppShell, Box, TextInput, Stack, Paper, Divider } from "@mantine/core";
import { useCallback, useState, useEffect } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";
import { useSetAtom } from "jotai";
import { roundsAtom, selectedRoundAtom } from "../store/atoms";

// components
import Header from "../components/common/Header";
import RoundCard from "@components/listing/RoundCard";
import { IRound } from "@interfaces/Round";
// import { IRound } from "@interfaces/Round";
// import { IUser } from "@interfaces/User";
// import { IBeatmap } from "@interfaces/Beatmap";

export default function ListingPage() {
    const [search, setSearch] = useState("");
    const [debouncedSearch] = useDebouncedValue(search, 300);
    const [cursor, setCursor] = useState<string | null>(null);

    const [rounds, setRounds] = useState<IRound[]>([]);
    const [selectedRound, setSelectedRound] = useState<IRound | null>(null);

    // Dummy data for rounds
    const dummyRounds = [
        {
            assignedUser: {
                osuId: 1,
                username: "UserOne",
                groups: ["user"],
                avatarUrl: "https://dummyimage.com/100x100/000/fff&text=U1",
                osuProfileUrl: "https://osu.ppy.sh/users/1",
                hasAccess: true,
                isStaff: false,
                isSpectator: false,
                isAdmin: false,
            },
            beatmaps: [
                {
                    beatmapId: 101,
                    beatmapsetId: 201,
                    artist: "Artist A",
                    title: "Song A",
                    version: "Hard",
                    cover: "https://dummyimage.com/200x100/000/fff&text=BM1",
                    rankedDate: new Date(),
                    creator: { osuId: 1, username: "UserOne" },
                },
            ],
            startDate: new Date(),
            endDate: new Date(Date.now() + 86400000),
            theme: "Theme A",
            isPublished: true,
            isActive: true,
            isUpcoming: false,
            isPast: false,
            title: "May 15 — May 21 2025",
        },
        {
            assignedUser: {
                osuId: 2,
                username: "UserTwo",
                groups: ["staff"],
                avatarUrl: "https://dummyimage.com/100x100/000/fff&text=U2",
                osuProfileUrl: "https://osu.ppy.sh/users/2",
                hasAccess: true,
                isStaff: true,
                isSpectator: false,
                isAdmin: false,
            },
            beatmaps: [
                {
                    beatmapId: 102,
                    beatmapsetId: 202,
                    artist: "Artist B",
                    title: "Song B",
                    version: "Insane",
                    cover: "https://dummyimage.com/200x100/000/fff&text=BM2",
                    rankedDate: new Date(),
                    creator: { osuId: 2, username: "UserTwo" },
                },
            ],
            startDate: new Date(),
            endDate: new Date(Date.now() + 172800000),
            theme: "Theme B",
            isPublished: false,
            isActive: false,
            isUpcoming: true,
            isPast: false,
            title: "May 15 — May 21 2025",
        },
        {
            assignedUser: {
                osuId: 3,
                username: "UserThree",
                groups: ["admin"],
                avatarUrl: "https://dummyimage.com/100x100/000/fff&text=U3",
                osuProfileUrl: "https://osu.ppy.sh/users/3",
                hasAccess: true,
                isStaff: false,
                isSpectator: false,
                isAdmin: true,
            },
            beatmaps: [
                {
                    beatmapId: 103,
                    beatmapsetId: 203,
                    artist: "Artist C",
                    title: "Song C",
                    version: "Expert",
                    cover: "https://dummyimage.com/200x100/000/fff&text=BM3",
                    rankedDate: new Date(Date.now() - 604800000),
                    creator: { osuId: 3, username: "UserThree" },
                },
            ],
            startDate: new Date(Date.now() - 1209600000), // 14 days ago
            endDate: new Date(Date.now() - 604800000), // 7 days ago
            theme: "Theme C",
            isPublished: true,
            isActive: false,
            isUpcoming: false,
            isPast: true,
            title: "May 15 — May 21 2025",
        },
    ] as any;

    // Preload dummy data on mount
    useEffect(() => {
        setRounds(dummyRounds);
        setSelectedRound(dummyRounds[0]);
    }, []);

    const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight * 1.5) {
            // Load more rounds here using the cursor
            // TODO: Implement loading more rounds
        }
    }, []);

    return (
        <AppShell
            padding="md"
            header={{ height: 70 }}
            navbar={{
                width: 300,
                breakpoint: "sm",
            }}>
            <AppShell.Header>
                <Header />
            </AppShell.Header>
            <AppShell.Navbar p="md">
                <Stack>
                    <TextInput
                        placeholder="Search rounds..."
                        value={search}
                        onChange={(e) => setSearch(e.currentTarget.value)}
                        leftSection={<IconSearch size={16} />}
                    />
                    <Divider />
                    <Stack style={{ flex: 1 }} onScroll={handleScroll}>
                        {rounds.map((round) => (
                            <RoundCard key={round.id} {...round} />
                        ))}
                    </Stack>
                </Stack>
            </AppShell.Navbar>

            <AppShell.Main>
                <Paper
                    shadow="sm"
                    p="xl"
                    withBorder
                    h={400}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}>
                    Round Display
                </Paper>
            </AppShell.Main>
        </AppShell>
    );
}
