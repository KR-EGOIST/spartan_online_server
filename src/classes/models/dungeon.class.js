import { config } from '../../config/config.js';
import { getDungeonItems, getMountingItem, getPotionItem } from '../../db/game/game.db.js';
import Item from './item.class.js';
import Monster from './monster.class.js';

class InstanceDungeon {
  constructor(userId, player, dungeonCode) {
    this.id = userId;
    this.player = player;
    this.monsters = [];
    this.battleSceneStatus = config.sceneStatus.message;
    this.targetMonsterIdx = 0;
    this.currentAttackType = config.attackType.normal;
    this.pushDungeonItems(dungeonCode);
    this.selectItem = null;
  }

  addMonster(idx, id, hp, power, name, effectCode, exp, gold, critical, criticalAttack) {
    const monster = new Monster(
      idx,
      id,
      hp,
      power,
      name,
      effectCode,
      exp,
      gold,
      critical,
      criticalAttack,
    );
    this.monsters.push(monster);
  }

  removeMonster(idx) {
    const target = this.monsters.findIndex((monster) => monster.idx == idx);
    this.monsters.splice(target, 1);
  }

  initTargetIdx() {
    this.targetMonsterIdx = 0;
  }

  accTargetIdx() {
    this.targetMonsterIdx++;

    return this.targetMonsterIdx;
  }

  setTargetIdx(idx) {
    this.targetMonsterIdx = idx;
  }

  getAliveIdx() {
    const idx = this.monsters.findIndex((monster) => monster.isDead === false);

    return idx;
  }

  isMonstersAllDead() {
    const result = this.monsters.find((monster) => monster.isDead === false);

    if (result === undefined) {
      return true;
    } else {
      return false;
    }
  }

  async pushDungeonItems(dungeonCode) {
    this.items = [];
    this.mountingItems = []; // random mounting item list
    this.potions = []; // random potion list

    const dungeonItems = await getDungeonItems(dungeonCode + 5000);
    for (const item of dungeonItems) {
      item.isPotion = item.isPotion && item.isPotion[0] === 1;
      if (item.isPotion) {
        const potionInfo = await getPotionItem(item.itemId);
        const potion = new Item(
          item.itemId,
          true,
          potionInfo.name,
          potionInfo.hpHealingAmount,
          potionInfo.mpHealingAmount,
          potionInfo.expHealingAmount,
          dungeonCode, // quantity: 1던전에선 포션 1개, 4던전에선 4개 지급
        );
        this.potions.push(this.items.length); // items에 저장될 idx
        this.items.push(potion);
      } else {
        const itemInfo = await getMountingItem(item.itemId);
        const mountingItem = new Item(
          item.itemId,
          false,
          itemInfo.itemName,
          itemInfo.itemHp,
          itemInfo.itemMp,
          itemInfo.requireLevel,
          1,
          itemInfo,
        );
        for (let i = 0; i < item.itemProbability; i++) {
          // 확률 90% = 90개, 1% = 1개 넣어줌
          this.mountingItems.push(this.items.length); // items에 저장될 idx
        }
        this.items.push(mountingItem);
      }
    }
  }

  getRandomItem() {
    const potionOrItem = Math.floor(Math.random() * 10); // 0 ~ 9
    if (potionOrItem < 7) {
      // 70% 확률로 포션중 하나
      return this.items[this.potions[Math.floor(Math.random() * this.potions.length)]];
    } else {
      // 30% 확률로 아이템중 하나(이미 확률적으로 들어있음)
      return this.items[this.mountingItems[Math.floor(Math.random() * this.mountingItems.length)]];
    }
  }
}

export default InstanceDungeon;
