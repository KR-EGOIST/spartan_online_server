import { getHatcherySession } from '../../session/hatchery.session.js';
import { getUserBySocket } from '../../session/user.session.js';
import { handleError } from '../../utils/error/errorHandler.js';
import { createResponse } from '../../utils/response/createResponse.js';

const moveHatcheryHandler = async ({ socket, payload }) => {
  try {
    const user = await getUserBySocket(socket);
    const hatcherySession = getHatcherySession();
    const players = hatcherySession.players;
    const { transform } = payload;

    user.setPosition(transform);

    const moveHatcheryResponse = createResponse('response', 'S_MoveAtHatchery', {
      playerId: user.playerId,
      transform,
    });

    for (const player of players) {
      if (player.playerId === user.playerId) {
        continue;
      }
      player.socket.write(moveHatcheryResponse);
    }
  } catch (err) {
    handleError(socket, err);
  }
};

export default moveHatcheryHandler;
