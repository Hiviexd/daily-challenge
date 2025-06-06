import { Badge } from "@mantine/core";
import utils from "@utils/index";

interface IProps {
    rating: number;
}

export default function StarRatingBadge({ rating }: IProps) {
    const getTextColor = () => {
        if (rating >= 6.5) return "var(--mantine-color-yellow-4)";
        return "var(--mantine-color-black)";
    };

    return (
        <Badge
            variant="light"
            size="sm"
            style={{
                fontFamily: "Torus, sans-serif",
                fontSize: 12,
                backgroundColor: utils.getDifficultyColor(rating),
                color: getTextColor(),
            }}>
            ★ {rating.toFixed(2)}
        </Badge>
    );
}
