import { config } from '../../../../config/config.js';
import { createResponse } from '../../../../utils/response/createResponse.js';

export default function switchToActionScene(dungeon, socket) {
  const btns = [];
  const player = dungeon.player;

  btns.push({ msg: '일반 공격', enable: true });
  btns.push({ msg: '스킬 사용', enable: true });
  btns.push({ msg: '도망치기', enable: true });
  btns.push({ msg: '아이템 사용', enable: player.getItemsAccount() !== 0 });
  console.log(player.getItemsAccount());

  const battleLog = {
    msg: '무엇을 할까요?',
    typingAnimation: false,
    btns: btns,
  };

  if (dungeon.battleSceneStatus == config.sceneStatus.message) {
    const responseScreenDone = createResponse('response', 'S_ScreenDone', {});
    socket.write(responseScreenDone);
  }

  const responseBattleLog = createResponse('response', 'S_BattleLog', { battleLog });
  socket.write(responseBattleLog);

  dungeon.battleSceneStatus = config.sceneStatus.action;
}
