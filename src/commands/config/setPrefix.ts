import Command from '../../interfaces/Command';
import { Message, Permissions } from 'discord.js';
import GuildConfigManager from '../../modules/guildConfigManager.module';

const setPrefix: Command = {
    execute: async ({ settings, message, args }: { settings: GuildConfigManager; message: Message; args: string[] }) => {
        const authorPermissions = message.member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR);
        if (!authorPermissions) {
            message.channel.send("You need admin permissions to change bot's prefix.");
            return;
        }

        if (args[0] === undefined) {
            message.channel.send('Please specify a prefix, e.g. `covid prefix !covid`');
            return;
        }

        if (message.guildId === null) return;
        settings.changePrefix(message.guildId, args);

        message.channel.send(`Updated server prefixes to ${args.join(', ')}`);
    },
    help: async ({ message }: { message: Message }) => {
        message.channel.send(`Sets the bot prefix for the server, usage: \`covid prefix <prefix>\`\nAdmin use only.`);
    },
};

export default setPrefix;
