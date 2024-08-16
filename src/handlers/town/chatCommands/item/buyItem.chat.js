import { createResponse } from '../../../../utils/response/createResponse.js';
import isInteger from '../../../../utils/isInteger.js';
import { getItemById } from '../../../../assets/item.assets.js';
import Item from '../../../../classes/models/item.class.js';
import {
  addItem,
  getItem,
  getItemIdx,
  getPlayerInfo,
  pushItem,
  setGold,
} from '../../../../classes/DBgateway/playerinfo.gateway.js';

export const buyItem = async (user, message) => {
  // 유저가 사고 싶은 아이템 ID 가져오기
  const [id, quantity] = message.split(' ');
  const userInfo = await getPlayerInfo(user.socket);
  const buyItem = await getItemById(Number(id));

  if (!isInteger(id)) {
    const response = createResponse('response', 'S_Chat', {
      playerId: user.playerId,
      chatMsg: `[System] 아이템 ID(숫자)를(를) 입력하세요.`,
    });
    user.socket.write(response);
    return;
  }

  if (!isInteger(quantity)) {
    const response = createResponse('response', 'S_Chat', {
      playerId: user.playerId,
      chatMsg: `[System] 구매할 수량(숫자)을(를) 입력하세요.`,
    });
    user.socket.write(response);
    return;
  }

  if (Number(quantity) <= 0) {
    const response = createResponse('response', 'S_Chat', {
      playerId: user.playerId,
      chatMsg: `[System] 1개 이상만 구매할 수 있습니다. `,
    });
    user.socket.write(response);
    return;
  }

  if (!buyItem) {
    const response = createResponse('response', 'S_Chat', {
      playerId: user.playerId,
      chatMsg: `[System] 존재하는 아이템이 아닙니다. `,
    });
    user.socket.write(response);
    return;
  }

  if (buyItem.itemCost === -1) {
    const response = createResponse('response', 'S_Chat', {
      playerId: user.playerId,
      chatMsg: `[System] ${buyItem.itemName}은 던전에서만 드랍 가능한 아이템입니다. `,
    });
    user.socket.write(response);
    return;
  }

  const itemCost = buyItem.itemCost * Number(quantity);
  // 유저 골드가 충분할 경우
  if (userInfo.gold >= itemCost) {
    let potion = null;

    if (buyItem.itemType === 'potion') {
      // 소비 아이템
      const potionIdx = await getItemIdx(user.socket, buyItem.id);
      if (potionIdx === -1) {
        potion = new Item(Number(id), Number(quantity));
        await pushItem(user.socket, potion);
      } else {
        await addItem(user.socket, buyItem.id, Number(quantity));
      }

      await setGold(user.socket, userInfo.gold - itemCost);

      // 포션 아이템을 다시 가져오기 (업데이트 후)
      potion = await getItem(user.socket, buyItem.id);

      const response = createResponse('response', 'S_Chat', {
        playerId: user.playerId,
        chatMsg: `[System] ${buyItem.itemName} 을(를) ${Number(quantity)}개 구매가 완료되었습니다. 골드가 ${userInfo.gold} 남았습니다.`,
      });
      user.socket.write(response);

      // S_BuyItem 패킷 전송
      if (potion) {
        const buyItemResponse = createResponse('response', 'S_BuyItem', {
          item: {
            id,
            quantity: potion.quantity,
          },
          gold: userInfo.gold,
        });
        user.socket.write(buyItemResponse);
      }
      return;
    } else {
      // 장비 아이템
      let item = null;
      const itemIdx = await getItemIdx(user.socket, buyItem.id);
      if (itemIdx === -1) {
        item = new Item(Number(id), Number(quantity));
        await pushItem(user.socket, item);
      } else {
        await addItem(user.socket, buyItem.id, Number(quantity));
        item = await getItem(user.socket, buyItem.id);
      }
      await setGold(user.socket, userInfo.gold - itemCost);

      const response = createResponse('response', 'S_Chat', {
        playerId: user.playerId,
        chatMsg: `[System] ${buyItem.itemName} 아이템을 ${Number(quantity)}개 구매하였습니다. 남은 돈은 ${userInfo.gold} 입니다. `,
      });
      user.socket.write(response);

      // S_BuyItem 패킷 전송
      if (item) {
        const buyItemResponse = createResponse('response', 'S_BuyItem', {
          item: {
            id,
            quantity: item.quantity,
          },
          gold: userInfo.gold,
        });
        user.socket.write(buyItemResponse);
      }
      return;
    }
  } else {
    const response = createResponse('response', 'S_Chat', {
      playerId: user.playerId,
      chatMsg: `[System] 돈이 부족합니다. `,
    });
    user.socket.write(response);
    return;
  }
};