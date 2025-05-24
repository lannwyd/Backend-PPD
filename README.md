# IoT Lab - Remote Learning Platform for IoT

## Overview
The Internet of Things (IoT) is a crucial area in modern technology that connects physical devices to the Internet for automation and control. Learning IoT traditionally requires physical tools like Arduino boards, which aren't always accessible to students. 

IoT Lab is a web application designed to help university students study IoT in a more accessible and practical way. The platform enables students to write code, test it, and observe real-time results through a live video stream of connected hardware. It also supports interactive sessions with teachers for demonstrations and Q&A.

## Key Features
- Remote access to real IoT hardware
- Live video streaming of device operations
- Interactive coding environment
- Teacher-student collaboration tools
- Real-time code execution feedback

## System Requirements
To run the source code locally, you'll need the following tools installed and added to your system PATH:

1. **AVRDUDE** v8.0 (Windows x86) - For microcontroller programming
2. **Arduino CLI** 1.2.0 - For Arduino toolchain integration
3. **FFmpeg** - For video streaming functionality

## Getting Started
1. Clone this repository
2. Install the required dependencies listed above
3. Configure the system paths to include all required tools
4. Follow the setup instructions in the documentation

   ### Available Scripts:
# Start the main application server
npm run start:server1

# Start the lab hardware control server
npm run start:server2

# Start the meeting/WebRTC server
npm run start:server3

# Start both main application and lab servers together
npm run start:both

# Start main application and meeting servers together
npm run start:servers

# Start all three servers simultaneously
npm run start:all

## Project Structure
The project combines both software and hardware components to create a complete educational experience that eliminates the need for students to own physical components.

## Contribution
We welcome contributions to this project. Please fork the repository and submit pull requests for any improvements or bug fixes.

