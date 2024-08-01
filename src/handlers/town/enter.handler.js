import Item from '../../classes/models/item.class.js';
import { config } from '../../config/config.js';
import { getMountingItem, getPotionItem } from '../../db/game/game.db.js';
import {
  getUserMountingItemsByCharacterId,
  getUserPotionItemsByCharacterId,
} from '../../db/user/items/items.db.js';
import {
  findCharacterByUserIdAndClass,
  findUserByUsername,
  getJobInfo,
  insertCharacter,
  insertUserByUsername,
} from '../../db/user/user.db.js';
import { getGameSession } from '../../session/game.session.js';
import { addUser, getUserBySocket } from '../../session/user.session.js';
import { handleError } from '../../utils/error/errorHandler.js';
import { createResponse } from '../../utils/response/createResponse.js';

const enterTownHandler = async ({ socket, payload }) => {
  try {
    const { nickname } = payload;
    const characterClass = payload.class;

    // DB에서 user, character 정보 가져오기
    let userInDB = await findUserByUsername(nickname);
    if (!userInDB) {
      await insertUserByUsername(nickname);
      userInDB = await findUserByUsername(nickname);
    }

    let character = await findCharacterByUserIdAndClass(userInDB.userId, characterClass);
    if (!character) {
      await insertCharacter(userInDB, characterClass);
      character = await findCharacterByUserIdAndClass(userInDB.userId, characterClass);
    }

    // 게임세션을 가져온다.
    const gameSession = getGameSession(config.session.townId);

    const { experience, critical, criticalAttack, avoidAbility, gold, worldLevel } = character;
    const { baseEffect, singleEffect, wideEffect } = await getJobInfo(character.jobId);

    // 소비 아이템 가져오기
    const potions = await getUserPotionItemsByCharacterId(character.characterId);
    const userPotions = [];
    for (const potion of potions) {
      const potionInfo = await getPotionItem(potion.itemId);
      const item = new Item(
        true,
        potionInfo.name,
        potionInfo.hpHealingAmount,
        potionInfo.mpHealingAmount,
        potionInfo.expHealingAmount,
        potion.quantity,
      );
      userPotions.push(item);
    }

    // 장착 아이템 가져오기
    const mountingItems = await getUserMountingItemsByCharacterId(character.characterId);
    const userMountingItems = [];
    for (const mountingItem of mountingItems) {
      const itemInfo = await getMountingItem(mountingItem.itemId);
      const item = new Item(
        false,
        itemInfo.itemName,
        itemInfo.itemHp,
        itemInfo.itemMp,
        itemInfo.requireLevel,
        mountingItem.quantity,
        itemInfo,
      );
      userMountingItems.push(item);
    }

    // 유저세션에 해당 유저가 존재하면 유저 데이터를 가져오고,
    // 그렇지 않으면 유저세션, 게임세션에 추가한다.
    const userExist = getUserBySocket(socket);
    const curUser = userExist
      ? userExist
      : addUser(
          socket,
          nickname,
          characterClass,
          experience,
          baseEffect,
          singleEffect,
          wideEffect,
          userPotions,
          userMountingItems,
          critical,
          criticalAttack,
          avoidAbility,
          gold,
          worldLevel,
        );
    if (!userExist) gameSession.addUser(curUser);

    const transformInfo = {
      posX: Math.random() * 18 - 9, // -9 ~ 9
      posY: 1.0,
      posZ: Math.random() * 16 - 8, // -8 ~ 8
      rot: Math.random() * 360, // 0 ~ 360
    };
    const statInfo = {
      level: character.characterLevel,
      hp: character.curHp,
      maxHp: character.maxHp,
      mp: character.curMp,
      maxMp: character.maxMp,
      atk: character.attack,
      def: character.defense,
      magic: character.magic,
      speed: character.speed,
    };
    const playerInfo = {
      playerId: curUser.playerId,
      nickname,
      class: characterClass,
      transform: transformInfo,
      statInfo,
    };
    const enterTownResponse = createResponse('response', 'S_Enter', {
      player: playerInfo,
    });

    // 플레이어 정보를 user에 추가한다.
    curUser.setPlayerInfo(playerInfo);

    console.log('현재 접속 중인 유저: ', gameSession.getAllUserIds());

    // 현재 유저에게 응답을 보냄
    socket.write(enterTownResponse);

    // ---------- enter 끝 -----------------

    const players = [];

    // 게임 세션에 저장된 모든 playerInfo를 가져옴
    for (const user of gameSession.users) {
      players.push(user.playerInfo);
    }

    // 각 유저에게 본인을 제외한 플레이어 데이터 전송
    for (const user of gameSession.users) {
      const filterdPlayers = players.filter((player) => player.playerId !== user.playerId);

      // console.log('filterdPlayers', filterdPlayers);

      // 해당 유저에게 다른 유저들을 스폰(해당 유저 제외)
      const spawnTownResponse = createResponse('response', 'S_Spawn', {
        players: filterdPlayers,
      });

      user.socket.write(spawnTownResponse);
    }

    // ---------- spawn 끝 -----------------
  } catch (err) {
    handleError(socket, err);
  }
};

export default enterTownHandler;
