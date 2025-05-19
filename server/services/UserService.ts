import User from "@models/userModel";
import { IUser } from "@interfaces/User";
import { IOsuUser } from "@interfaces/OsuApi";
import OsuApiService from "@services/OsuApiService";
import LogService from "@services/LogService";

class UserService {
    /**
     *  Create or update a user based on an osu! API response
     * @param userResponse - osu! API response
     * @param existingUser - optional existing user to update
     */
    public async createOrUpdateUser(userResponse: IOsuUser, existingUser: IUser | null = null): Promise<IUser> {
        const osuId = userResponse.id;
        const username = userResponse.username;
        const groups = ["user"];
        const osuGroups = userResponse.groups?.map((group) => group.id);

        let user = existingUser;

        if (!user) {
            user = new User({
                osuId,
                username,
                groups,
            });

            await user.save();
            LogService.generate(user.id, "Verified their account for the first time");
        } else {
            let saveTrigger = false;
            let oldUsername: string | undefined;

            if (user.username !== username) {
                oldUsername = user.username;
                user.username = username;
                saveTrigger = true;
            }

            if (saveTrigger) {
                await user.save();

                if (oldUsername) {
                    LogService.generate(user.id, `Username changed from "${oldUsername}" to "${username}"`);
                }
            }
        }

        // Mark dev users as spectators
        if (osuGroups?.includes(11)) {
            user.groups.push("spectator");
            await user.save();
        }

        return user;
    }

    /** Find or create a user
     * @param accessToken - osu! API access token
     * @param userInput - osu! username or osu! ID
     */
    public async findOrCreateUser(accessToken: string, userInput: string | number): Promise<IUser | null> {
        const user = await User.findByUsernameOrOsuId(userInput);

        if (user) return user;

        const userResponse = await OsuApiService.getUserInfo(accessToken, userInput);

        if (OsuApiService.isOsuResponseError(userResponse)) {
            return null;
        }

        return this.createOrUpdateUser(userResponse);
    }
}

export default new UserService();
