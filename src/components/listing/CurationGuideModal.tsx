import { Modal, Stack, List, Title } from "@mantine/core";
import { useAtom } from "jotai";
import { loggedInUserAtom } from "@store/atoms";

interface CurationGuideModalProps {
    opened: boolean;
    onClose: () => void;
}

export default function CurationGuideModal({ opened, onClose }: CurationGuideModalProps) {
    const [loggedInUser] = useAtom(loggedInUserAtom);

    if (!loggedInUser?.isStaff) return null;

    return (
        <Modal opened={opened} onClose={onClose} title="Curation Guide" size="lg">
            <Stack gap="md">
                <Title order={4}>Picking Criteria</Title>
                <List spacing="xs" withPadding>
                    <List.Item>Is FA (not required but recommended)</List.Item>
                    <List.Item>Is good (in your opinion)</List.Item>
                    <List.Item>Roughly fits its difficulty slot</List.Item>
                    <List spacing="xs" mt="xs" withPadding>
                        <List.Item>Day 1: 3 ~ 3.49★</List.Item>
                        <List.Item>Day 2: 3.5 ~ 3.99★</List.Item>
                        <List.Item>Day 3: 4 ~ 4.49★</List.Item>
                        <List.Item>Day 4: 4.5 ~ 4.99★</List.Item>
                        <List.Item>Day 5: 5 ~ 5.49★</List.Item>
                        <List.Item>Day 6: 5.5 ~ 5.99★</List.Item>
                        <List.Item>Day 7: 6 ~ 6.49★</List.Item>
                    </List>
                    <List.Item>
                        Try having 1~2 forced mod picks per week
                        <List spacing="xs" mt="xs">
                            <List.Item>
                                When choosing mods, make sure to playtest the maps with them to
                                <br /> avoid any unintentional breakage (offscreen objects etc.)
                            </List.Item>
                        </List>
                    </List.Item>
                </List>
                <Title order={4}>General Notes</Title>
                <List spacing="xs" withPadding>
                    <List.Item>Don't use the Random mod (RD) and the No Scope (NS) mod</List.Item>
                    <List.Item>Avoid Wind Up (WU) when it results in AR getting near/above 10</List.Item>
                    <List.Item>
                        Be more vigilant with mod combos that cause a too high/low AR,
                        <br /> people tend to not enjoy those
                    </List.Item>
                    <List.Item>Don't pick explicit songs</List.Item>
                    <List.Item>Frequency of themed weeks should be kept on the lower side</List.Item>
                </List>
            </Stack>
        </Modal>
    );
}
