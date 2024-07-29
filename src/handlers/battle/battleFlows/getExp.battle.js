import { getLevelTable } from '../../../db/game/game.db.js';
import { createResponse } from '../../../utils/response/createResponse.js';
import { updateCharacterStatus } from '../../../db/user/user.db.js';
import { config } from '../../../config/config.js';

export default async function getExpScene(responseCode, dungeon, socket) {
  if (responseCode === 1) {
    const btns = [{ msg: '다음', enable: true }];
    let battleLog = {};

    const player = dungeon.player;
    const level = player.level;
    const levelTable = await getLevelTable(level + 1);
    const { levelId, requiredExp, hp, mp, attack, defense, magic, speed, skillPoint } = levelTable;

    let monsterExp = 0;
    for (let i = 0; i < dungeon.monsters.length; i++) {
      const monster = dungeon.monsters[i];
      monsterExp += monster.exp;
    }

    const playerExp = monsterExp + player.experience;
    if (requiredExp <= playerExp) {
      player.updateLevel(level + 1, playerExp - requiredExp);

      await updateCharacterStatus(
        levelId,
        playerExp - requiredExp,
        player.maxHp + hp,
        player.maxHp + hp,
        player.maxMp + mp,
        player.maxMp + mp,
        player.attack + attack,
        player.defense + defense,
        player.magic + magic,
        player.speed + speed,
        player.playerId,
        player.characterClass,
      );
      player.hp = player.maxHp + hp;
      player.mp = player.maxMp + mp;

      const message = ` 경험치 ${monsterExp}를 획득했습니다!\n 
      공격력 +${attack} , 방어력 +${defense} , 마력 +${magic} , 스피드 +${speed}이 증가되었습니다!\n
      최대체력 +${hp} , 최대마나 +${mp}가 증가되었습니다!\n
      레벨 ${level}이 되었습니다!`;

      battleLog = {
        msg: message,
        typingAnimation: true,
        btns,
      };
    } else {
      battleLog = {
        msg: `경험치 ${monsterExp}를 획득했습니다!`,
        typingAnimation: true,
        btns,
      };
    }

    const responseBattleLog = createResponse('response', 'S_BattleLog', { battleLog });

    socket.write(responseBattleLog);

    dungeon.battleSceneStatus = config.sceneStatus.goToTown;
  }
}
