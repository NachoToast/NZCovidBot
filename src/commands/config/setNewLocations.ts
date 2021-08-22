import Command from '../../interfaces/Command';
import { Message, Permissions } from 'discord.js';
import GuildConfigManager from '../../modules/guildConfigManager.module';

const setNew: Command = {
    execute: async ({ settings, message, args }: { settings: GuildConfigManager; message: Message; args: string[] }) => {
        const authorPermissions = message.member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR);
        if (!authorPermissions) {
            message.channel.send('You need admin permissions to change the channel.');
            return;
        }
        if (message.guildId === null) return;

        if (args[0] === undefined) {
            settings.changeChannel(message.guildId, false);
            message.channel.send(`No longer announcing new locations of interest.`);
        } else {
            settings.changeChannel(message.guildId, args[0].replace(/[<#>]/g, ''));
            message.channel.send(`Now announcing new locations of interest in ${args[0]}`);
        }
    },
    help: async ({ message }: { message: Message }) => {
        message.channel.send(
            `Sets the channel to use for posting new locations of interest, usage: \`covid setNew <channel>\`\nLeave blank to disable entirely.\nAdmin use only.`
        );
    },
};

export default setNew;
