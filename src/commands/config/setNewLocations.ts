import Command from '../../interfaces/Command';
import { Client, GuildMember, Message, MessageEmbed, Permissions, TextChannel } from 'discord.js';
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

        const oldChannelID = settings.getChannel(message.guildId);
        const newChannelID = args[0] === undefined ? message.channelId : args[0].replace(/[<#>]/g, '');

        if (newChannelID === oldChannelID) {
            settings.changeChannel(message.guildId, false);
            message.channel.send(`No longer announcing new locations of interest.`);
            return;
        }
        const newChannel = (await client.channels.fetch(newChannelID)) as TextChannel;
        const myPerms = newChannel.permissionsFor(message.guild?.me as GuildMember);
        const canSend = myPerms.has(Permissions.FLAGS.SEND_MESSAGES);
        const canView = myPerms.has(Permissions.FLAGS.VIEW_CHANNEL);
        const canLink = myPerms.has(Permissions.FLAGS.EMBED_LINKS);

        const isValidChannel = canSend && canView && canLink;

        if (!isValidChannel) {
            let msg = [];
            if (!canView) msg.push(`I can't view that channel.`);
            if (!canSend) msg.push(`I can't send messages in that channel.`);
            if (!canLink) msg.push(`I can't embed links in that channel.`);
            message.channel.send(msg.join('\n'));
            return;
        }

        settings.changeChannel(message.guildId, newChannelID);

        message.channel.send(`Now announcing new locations of interest in <#${newChannelID}>`);
    },
    help: async ({ message, myPerms }: { message: Message; myPerms: Permissions }) => {
        if (!myPerms.has(Permissions.FLAGS.EMBED_LINKS)) {
            message.channel.send(
                `Sets the channel to post new locations of interest in.\nUsage: \`covid set <channel>\`\nGive me \`Embed Messages\` permissions for a more detailed help menu.`
            );
            return;
        }

        const embed = new MessageEmbed()
            .setColor('#ffcc00')
            .setTitle('Set Channel Command')
            .setDescription(
                "Sets the channel to post new locations of interest in.\nThis can be quite spammy, so having a dedicated channel is recommended.\nUse 'disable' or 'none' to turn off new location messages."
            )
            .setFooter(`NZ Covid Bot`, 'https://cdn.discordapp.com/attachments/879001616265650207/879001636100534382/iconT.png')
            .addField(`Usage`, 'covid set <channel>', true)
            .addField('Requirements', 'Administrator', true)
            .addField(`Examples`, `covid set <#${message.channelId}>\ncovid set ${message.channelId}\ncovid set disable`);
        message.channel.send({ embeds: [embed] });
    },
};

export default setNew;
