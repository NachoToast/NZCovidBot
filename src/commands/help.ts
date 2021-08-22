import { Message } from 'discord.js';
import Command from '../interfaces/Command';

const commands: string[] = ['ping', 'list', 'config'];

const help: Command = {
    execute: async ({ message }: { message: Message }) => {
        message.channel.send(
            `NZ Covid Bot provides updates about new and removed locations of interest, and enables searching through them.\nType \`covid help <command>\` for more specific help on a particular command.\nBasic commands:\n${commands.join(
                ', '
            )}`
        );
    },
    help: async () => {},
};

export default help;
