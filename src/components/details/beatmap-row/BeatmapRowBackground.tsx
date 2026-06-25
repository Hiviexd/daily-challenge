import { useEffect, useRef, useState } from "react";
import { Box, Skeleton } from "@mantine/core";
import { ROW_OVERLAY_GRADIENT } from "./constants";

interface Props {
    cover: string;
    isCurrentDailyChallenge: boolean;
}

export default function BeatmapRowBackground({ cover, isCurrentDailyChallenge }: Props) {
    const [loaded, setLoaded] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        setLoaded(false);
        if (imgRef.current?.complete) {
            setLoaded(true);
        }
    }, [cover]);

    return (
        <>
            {!loaded && (
                <Skeleton pos="absolute" top={0} left={0} right={0} bottom={0} radius={0} style={{ zIndex: 0 }} />
            )}
            <Box
                pos="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                style={{
                    backgroundImage: `url(${cover})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    opacity: loaded ? 1 : 0,
                    transition: "opacity 0.15s ease",
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
                ref={imgRef}
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
                onLoad={() => setLoaded(true)}
            />
        </>
    );
}
