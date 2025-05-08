DROP DATABASE IF EXISTS `db`;
CREATE database `db` ;
use `db`;

CREATE TABLE Occupation (
    OccupationID INT PRIMARY KEY,
    UniversityName VARCHAR(100) NOT NULL,
    DepartmentName VARCHAR(100) NOT NULL,
    Proficiency VARCHAR(50)
);

-- Create Grade Table
CREATE TABLE Grade (
    GradeID INT PRIMARY KEY,
    UniversityName VARCHAR(100) NOT NULL,
    DepartmentName VARCHAR(100) NOT NULL,
    PathName VARCHAR(100) NOT NULL,
    CurrentYear INT CHECK (CurrentYear BETWEEN 1 AND 10)
);

CREATE TABLE Teacher (
    TeacherID INT PRIMARY KEY,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL DEFAULT 'temp_password',
	Salt VARCHAR(255) NOT NULL DEFAULT 'temp_salt',
    Phone VARCHAR(20),
    OccupationID INT,
    isVerified BOOLEAN DEFAULT FALSE,
    verificationToken VARCHAR(255),
    verificationCode VARCHAR(6),
    verificationTokenExpires DATETIME,
    FOREIGN KEY (OccupationID) REFERENCES Occupation(OccupationID)
);

CREATE TABLE Student (
    StudentID  INT AUTO_INCREMENT PRIMARY KEY ,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL DEFAULT 'temp_password',
	Salt VARCHAR(255) NOT NULL DEFAULT 'temp_salt',
    Phone VARCHAR(20),
    GradeID INT,
    isVerified BOOLEAN DEFAULT FALSE,
    verificationToken VARCHAR(255),
    verificationCode VARCHAR(6),
    verificationTokenExpires DATETIME,
    FOREIGN KEY (GradeID) REFERENCES Grade(GradeID)
);

CREATE TABLE Lab (
    LabID INT PRIMARY KEY,
    LabTitle VARCHAR(100) NOT NULL,
    TeacherID INT,
    InstructionFile TEXT,
    FOREIGN KEY (TeacherID) REFERENCES Teacher(TeacherID)
);

CREATE TABLE PublicRoom (
    RoomID INT PRIMARY KEY,
    TeacherID INT NOT NULL,
    JoinedStudentsIDList JSON,
    CreationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (TeacherID) REFERENCES Teacher(TeacherID)
);

CREATE TABLE IndividualRoom (
    RoomID INT PRIMARY KEY,
    StudentID INT NOT NULL,
    LabID INT NOT NULL,
    CreationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (StudentID) REFERENCES Student(StudentID),
    FOREIGN KEY (LabID) REFERENCES Lab(LabID)
);

CREATE TABLE SessionHistory (
    SessionID INT PRIMARY KEY,
    SessionType VARCHAR(50) CHECK (SessionType IN ('Public', 'Private')),
    SessionDate DATE NOT NULL,
    StartTime TIME NOT NULL,
    EndTime TIME NOT NULL,
    SessionResultList TEXT,
    LastExecutedCode TEXT,
    RoomID INT NOT NULL,
    FOREIGN KEY (RoomID) REFERENCES PublicRoom(RoomID),
    CHECK (EndTime > StartTime)
);

-- Insert into Grade table first (referenced by Student)
INSERT INTO Grade (GradeID, UniversityName, DepartmentName, PathName, CurrentYear)
VALUES 
  (1, 'State University', 'Computer Science', 'Software Engineering', 3),
  (2, 'State University', 'Computer Science', 'Data Science', 2),
  (3, 'Tech Institute', 'Information Technology', 'Networking', 4);

-- Insert into Occupation (referenced by Teacher)
INSERT INTO Occupation (OccupationID, UniversityName, DepartmentName, Proficiency)
VALUES 
  (1, 'State University', 'Computer Science', 'Senior Professor'),
  (2, 'Tech Institute', 'Information Technology', 'Associate Professor');



