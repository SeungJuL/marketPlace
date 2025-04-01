# MarketPlace

## Overview

MarketPlace is a web application inspired by platforms like Facebook Marketplace. Users can post items for sale, like posts, and engage in real-time chat with sellers.

## Features

- User authentication (login/logout)
- Create and manage posts
- Like and unlike posts
- Real-time chat between buyers and sellers
- My Page (change password, manage liked posts)
- Image storage using AWS S3
- Caching implemented with Redis for post retrieval

## Tech Stack

- **Backend:** Node.js, Express.js, MongoDB (Mongoose), Redis
- **Frontend:** Server-side rendering with EJS
- **Storage:** AWS S3 for image hosting
- **Architecture:** MVC pattern

## Installation & Setup

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/marketplace.git
   cd marketplace
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file in the root directory and add the following:
   ```plaintext
   PORT=your_port_number
   DB_URL=your_mongodb_connection_string
   SECRET_KEY=your_secret_key
   AWS_ACCESS_KEY=your_aws_access_key
   AWS_SECRET_KEY=your_aws_secret_key
   AWS_BUCKET_NAME=your_bucket_name
   ```
4. Start the server:
   ```sh
   npm run dev
   ```

## API Routes

### User Routes (`/api/user`)

- **POST** `/register` - Register a new user
- **POST** `/login` - User login
- **POST** `/logout` - User logout

### Post Routes (`/api/post`)

- **GET** `/list` - Get all posts
- **GET** `/detail/:id` - Get post details
- **POST** `/create-post` - Create a new post
- **DELETE** `/delete/:id` - Delete a post
- **PUT** `/:id/like` - Like a post
- **DELETE** `/:id/like` - Unlike a post

### Chat Routes (`/api/chat`)

- **GET** `/conversations` - Get chat conversations
- **POST** `/message` - Send a message

### My Page (`/api/mypage`)

- **GET** `/security` - View security settings
- **PUT** `/security` - Update password
- **GET** `/likes` - Get liked posts
- **DELETE** `/likes/:id` - Remove liked post
