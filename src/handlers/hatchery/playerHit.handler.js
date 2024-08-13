import { getStatInfo } from '../../classes/DBgateway/playerinfo.gateway.js';
import { getHatcherySession } from '../../session/hatchery.session.js';
import { getUserBySocket } from '../../session/user.session.js';
import { createResponse } from '../../utils/response/createResponse.js';

const playerHitHatcheryHandler = async ({ socket, payload }) => {
  try {
    const player = await getUserBySocket(socket);
    const playerStatInfo = await getStatInfo();
    const hatcherySession = getHatcherySession();
    const boss = hatcherySession.boss;

    let decreaseHp = playerStatInfo.atk;
    const isCritical = Math.floor(Math.random() * 101);
    if (isCritical <= boss.critical) {
      const criticalRate = boss.criticalAttack / 100;
      decreaseHp = boss.power * criticalRate;
    }

    playerStatInfo.hp -= decreaseHp;
    if (playerStatInfo.hp <= 0) {
      playerStatInfo.hp = 0;
    }

    const playerHitResponse = createResponse('response', 'S_SetPlayerHpHatchery', {
      playerId: player.playerId,
      playerCurHp: playerStatInfo.hp,
    });
    hatcherySession.players.forEach((player) => {
      player.socket.write(playerHitResponse);
    });
  } catch (err) {
    handleError(socket, err);
  }
};

export default playerHitHatcheryHandler;
