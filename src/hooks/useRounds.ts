import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { roundsAtom } from "../store/atoms";
import utils from "../../utils";
import { IRound } from "../../interfaces/Round";
import { useEffect } from "react";

export default function useRounds() {
    return useQuery({
        queryKey: ["rounds"],
        queryFn: () => utils.apiCall({ method: "get", url: "/api/rounds" }),
    });
}

export function useInfiniteRounds() {
    const [rounds, setRounds] = useAtom(roundsAtom);

    const query = useInfiniteQuery({
        queryKey: ["rounds"],
        queryFn: async ({ pageParam = null }) => {
            const params: any = {};
            if (pageParam) params.cursor = pageParam;
            const res = await utils.apiCall({ method: "get", url: "/api/rounds", params });
            return res;
        },
        getNextPageParam: (lastPage) => {
            return lastPage.nextCursor || undefined;
        },
        initialPageParam: null,
    });

    // Sync atom when query.data changes
    useEffect(() => {
        if (query.data) {
            const newRounds = query.data.pages.flatMap((page: any) => (Array.isArray(page.rounds) ? page.rounds : []));
            setRounds(newRounds);
        }
    }, [query.data, setRounds]);

    return { ...query, rounds, setRounds };
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
