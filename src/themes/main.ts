import { createTheme, MantineColorsTuple } from "@mantine/core";

const primary: MantineColorsTuple = [
    "#faedff",
    "#edd9f7",
    "#d8b1ea",
    "#c286dd",
    "#ae62d2",
    "#a24bcb",
    "#9e3fc9",
    "#8931b2",
    "#7b2aa0",
    "#6b218d",
    "#24222a",
    "#18171c",
];

const danger: MantineColorsTuple = [
    "#ffe8e9",
    "#ffd1d1",
    "#fba0a0",
    "#f76d6d",
    "#f44141",
    "#f22625",
    "#f21616",
    "#d8070b",
    "#c10007",
    "#a90003",
];

const info: MantineColorsTuple = [
    "#e0fbff",
    "#cbf2ff",
    "#9ae2ff",
    "#64d2ff",
    "#3cc5fe",
    "#23bcfe",
    "#09b8ff",
    "#00a1e4",
    "#0090cd",
    "#007cb5",
];

const success: MantineColorsTuple = [
    "#e5feee",
    "#d2f9e0",
    "#a8f1c0",
    "#7aea9f",
    "#53e383",
    "#3bdf70",
    "#2bdd66",
    "#1ac455",
    "#0caf49",
    "#00963c",
];

const warning: MantineColorsTuple = [
    "#fff8e1",
    "#ffefcc",
    "#ffdd9b",
    "#ffca64",
    "#ffba38",
    "#ffb01b",
    "#ffab09",
    "#e39500",
    "#ca8500",
    "#af7100",
];

export const theme = createTheme({
    fontFamily: "Nunito, sans-serif",
    shadows: {
        md: "1px 1px 3px rgba(0, 0, 0, .25)",
        xl: "5px 5px 3px rgba(0, 0, 0, .25)",
    },
    colors: {
        primary,
        danger,
        info,
        success,
        warning,
    },
    primaryColor: "primary",
    white: "#f8f9fa",
    black: "#212529",
    components: {
        Card: {
            defaultProps: {
                bg: "primary.10",
            },
            styles: {
                root: {
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                },
            },
        },
        Tooltip: {
            defaultProps: {
                withArrow: true,
                color: "primary.11",
            },
            styles: {
                tooltip: {
                    border: "1px solid var(--mantine-color-primary-6)",
                    boxShadow: "0 4px 4px rgba(0, 0, 0, 0.1)",
                    filter: "drop-shadow(0 2px 2px rgba(0, 0, 0, 0.1))",
                },
                arrow: {
                    border: "1px solid var(--mantine-color-primary-6)",
                    filter: "drop-shadow(0 1px 1px rgba(0, 0, 0, 0.1))",
                },
            },
        },
        Button: {
            styles: {
                root: {
                    transition: "all 0.2s ease",
                    "&:hover": {
                        transform: "translateY(-2px)",
                    },
                },
            },
        },
        ActionIcon: {
            styles: {
                root: {
                    transition: "all 0.2s ease",
                    "&:hover": {
                        transform: "translateY(-2px)",
                    },
                },
            },
        },
        Notification: {
            styles: {
                root: {
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                },
            },
        },
        Select: {
            defaultProps: {
                comboboxProps: { transitionProps: { transition: "scale-y", duration: 150 } },
            },
        },
        Dropdown: {
            styles: {
                dropdown: {
                    border: "1px solid var(--mantine-color-primary-6)",
                    boxShadow: "0 4px 4px rgba(0, 0, 0, 0.1)",
                    filter: "drop-shadow(0 2px 2px rgba(0, 0, 0, 0.1))",
                },
            },
        },
    },
});
