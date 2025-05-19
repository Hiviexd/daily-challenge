import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import utils from "../../utils";
import { IRound } from "../../interfaces/Round";

export default function useRounds() {
    return useQuery({
        queryKey: ["rounds"],
        queryFn: () => utils.apiCall({ method: "get", url: "/api/rounds" }),
    });
}

export function useCreateRound() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (round: Partial<IRound>) => {
            const response = await utils.apiCall({ method: "post", url: "/api/rounds/create", data: round });
            return utils.handleMutationResponse(response);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["rounds"] });
        },
    });
}
