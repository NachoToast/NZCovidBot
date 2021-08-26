import fs from 'fs';

interface Config {
    [index: string]: {
        prefixes: string[];
        outputChannel: string | false;
    };
}

const defaultConfig = {
    prefixes: ['c'],
    outputChannel: false,
};

class GuildConfigManager {
    public config: Config;

    constructor() {
        try {
            this.config = JSON.parse(fs.readFileSync('guildConfig.json', 'utf-8'));
        } catch (error) {
            this.config = {};
            fs.writeFileSync('guildConfig.json', JSON.stringify({}, null, 4));
        }
    }

    private async saveConfig(): Promise<boolean> {
        try {
            const storedConfig = JSON.stringify(this.config, null, 4);
            fs.writeFileSync('guildConfig.json', storedConfig);
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    public getPrefixes(guildId: string): string[] {
        if (this.config[guildId] === undefined) {
            this.makeConfig(guildId);
            this.saveConfig();
        }
        return this.config[guildId].prefixes;
    }

    public getChannel(guildId: string): string | false {
        if (this.config[guildId] === undefined) {
            this.makeConfig(guildId);
            this.saveConfig();
        }
        return this.config[guildId].outputChannel;
    }

    public changePrefix(guildId: string, prefixes: string[]) {
        if (this.config[guildId] === undefined) this.makeConfig(guildId);
        this.config[guildId].prefixes = prefixes;
        this.saveConfig();
    }

    public changeChannel(guildId: string, channel: string | false) {
        if (this.config[guildId] === undefined) this.makeConfig(guildId);
        this.config[guildId].outputChannel = channel;
        this.saveConfig();
    }

    private makeConfig(guildId: string) {
        this.config[guildId] = {
            outputChannel: false,
            prefixes: defaultConfig.prefixes,
        };
    }

    public removeConfig(guildId: string) {
        delete this.config[guildId];
        this.saveConfig();
    }
}

export default GuildConfigManager;
