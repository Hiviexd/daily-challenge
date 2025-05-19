import { useQuery } from "@tanstack/react-query";
import utils from "@utils/index";

export default function useStaff() {
    return useQuery({
        queryKey: ["users"],
        queryFn: () => utils.apiCall({ method: "get", url: "/api/users/staff" }),
    });
}
