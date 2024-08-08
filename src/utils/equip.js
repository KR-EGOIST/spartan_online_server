import Item from '../classes/models/item.class.js';
import { createResponse } from './response/createResponse.js';
import { getItemById } from '../assets/item.assets.js';

let statInfo;
const quantity = 1;
function updateEquip(equippedItem, findItem, user) {
  const { level, hp, maxHp, mp, maxMp, atk, def, magic, speed, critRate, avoidRate } =
    user.playerInfo.statInfo;

  const {
    itemId,
    itemType,
    name,
    addHp,
    addMp,
    addAttack,
    addDefense,
    addMagic,
    addSpeed,
    addAvoidance,
    addCritical,
  } = findItem;

  if (equippedItem !== 0) {
    const equippedItemInfo = getItemById(equippedItem);
    user.setItemId(itemType, itemId);

    statInfo = {
      level,
      hp:
        maxHp + addHp - equippedItemInfo.itemHp < hp ? maxHp + addHp - equippedItemInfo.itemHp : hp,
      maxHp: maxHp + addHp - equippedItemInfo.itemHp,
      mp:
        maxMp + addMp - equippedItemInfo.itemMp < mp ? maxMp + addMp - equippedItemInfo.itemMp : mp,
      maxMp: maxMp + addMp - equippedItemInfo.itemMp,
      atk: atk + addAttack - equippedItemInfo.itemAttack,
      def: def + addDefense - equippedItemInfo.itemDefense,
      magic: magic + addMagic - equippedItemInfo.itemMagic,
      speed: speed + addSpeed - equippedItemInfo.itemSpeed,
    };

    const updateCritical = critRate + addCritical - equippedItemInfo.itemCritical;
    const updateAvoidAbility = avoidRate + addAvoidance - equippedItemInfo.itemAvoidance;

    user.setStatInfo(statInfo);
    user.setCriAvoid(updateCritical, updateAvoidAbility);

    const isInven = user.findMountingItemByInven(equippedItem);
    const itemInfo = getItemById(equippedItem);
    if (!isInven) {
      const item = new Item(quantity, itemInfo);
      user.pushMountingItem(item);
      if (user.getMountingItemQuantity(itemId) === 1) {
        user.deleteMountingItem(itemId);
      } else {
        user.decMountingItem(itemId, quantity);
      }
    } else {
      user.addMountingItem(isInven.itemId, quantity);
      if (user.getMountingItemQuantity(itemId) === 1) {
        user.deleteMountingItem(itemId);
      } else {
        user.decMountingItem(itemId, quantity);
      }
    }

    const response = createResponse('response', 'S_Chat', {
      playerId: user.playerId,
      chatMsg: `[System] ${equippedItemInfo.itemName}을(를) 해제하고 ${name}을(를) 장착했습니다.`,
    });
    user.socket.write(response);
  } else {
    user.setItemId(itemType, itemId);

    statInfo = {
      level,
      hp: hp,
      maxHp: maxHp + addHp,
      mp: mp,
      maxMp: maxMp + addMp,
      atk: atk + addAttack,
      def: def + addDefense,
      magic: magic + addMagic,
      speed: speed + addSpeed,
    };

    const updateCritical = critRate + addCritical;
    const updateAvoidAbility = avoidRate + addAvoidance;

    user.setStatInfo(statInfo);
    user.setCriAvoid(updateCritical, updateAvoidAbility);

    if (user.getMountingItemQuantity(itemId) === 1) {
      user.deleteMountingItem(itemId);
    } else {
      user.decMountingItem(itemId, quantity);
    }

    const response = createResponse('response', 'S_Chat', {
      playerId: user.playerId,
      chatMsg: `[System] ${name}을(를) 장착했습니다.`,
    });
    user.socket.write(response);
  }
}

export default updateEquip;
