import { Box, Skeleton } from "@mantine/core";
import { ROW_OVERLAY_GRADIENT } from "./constants";

interface Props {
    cover: string;
    isCurrentDailyChallenge: boolean;
    showSkeleton?: boolean;
    onImageLoad?: () => void;
}

export default function BeatmapRowBackground({
    cover,
    isCurrentDailyChallenge,
    showSkeleton,
    onImageLoad,
}: Props) {
    return (
        <>
            {showSkeleton && (
                <Skeleton pos="absolute" top={0} left={0} right={0} bottom={0} radius={0} style={{ zIndex: 0 }} />
            )}
            <Box
                pos="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                style={{
                    backgroundImage: showSkeleton ? undefined : `url(${cover})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    zIndex: 0,
                }}
            />
            <Box
                pos="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                style={{
                    background: isCurrentDailyChallenge ? ROW_OVERLAY_GRADIENT.active : ROW_OVERLAY_GRADIENT.default,
                    zIndex: 1,
                }}
            />
            <img
                src={cover}
                alt=""
                aria-hidden
                style={{
                    position: "absolute",
                    width: 0,
                    height: 0,
                    opacity: 0,
                    pointerEvents: "none",
                }}
                onLoad={onImageLoad}
            />
        </>
    );
}
