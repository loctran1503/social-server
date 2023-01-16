import 'dotenv/config'

export const isProduction = process.env.NODE_ENV==='production'

export const responseCode = {
    SUCCESS:200,
    INTERNAL_ERROR:500,
    NOT_FOUND:404,
    ALREADY_EXIST:400,
    INVALID:405
}