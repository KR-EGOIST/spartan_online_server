import pools from '../database.js';
import { SQL_QUERIES } from './user.queries.js';
import { toCamelCase } from '../../utils/transformCase.js';

export const findUserByUsername = async (username) => {
  const [rows] = await pools.TOWN_MONSTER.query(SQL_QUERIES.FIND_USER_BY_USERNAME, [username]);

  return toCamelCase(rows[0]);
};

export const insertUser = async (username, password) => {
  await pools.TOWN_MONSTER.query(SQL_QUERIES.REGISTER_USER, [username, password]);
};

export const insertUserByUsername = async (username) => {
  await pools.TOWN_MONSTER.query(SQL_QUERIES.INSERT_USER, [username]);
};

export const findCharacterByUserIdAndClass = async (userId, jobId) => {
  const [rows] = await pools.TOWN_MONSTER.query(SQL_QUERIES.FIND_CHARACTER_BY_USER_ID_AND_CLASS, [
    userId,
    jobId,
  ]);

  return toCamelCase(rows[0]);
};

export const insertCharacter = async (user, jobId) => {
  const {
    jobName,
    baseHp,
    baseMp,
    baseAttack,
    baseDefense,
    baseMagic,
    baseSpeed,
    baseCritical,
    baseCriticalAttack,
    baseAvoidAbility,
  } = await getJobInfo(jobId);

  await pools.TOWN_MONSTER.query(SQL_QUERIES.INSERT_CHARACTER, [
    user.userId,
    user.username,
    jobId,
    jobName,
    baseHp,
    baseMp,
    baseHp,
    baseMp,
    baseAttack,
    baseDefense,
    baseMagic,
    baseSpeed,
    baseCritical,
    baseCriticalAttack,
    baseAvoidAbility,
  ]);
};

export const getJobInfo = async (jobId) => {
  const [rows] = await pools.TOWN_MONSTER.query(SQL_QUERIES.GET_JOB_INFO, [jobId]);

  return toCamelCase(rows[0]);
};

export const findJobById = async (jobId) => {
  const [rows] = await pools.TOWN_MONSTER.query(SQL_QUERIES.FIND_JOB_BY_ID, [jobId]);

  return toCamelCase(rows[0]);
};

export const getCharacterBaseEffectCode = async (jobId) => {
  const [rows] = await pools.TOWN_MONSTER.query(SQL_QUERIES.GET_CHARACTER_BASE_EFFECT_CODE, [
    jobId,
  ]);

  return toCamelCase(rows[0]).baseEffect;
};

export const getCharacterSingleEffectCode = async (jobId) => {
  const [rows] = await pools.TOWN_MONSTER.query(SQL_QUERIES.GET_CHARACTER_SINGLE_EFFECT_CODE, [
    jobId,
  ]);

  return toCamelCase(rows[0]).singleEffect;
};

export const getCharacterWideEffectCode = async (jobId) => {
  const [rows] = await pools.TOWN_MONSTER.query(SQL_QUERIES.GET_CHARACTER_WIDE_EFFECT_CODE, [
    jobId,
  ]);

  return toCamelCase(rows[0]).wideEffect;
};

export const updateCharacterStatus = async (user) => {
  const statInfo = user.playerInfo.statInfo;
  const { level, hp, maxHp, mp, maxMp, atk, def, magic, speed } = statInfo;
  const { experience, critical, criticalAttack, avoidAbility, gold, skillPoint } = user;
  const { weapon, armor, gloves, shoes, accessory, nickname, characterClass } = user;

  await pools.TOWN_MONSTER.query(SQL_QUERIES.UPDATE_CHARACTER_STATUS, [
    level,
    experience,
    hp,
    maxHp,
    mp,
    maxMp,
    atk,
    def,
    magic,
    speed,
    critical,
    criticalAttack,
    avoidAbility,
    gold,
    skillPoint,
    weapon,
    armor,
    gloves,
    shoes,
    accessory,
    nickname,
    characterClass,
  ]);
};
