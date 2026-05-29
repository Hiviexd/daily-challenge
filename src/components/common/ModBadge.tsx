import { MantineColor } from "@mantine/core";
import "@sass/ModBadge.scss";

interface ModBadgeProps {
    acronym: string;
    color?: MantineColor | string;
    size?: "sm" | "md";
    selected?: boolean;
    /** Use dark badge bg when selected (inside colored mod buttons) */
    darkWhenSelected?: boolean;
    showSettingsIndicator?: boolean;
    className?: string;
}

export default function ModBadge({
    acronym,
    color = "primary",
    size = "md",
    selected = false,
    darkWhenSelected = false,
    showSettingsIndicator = false,
    className,
}: ModBadgeProps) {
    const sizeClass = size === "sm" ? "modBadgeSm" : "modBadgeMd";
    const stateClass = selected ? "modBadgeSelected" : "modBadgeIdle";
    const contrastClass = selected && darkWhenSelected ? "modBadgeDark" : "";

    const style =
        selected && !darkWhenSelected ? { background: `var(--mantine-color-${color}-7)` } : undefined;

    return (
        <span className={`modBadgeWrapper${className ? ` ${className}` : ""}`}>
            <span
                className={`modBadge ${sizeClass} ${stateClass} ${contrastClass}`.trim()}
                style={style}
                title={acronym}>
                <span className="modBadgeLabel">{acronym}</span>
            </span>
            {showSettingsIndicator && <span className="modBadgeSettingsIndicator" aria-hidden="true" />}
        </span>
    );
}
