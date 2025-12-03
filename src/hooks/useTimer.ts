import { useState, useEffect } from "react";

export default function useTimer() {
    const [timeLeft, setTimeLeft] = useState<string>("0s");

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date();
            const nextMidnight = new Date();
            nextMidnight.setUTCHours(24, 0, 0, 0); // Next midnight UTC

            const timeDiff = nextMidnight.getTime() - now.getTime();

            if (timeDiff <= 0) {
                setTimeLeft("0s");
                return;
            }

            const totalSeconds = Math.floor(timeDiff / 1000);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            const parts: string[] = [];

            if (hours > 0) {
                parts.push(`${hours}h`);
            }
            if (minutes > 0) {
                parts.push(`${minutes}m`);
            }
            parts.push(`${seconds}s`);

            setTimeLeft(parts.join(" "));
        };

        // Update immediately
        updateTimer();

        // Set up interval to update every second
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, []);

    return timeLeft;
}
