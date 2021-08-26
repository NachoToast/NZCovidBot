import Command from '../../interfaces/Command';
import { Message, MessageEmbed, Permissions } from 'discord.js';
import GuildConfigManager from '../../modules/guildConfigManager.module';

const setPrefix: Command = {
    execute: async ({ settings, message, args }: { settings: GuildConfigManager; message: Message; args: string[] }) => {
        const authorPermissions = message.member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR);
        if (!authorPermissions) {
            message.channel.send("You need admin permissions to change bot's prefix.");
            return;
        }

        if (message.guildId === null) return; // can only be done in servers, not dms

        if (args[0] === undefined) {
            message.channel.send('Cleared server-specific prefixes');
            settings.changePrefix(message.guildId, []);
            return;
        }

        settings.changePrefix(
            message.guildId,
            args.filter((e) => e !== 'covid')
        );

        message.channel.send(`Updated server prefixes to ${args.filter((e) => e !== 'covid').join(', ')}`);
    },
    help: async ({ message, myPerms }: { message: Message; myPerms: Permissions }) => {
        if (!myPerms.has(Permissions.FLAGS.EMBED_LINKS)) {
            message.channel.send(
                `Sets the bot prefix for this server.\nUsage: \`covid prefix <prefixes>\`\nGive me \`Embed Messages\` permissions for a more detailed help menu.`
            );
            return;
        }

        const embed = new MessageEmbed()
            .setColor('#ffcc00')
            .setTitle('Set Prefix Command')
            .setDescription(
                "Sets the bot prefix for this server.\nCan specify 1 or more prefixes, separated by spaces.\n'covid' will always be a prefix."
            )
            .setFooter(`NZ Covid Bot`, 'https://cdn.discordapp.com/attachments/879001616265650207/879001636100534382/iconT.png')
            .addField(`Usage`, 'covid prefix <prefixes>', true)
            .addField('Requirements', 'Administrator', true)
            .addField(`Examples`, `covid prefix c\ncovid prefix c! c19\ncovid prefix !covid`)
            .addField('Related Commands', `config`);
        message.channel.send({ embeds: [embed] });
    },
};

export default setPrefix;
