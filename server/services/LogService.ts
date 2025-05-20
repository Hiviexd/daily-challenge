import Log from "@models/logModel";

class LogService {
    /**
     * Create a log for a user action
     * @param userId Mongo ID of action user
     * @param action Action
     */
    public async generate(userId: string, action: string): Promise<void> {
        const log = new Log({ user: userId, action });
        await log.save();
    }
}

export default new LogService();
