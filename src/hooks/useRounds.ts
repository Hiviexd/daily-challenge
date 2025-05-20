import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { roundsAtom } from "@store/atoms";
import utils from "@utils/index";
import { IRound } from "@interfaces/Round";
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

export function useUpdateRound(roundId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (round: { theme?: string; assignedUserId?: string; isPublished?: boolean }) => {
            const response = await utils.apiCall({ method: "put", url: `/api/rounds/${roundId}/update`, data: round });
            return utils.handleMutationResponse(response);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["rounds"] });
        },
    });
}

export function useUpdateRoundBeatmapId(roundId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { index: number; beatmapId: number | string | null }) => {
            const response = await utils.apiCall({
                method: "put",
                url: `/api/rounds/${roundId}/updateBeatmapId`,
                data,
            });
            return utils.handleMutationResponse(response);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["rounds"] });
        },
    });
}

export function useUpdateRoundBeatmapNote(roundId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { index: number; notes: string }) => {
            const response = await utils.apiCall({
                method: "put",
                url: `/api/rounds/${roundId}/updateBeatmapNote`,
                data,
            });
            return utils.handleMutationResponse(response);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["rounds"] });
        },
    });
}

export function useCheckRoundDuplicates(roundId: string) {
    return useMutation({
        mutationFn: async () => {
            const response = await utils.apiCall({ method: "get", url: `/api/rounds/${roundId}/checkDuplicates` });
            return response.warnings || [];
        },
    });
}
