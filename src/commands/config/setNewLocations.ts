import Command from '../../interfaces/Command';
import { Client, Message, Permissions } from 'discord.js';
import GuildConfigManager from '../../modules/guildConfigManager.module';

const setNew: Command = {
    execute: async ({
        settings,
        message,
        args,
        client,
    }: {
        settings: GuildConfigManager;
        message: Message;
        args: string[];
        client: Client;
    }) => {
        const authorPermissions = message.member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR);
        if (!authorPermissions) {
            message.channel.send('You need admin permissions to change the channel.');
            return;
        }
        if (message.guildId === null) return; // can only be done in servers, not dms

        const currentChannelID = settings.getChannel(message.guildId);

        if (currentChannelID !== false && (args[0] === undefined || args[0].replace(/[<#>]/g, '') === currentChannelID)) {
            settings.changeChannel(message.guildId, false);
            message.channel.send(`No longer announcing new locations of interest.`);
            return;
        }

        const newChannelID = args[0] !== undefined ? args[0].replace(/[<#>]/g, '') : message.channelId;

        settings.changeChannel(message.guildId, newChannelID);

        message.channel.send(`Now announcing new locations of interest in <#${newChannelID}>`);
    },
    help: async ({ message }: { message: Message }) => {
        message.channel.send(
            `Sets the channel to use for posting new locations of interest, usage: \`covid set <channel>\`\nLeave blank to disable entirely.\nAdmin use only.`
        );
    },
};

export default setNew;
