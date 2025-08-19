# 🌟 StarryBio

Welcome to **StarryBio**! This is a fully customizable, high-performance "link-in-bio" website template designed to be beautiful, fast, and incredibly easy to manage. Everything is controlled through a single `config.js` file, allowing you to create a personalized page without touching the main codebase.

It features a dynamic animated starfield background, a real-time status indicator, a dismissible announcement banner, and a sleek, modern interface that looks great on any device.

---

## 🚀 Live Demo

Check out a live version of the StarryBio template here:

**[https://a9x.pro/](https://a9x.pro/)**

---

## ✨ Features

* **Single-File Configuration**: Edit one simple `config.js` file to manage your profile, links, schedule, and all other content.
* **Animated Background**: A beautiful, lightweight, and interactive starfield with shooting stars that subtly react to mouse movement.
* **Dynamic Status Indicator**: Automatically show your real-time availability (e.g., Available, Busy, Sleeping) based on a schedule you define.
* **Announcement Banner**: Highlight important news or links with a dismissible banner at the top of your page.
* **High Performance**: Optimized for fast loading times with a focus on modern web standards to achieve high PageSpeed scores.
* **Easy to Deploy**: No complex build steps required. Simply edit the files and upload them to any static hosting provider.
* **Mobile-First Design**: Fully responsive layout that looks and works perfectly on desktops, tablets, and phones.

---

## 🚀 Getting Started

Setting up your StarryBio page is a simple three-step process.

### **Step 1: Download the Files**

Download the project files as a ZIP and extract them to a folder on your computer. Your folder should contain the following:


```
/
|-- assets/
|   |-- images/
|       |-- online.webp
|       |-- idle.webp
|       |-- dnd.webp
|       |-- offline.webp
|       |-- (your profile picture)
|       |-- (your favicon file)
|-- index.html
|-- style.css
|-- app.js
|-- config.js  <-- This is the only file you need to edit!
```


### **Step 2: Customize Your Content**

Open the `config.js` file in a text editor (like VS Code, Sublime Text, or even Notepad). This file contains all the text, links, and settings for your site.

Follow the extensive comments within the file to fill in your own information. You can add your name, bio, social media links, and set up your availability schedule. See the detailed **Configuration** section below for a full guide.

Make sure to then fill in the page title and favicon path in the head of `index.html`.

### **Step 3: Preview Your Site**

Simply open the `index.html` file in your web browser to see your changes live. As you edit and save the `config.js` file, just refresh the page in your browser to see the updates.

---

## ⚙️ Configuration (`config.js` Explained)

This is a detailed guide to every setting in your `config.js` file.

### **1. General Site Settings**
* `pageTitle`: The text that appears in the browser tab.

### **2. Announcement Banner**
* `enabled`: Set to `true` to show the banner, `false` to hide it.
* `text`: The message you want to display.
* `url`: The web address the banner will link to when clicked.

### **3. Profile Section**
* `name`: Your name or username.
* `title`: Your bio, job title, or a short tagline.
* `profileImage`: The path to your profile picture. It's best to place your image in the `assets/images/` folder and link to it here (e.g., `"assets/images/my-photo.webp"`).
* `profileImageFallback`: A full URL to an online image that will be used if your main `profileImage` fails to load.

### **4. Status Indicator**
This is an optional but powerful feature.
* `enabled`: Set to `true` to turn it on.
* `displayTimeZone`: Your local timezone. This ensures the schedule you set is displayed correctly to visitors. Find your timezone from this [list of tz database time zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).
* `defaultStatus`: The status that shows when no other schedule entry is active. This must match one of the keys in the `statuses` object (e.g., `"home"`).
* `statuses`: Define your custom statuses here.
    * `label`: The text that appears (e.g., "Available").
    * `color`: The hex color code for the status dot.
    * `icon`: The icon to use. Must match a key in the `icons` object (e.g., `"online"`).
    * `availabilityMessage`: A short message shown in the tooltip.
* `icons`: The paths to your status icon images.
* `schedule`: This is where you set your availability.
    * **IMPORTANT**: All times must be in **24-hour format** and in **UTC**. Use an online time converter to convert your local schedule to UTC.
    * `weekdays` / `weekends`: Add time blocks for when a certain status should be active.

### **5. Links Section**
This is an array where you add all your link buttons.
* `mainText`: The primary text on the button.
* `displaySubtitle`: The smaller text below the main text.
* `url`: The destination URL.
* `targetBlank`: `true` opens the link in a new tab.
* `iconSVGPath`: For icons, you can use the path data from an SVG. A great place to find these is [Simple Icons](https://simpleicons.org/). Click an icon, and you'll see the path data you can copy and paste here.
* `iconImageURL`: Alternatively, you can use a local image file (like for your Roblox link). Place the image in `assets/images/` and use the path here.
* `type: "discord"`: Use this special type for a Discord link to enable the "copy username" functionality. Make sure to fill in `subtitleToCopy` with the username you want copied.

### **6. Footer Section**
* `textPrefix`: The text before the year (e.g., "©").
* `textSuffix`: The text after the year (e.g., "Your Name").

---

## 🎨 Customization

* **Images**: To change the profile picture, favicon, or status icons, simply replace the corresponding files in the `assets/images/` folder with your own. For best performance, try to use `.webp` format.
* **Colors & Fonts**: Advanced style changes like colors, fonts, and animations can be made by editing the `style.css` file.

---

## 🐛 Troubleshooting

* **My layout is broken or looks unstyled.**
    * This project uses the full Tailwind CSS library loaded from a CDN. This error usually means the script is being blocked or failed to load. Check your internet connection. Also, ensure you haven't accidentally deleted the `<script src="https://cdn.tailwindcss.com"></script>` line from `index.html`.

* **My profile picture isn't showing up.**
    * Double-check that the path in `config.js` under `profileImage` exactly matches the file name and location in your `assets/images/` folder. Paths are case-sensitive!
    * If it still fails, the `profileImageFallback` URL will be used.

* **My announcement banner or status indicator isn't showing up.**
    * Make sure the `enabled` property for that feature is set to `true` in `config.js`.

* **I see `[object Object]` or the page is blank.**
    * This almost always means there is a syntax error in your `config.js` file, like a missing comma, quote, or curly brace. Carefully review your changes. You can use an online JavaScript validator to help find the error.

---

## 📄 License

This project is open-source and available under the GPL-3.0 License.
