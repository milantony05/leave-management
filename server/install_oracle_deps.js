/**
 * This file provides instructions for installing Oracle Instant Client
 * which is required for the oracledb Node.js module to work.
 */

console.log(`
==========================================
ORACLE INSTANT CLIENT INSTALLATION GUIDE
==========================================

The Leave Management System now uses Oracle Express 11g. To run this application,
you need to install Oracle Instant Client, which is a requirement for the oracledb Node.js package.

Installation Instructions:

Windows:
1. Download the Basic and SDK packages from Oracle: 
   https://www.oracle.com/database/technologies/instant-client/winx64-64-downloads.html
   - Choose "Instant Client Basic" and "Instant Client SDK" for your platform
   - For Oracle 11g compatibility, use version 21.x

2. Extract both packages to the same directory (e.g., C:\\oracle\\instantclient_21_x)

3. Add the instant client directory to your PATH:
   - Right-click "This PC" > Properties > Advanced system settings > Environment Variables
   - Add the path to the instant client directory to the PATH variable

4. Restart your command prompt or PowerShell

macOS:
1. Install using Homebrew:
   brew install instantclient-basic instantclient-sdk

Linux:
1. Download the Basic and SDK packages from Oracle:
   https://www.oracle.com/database/technologies/instant-client/linux-x86-64-downloads.html

2. Install the packages:
   sudo apt-get install libaio1  # For Debian/Ubuntu
   sudo yum install libaio       # For RedHat/CentOS
   
   sudo unzip instantclient-basic-*.zip -d /opt/oracle
   sudo unzip instantclient-sdk-*.zip -d /opt/oracle

3. Set environment variables:
   export LD_LIBRARY_PATH=/opt/oracle/instantclient_21_x:$LD_LIBRARY_PATH

After installing Oracle Instant Client, you can run:
npm install
npm run setup-db
npm start

For more details, visit: https://oracle.github.io/node-oracledb/INSTALL.html
`);

console.log(`
==========================================
ORACLE XE 11g INSTALLATION GUIDE
==========================================

You also need to install Oracle Database Express Edition 11g:

1. Download Oracle Database Express Edition 11g Release 2:
   https://www.oracle.com/database/technologies/xe-prior-releases.html

2. Install the database following Oracle's instructions for your platform

3. During installation, remember the password you set for the SYS and SYSTEM accounts

4. After installation, create a new user for the leave management application:
   - Launch SQL*Plus or SQL Developer
   - Log in as SYSTEM with the password you created during installation
   - Run the following commands:

     CREATE USER leavemanagement IDENTIFIED BY leavemanagement;
     GRANT CONNECT, RESOURCE, DBA TO leavemanagement;
     GRANT CREATE SESSION TO leavemanagement;
     GRANT CREATE TABLE TO leavemanagement;
     GRANT CREATE SEQUENCE TO leavemanagement;
     GRANT UNLIMITED TABLESPACE TO leavemanagement;

5. Update the .env file in the server directory with your Oracle connection details:
   ORACLE_USER=leavemanagement
   ORACLE_PASSWORD=leavemanagement
   ORACLE_CONNECTION_STRING=localhost:1521/XE

6. Run the setup script to create the database schema:
   npm run setup-db
`); 