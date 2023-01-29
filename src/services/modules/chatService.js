module.exports = class {
  constructor(chatDao) {
    this.chatDao = chatDao;
  }
  async getAllMessages() {
    try {
      return await this.chatDao.getAllMessages();
    } catch (error) {
      console.log(error);
    }
  }

  async saveMessage(message) {
    try {
      const newMessage = await this.chatDao.saveMessage(message);
      return newMessage;
    } catch (error) {
      console.log(error);
    }
  }

  async getAllMessagesByEmail(email) {
    try {
      const messages = await this.chatDao.getAllMessagesByEmail(email);
      return messages;
    } catch (error) {
      console.log(error);
    }
  }
};
