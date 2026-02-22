/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} username
 * @property {string} email
 * @property {string} [created]
 */

/**
 * @typedef {Object} LoginResponse
 * @property {string} token
 * @property {User} user
 */

/**
 * @typedef {Object} Post
 * @property {number} id
 * @property {number} author
 * @property {string} title
 * @property {string} content
 * @property {string} date
 */

/**
 * @typedef {Object} PostLike
 * @property {number} id
 * @property {number} user
 * @property {number} post
 * @property {string} created
 */

/**
 * @typedef {Object} CommentNode
 * @property {number} id
 * @property {string} author
 * @property {string} content
 * @property {string} created
 * @property {CommentNode[]} replies
 */

/**
 * @typedef {Object} CommentLike
 * @property {number} id
 * @property {number} user
 * @property {number} comment
 * @property {string} created
 */

/**
 * @typedef {Object} ApiError
 * @property {number} status
 * @property {string} message
 * @property {any} details
 */
