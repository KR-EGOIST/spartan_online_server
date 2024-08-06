import {
  sendDirectMessage,
  sendMessageToTeam,
  createTeamHandler,
  joinTeamHandler,
  leaveTeamHandler,
  inviteTeamHandler,
  acceptTeamHandler,
  kickMemberHandler,
  sendTeamList,
} from './town/chatCommand.handler.js';
import { equipHandler } from './town/equip.handler.js';
import buyItemHandler from './town/user.buyItem.js';
import sellItemHandler from './town/user.sellItem.js';
import { unquipHandler } from './town/unequip.handler.js';
import { skillPointHandler } from './town/skillPoint.handler.js';
import useHandler from './town/use.handler.js';


const chatCommands = new Map([
  // ---------common cmd begin------------
  ['w', sendDirectMessage],
  // ---------team begin------------
  ['t', sendMessageToTeam],
  ['createTeam', createTeamHandler],
  ['joinTeam', joinTeamHandler],
  ['leaveTeam', leaveTeamHandler],
  ['inviteTeam', inviteTeamHandler],
  ['acceptTeam', acceptTeamHandler],
  ['kickMember', kickMemberHandler],
  ['memlist', sendTeamList],
  // ---------team end------------
  ['buyItem', buyItemHandler],
  ['sellItem', sellItemHandler],
  ['equip', equipHandler],
  ['eq', equipHandler],
  ['unequip', unquipHandler],
  ['ueq', unquipHandler],
  ['upAbility', skillPointHandler],
]);

export default chatCommands;
