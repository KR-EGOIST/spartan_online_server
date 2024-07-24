export const SQL_QUERIES = {
  FIND_USER_BY_USERNAME: 'SELECT * FROM Users WHERE username = ?',
  INSERT_USER: 'INSERT INTO Users (username) VALUES (?)',
  GET_JOB_INFO: 'SELECT * FROM Jobs WHERE job_id = ?',
  FIND_CHARACTER_BY_USER_ID_AND_CLASS: 'SELECT * FROM Characters WHERE user_id = ? AND job_id = ?',
  INSERT_CHARACTER:
    'INSERT INTO Characters (user_id, character_name, job_id, job_name, max_hp, max_mp, hp, mp, attack, defense, magic, speed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
  FIND_MONSTERS_BY_DUNGEON_MONSTERS: 'SELECT * FROM Dungeon_Monsters WHERE dungeon_id = ?',
  FIND_MONSTER_BY_MONSTERS: 'SELECT * FROM Monsters WHERE monster_id = ?',
  FIND_JOB_BY_ID: 'SELECT * FROM Jobs WHERE job_id = ?',
};
