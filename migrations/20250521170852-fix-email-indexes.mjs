export default {
  async up(queryInterface, Sequelize) {
    // Get all current indexes
    const [results] = await queryInterface.sequelize.query(
      `SHOW INDEX FROM User WHERE Key_name LIKE 'email%' AND Key_name != 'PRIMARY'`
    );

    // Remove all duplicate email indexes
    for (const index of results) {
      await queryInterface.removeIndex('User', index.Key_name);
    }

    // Add back a single properly named unique index
    await queryInterface.addIndex('User', {
      fields: ['email'],
      name: 'unique_email',
      unique: true,
      type: 'BTREE'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the clean unique index
    await queryInterface.removeIndex('User', 'unique_email');
    
    // Note: We don't recreate all the duplicates in the down migration
    // as that would be counterproductive
  }
};