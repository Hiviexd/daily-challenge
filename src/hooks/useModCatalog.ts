import { useQuery } from "@tanstack/react-query";
import utils from "@utils/index";
import { IModsCatalogResponse } from "@interfaces/Mod";

export default function useModCatalog(enabled = true) {
    return useQuery({
        queryKey: ["modCatalog", "v2"],
        queryFn: () => utils.apiCall({ method: "get", url: "/api/settings/mods" }) as Promise<IModsCatalogResponse>,
        staleTime: 1000 * 60 * 60,
        enabled,
        retry: 2,
    });
}
