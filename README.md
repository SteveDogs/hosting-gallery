🖼️ Modern Image Hosting
Modern image hosting with a beautiful Apple-style design and advanced gallery features.

✨ Features
4 gallery display modes: Mosaic, Grid, Compact, List
Smart search by image names
Filters: All, Large Files (>1MB), Recent (<7 days)
Sorting by date, name, size
Gallery statistics with file count and size calculation
Image previews in a modal window
Drag & Drop file upload
Responsive design for mobile devices
Apple-style with modern typography and animations

🛠️ Technologies
Backend: PHP 7.4+
Frontend: Vanilla JavaScript, CSS Grid, Flexbox
Database: MySQL/MariaDB
Styles: CSS3 with variables, backdrop-filter
Icons: Font Awesome 6.5

Configure the database:
sqlCREATE DATABASE image_hosting;
USE image_hosting;

CREATE TABLE images (
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(255) NOT NULL,
filename VARCHAR(255) NOT NULL,
upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

Configure the configuration:
bashcp config.example.php config.php
Edit config.php and enter your database details.
Create an upload folder:
bashmkdir uploads
chmod 777 uploads

Configure the web server (Apache/Nginx) for the project folder.

🖥️ System Requirements

PHP 7.4 or higher
MySQL 5.7+ / MariaDB 10.2+
Web server (Apache, Nginx)
GD or ImageMagick support (for image information)

📱 Screenshots
Gallery - Mosaic View
Show Image
Gallery - List View
Show Image
Image Preview
Show Image

🎨 Design Features

SF Pro Display font (official Apple font)
Dark theme with deep black background
Glass elements with backdrop-filter blur
Smooth animations with cubic-bezier functions
Responsive grid for all devices
Modern hover effects

🔧 Configuration

Setting IP for file deletion
In index.php, find the line:
phpif ($clientIp === '127.0.0.1') {
Replace IP with your own for file deletion capability.
Setting file size limits
In upload.php, adjust upload restrictions:
php// Maximum file size
ini_set('upload_max_filesize', '10M');
ini_set('post_max_size', '10M');

📁 Project Structure

├── index.php # Main page with gallery
├── upload.php # File upload handling
├── delete.php # File deletion
├── config.php # Database configuration (not in repository)
├── config.example.php # Configuration example
├── style.css # Main styles
├── gallery.js # JavaScript for gallery
├── uploads/ # Folder for uploaded files
└── README.md # Documentation

📄 License
This project is licensed under the MIT License. See LICENSE file for details.
