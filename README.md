![steinhardt_color](https://github.com/JiayuDu0048/AdministratorAdmissionPage/assets/100020447/9fa55ddc-bcaa-4c96-b179-a81d32fce622)

<br>

# About This Page
The AdministratorAdmissionPage is a web platform developed for administrators at NYU to effectively manage and track the admission details of students participating in the summer Unity Program. The program, aimed at high school students interested in game design and coding, offers a comprehensive curriculum that blends principles of game design with hands-on coding experience using C# and Unity.

This website serves as a centralized hub where administrators can access up-to-date information on the status of admitted students, including session enrollments, contact information, and progress through the program's various stages. The platform facilitates a streamlined process for administrators to oversee and handle the influx of data associated with the summer program's operations.


# The site features:

- A secure login system for administrators to ensure data protection and confidentiality.
- An intuitive interface for viewing and managing student information, session details, and program status.
- An integrated system for uploading student data via CSV files, allowing for quick and efficient updates to the database.
- A dynamic dashboard that provides real-time insights into the student admission process, including the ability to perform CRUD operations on student records.




# To run the frontend:

Open the terminal, run the following:
- cd AdministratorAdmissionPage/front-end/src
- npm install
- npm run dev

# To run the backend:
Open another window in the terminal, run the following:
- cd AdministratorAdmissionPage/back-end/src
- npm install
- npm start

#### In addition, please create a .env file in the back-end directory. This file should contain: 
- CLIENT_URL
- MONGODB_URI
- SERVER_PORT
- SERVER_URL
#### If you need help with these setup information, please email tz2074@nyu.edu or contact Lesley Zhao in Slack.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
