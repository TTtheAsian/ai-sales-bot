const axios = require('axios');

const GRAPH_API_URL = 'https://graph.facebook.com/v19.0'; // Use a recent version

/**
 * Sends a text message to a user via Instagram/Facebook Graph API
 * @param {string} recipientId - The user ID to send message to
 * @param {string} text - The text content
 * @param {string} accessToken - Page Access Token
 */
async function sendMessage(recipientId, text, accessToken) {
    try {
        const url = `${GRAPH_API_URL}/me/messages`;
        const payload = {
            recipient: { id: recipientId },
            message: { text: text }
        };

        const response = await axios.post(url, payload, {
            params: { access_token: accessToken }
        });

        return response.data;
    } catch (error) {
        console.error('Error sending message:', error.response ? error.response.data : error.message);
        throw error;
    }
}

module.exports = {
    sendMessage
};
