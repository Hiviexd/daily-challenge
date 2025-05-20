import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import utils from "@utils/index";
import { UserGroupAction } from "@interfaces/User";

export function useStaff() {
    return useQuery({
        queryKey: ["staff"],
        queryFn: () => utils.apiCall({ method: "get", url: "/api/users/staff" }),
    });
}

export function useSpectators() {
    return useQuery({
        queryKey: ["spectators"],
        queryFn: () => utils.apiCall({ method: "get", url: "/api/users/spectators" }),
    });
}

export function useUser(userInput: string) {
    return useQuery({
        queryKey: ["users", userInput],
        queryFn: () => utils.apiCall({ method: "get", url: `/api/users/${userInput}` }),
        enabled: !!userInput,
    });
}

export function useGroupMove(userInput: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ group, action }: { group: string; action: UserGroupAction }) => {
            const response = await utils.apiCall({
                method: "patch",
                url: `/api/users/${userInput}/groupMove`,
                data: { group, action },
            });
            return utils.handleMutationResponse(response);
        },

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users", userInput] });
            queryClient.invalidateQueries({ queryKey: ["staff"] });
            queryClient.invalidateQueries({ queryKey: ["spectators"] });
        },
    });
}
