## 🚀 Deployment & Local Testing

This project is containerized using Docker to ensure a consistent, reliable, and scalable environment. The SMS-based architecture is purpose-built to operate in remote African regions where internet connectivity is sparse, allowing critical election data to be transmitted securely via standard cellular networks.

### Prerequisites
- [Docker](https://www.docker.com/) & Docker Compose
- [Ngrok](https://ngrok.com/) (for exposing the local webhook to Africa's Talking)
- An [Africa's Talking](https://africastalking.com/) account (Sandbox or Live)

### 1. Start the Application

First, create a `.env` file in the root directory with your Africa's Talking credentials:
```env
AFRICASTALKING_USERNAME=sandbox
AFRICASTALKING_API_KEY=your_api_key_here
```

Build and start the Node.js application and MongoDB database using Docker Compose:
```bash
docker-compose up -d --build
```
The dashboard will now be running locally at `http://localhost:3000`.

### 2. Connect Africa's Talking Webhook using Ngrok

To allow the Africa's Talking Sandbox to send SMS reports to your local Docker container, we use Ngrok to create a secure tunnel:

1. Open a new terminal and run:
   ```bash
   ngrok http 3000
   ```
2. Copy the `Forwarding` URL provided by Ngrok (e.g., `https://<your-ngrok-id>.ngrok-free.app`).
3. Log in to your Africa's Talking Sandbox Dashboard.
4. Navigate to **SMS** -> **SMS Callback URLs** -> **Incoming Messages**.
5. Paste your Ngrok URL followed by `/webhook` (e.g., `https://<your-ngrok-id>.ngrok-free.app/webhook`) and save.

### 🌍 Why This Architecture Matters

By coupling a lightweight, highly available Node.js backend with MongoDB, this platform is designed to scale horizontally as election reports surge. The reliance on standard SMS infrastructure (ingested via Africa's Talking webhooks) guarantees that election observers in the most remote areas can report fraud and tally metrics instantaneously without needing 3G/4G data coverage.