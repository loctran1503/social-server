import 'dotenv/config'

export const isProduction = process.env.NODE_ENV==='production'
export const BLOCKING_MESSAGE_DURATION = 3000
export const MESSAGE_LIMIT = 10


export const REDIT_SOCKET_ID_LIST='socketList'
export const REDIT_CHAT_BLOCKING = 'chatBlocking'
export const REDIT_CHAT_ROOM_SOCKET_LIST = 'chatroom-user-socket-id-list'

export const regexExp = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

export const responseCode = {
    SUCCESS:200,
    INTERNAL_ERROR:500,
    NOT_FOUND:404,
    ALREADY_EXIST:400,
    INVALID:405
}