import { useQuery, UseQueryResult } from "@tanstack/react-query";
import utils from "@utils/index";
import { ISettings, IModsInfo } from "@interfaces/Settings";

export default function useSettings(): UseQueryResult<ISettings> {
    return useQuery({
        queryKey: ["settings"],
        queryFn: () => utils.apiCall({ method: "get", url: "/api/settings" }),
    });
}

export function useModsInfo(): UseQueryResult<IModsInfo> {
    return useQuery({
        queryKey: ["modsInfo"],
        queryFn: () => utils.apiCall({ method: "get", url: "/api/settings/modsInfo" }) as Promise<IModsInfo>,
    });
}
