import { useQuery, useMutation, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import utils from "@utils/index";
import { ISettings } from "@interfaces/Settings";

export default function useSettings(): UseQueryResult<ISettings> {
    return useQuery({
        queryKey: ["settings"],
        queryFn: () => utils.apiCall({ method: "get", url: "/api/settings" }),
    });
}


export function useSyncMods() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const response = await utils.apiCall({ method: "post", url: "/api/settings/syncMods" });
            return utils.handleMutationResponse(response);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["settings"] });
        },
    });
}
