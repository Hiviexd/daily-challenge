import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { roundsAtom, roundsQueryStateAtom } from "@store/atoms";
import utils from "@utils/index";
import { IRound } from "@interfaces/Round";
import { useEffect } from "react";

export default function useRounds() {
    return useQuery({
        queryKey: ["rounds"],
        queryFn: () => utils.apiCall({ method: "get", url: "/api/rounds" }),
    });
}

export interface RoundsFilterParams {
    theme?: string;
    artistTitle?: string;
    date?: string;
    creator?: string;
}

export function useInfiniteRounds(params: RoundsFilterParams = {}) {
    const [rounds, setRounds] = useAtom(roundsAtom);
    const [, setQueryState] = useAtom(roundsQueryStateAtom);

    const query = useInfiniteQuery({
        queryKey: ["rounds", JSON.stringify(params)],
        queryFn: async ({ pageParam = null }) => {
            const cleanParams = Object.fromEntries(
                Object.entries(params).filter((entry) => entry[1] !== undefined && entry[1] !== "")
            );
            const queryParams: any = { ...cleanParams };
            if (pageParam) queryParams.cursor = pageParam;

            console.log("[useInfiniteRounds] Fetching with queryParams:", queryParams);
            const res = await utils.apiCall({ method: "get", url: "/api/rounds", params: queryParams });

            if (res.error) {
                utils.handleMutationResponse(res);
            }
            return res;
        },
        getNextPageParam: (lastPage) => {
            return lastPage.nextCursor || undefined;
        },
        initialPageParam: null,
    });

    // Sync atoms when query.data changes
    useEffect(() => {
        if (query.data) {
            const newRounds = query.data.pages.flatMap((page: any) => (Array.isArray(page.rounds) ? page.rounds : []));
            setRounds(newRounds);
        }
        setQueryState({
            isLoading: query.isLoading,
            isError: query.isError,
            hasNextPage: query.hasNextPage || false,
            isFetchingNextPage: query.isFetchingNextPage,
        });
    }, [
        query.data,
        query.isLoading,
        query.isError,
        query.hasNextPage,
        query.isFetchingNextPage,
        setRounds,
        setQueryState,
    ]);

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
        mutationFn: async (round: { theme?: string; assignedUserId?: string; startDate?: Date }) => {
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

export function useDeleteRound(roundId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const response = await utils.apiCall({ method: "delete", url: `/api/rounds/${roundId}/delete` });
            return utils.handleMutationResponse(response);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["rounds"] });
        },
    });
}

// Custom hook for managing rounds query from ListingPage
export function useRoundsQuery(params: RoundsFilterParams) {
    const infiniteQuery = useInfiniteRounds(params);
    return {
        fetchNextPage: infiniteQuery.fetchNextPage,
    };
}
