// models/associations.js
import Teacher from "./Teacher.js";
import Student from "./student.js";
import Grade from "./grade.js";
import Occupation from "./occupation.js";
import Lab from "./lab.js";
import PublicRoom from "./PublicRoom.js";
import IndividualRoom from "./individualRoom.js";
import SessionHistory from "./sessionHistory.js";

const setupAssociations = () => {
    // Teacher-Occupation
    Teacher.belongsTo(Occupation, { foreignKey: 'OccupationID' });
    Occupation.hasMany(Teacher, { foreignKey: 'OccupationID' });

    // Student-Grade
    Student.belongsTo(Grade, { foreignKey: 'GradeID' });
    Grade.hasMany(Student, { foreignKey: 'GradeID' });

    // Lab-Teacher
    Lab.belongsTo(Teacher, { foreignKey: 'TeacherID' });
    Teacher.hasMany(Lab, { foreignKey: 'TeacherID' });

    // PublicRoom-Teacher
    PublicRoom.belongsTo(Teacher, { foreignKey: 'TeacherID' });
    Teacher.hasMany(PublicRoom, { foreignKey: 'TeacherID' });

    // IndividualRoom-Student-Lab
    IndividualRoom.belongsTo(Student, { foreignKey: 'StudentID' });
    Student.hasMany(IndividualRoom, { foreignKey: 'StudentID' });
    IndividualRoom.belongsTo(Lab, { foreignKey: 'LabID' });
    Lab.hasMany(IndividualRoom, { foreignKey: 'LabID' });

    // SessionHistory-PublicRoom
    SessionHistory.belongsTo(PublicRoom, { foreignKey: 'RoomID' });
    PublicRoom.hasMany(SessionHistory, { foreignKey: 'RoomID' });
};

export default setupAssociations;