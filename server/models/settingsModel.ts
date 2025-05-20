import { ISettings, ISettingsStatics } from "../../interfaces/Settings";
import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema({
    mods: { type: Object, required: true },
});

SettingsSchema.statics.getSettingsConfig = async function () {
    // There can only be one settings object, if it's missing, create a new one
    const settings = await this.findOne({});
    if (!settings) {
        console.error("No settings config found in database, creating a new one");
        return this.create({});
    }
    return settings;
};

const Settings = mongoose.model<ISettings, ISettingsStatics>("Settings", SettingsSchema);

export default Settings;
