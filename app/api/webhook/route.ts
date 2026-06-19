/**
 * WHATSAPP CLOUD API + GEMINI AI HANDLER
 * This file integrates the Meta Webhook with your Gemini "Second Brain" logic.
 */

// Note: To resolve the environment compilation error, we use a relative path.
// Ensure your gemini.ts file exists at 'lib/gemini.ts' relative to your root.
import { generateChatResponse } from "../../../utils/gemini"; 

const VERIFY_TOKEN = "BRAIN_OS_IS_AMAZING"; 
const ACCESS_TOKEN = "EAANGzhafN5ABQ11Bg7eZAzftdZCa0pRAC9ZAuBr9OciIILPfmWzYgXPfPPiP6pfI1lJniVjqopmmZAql3I7T34LhjRtMIDz5lVoeR6ZBGpGI6GXeHSejwykOS05gDeUFwAGV3kmhFe5a0tz7nGQ8FT3uzLGAcLCzYA0NLuHIdpi1t5Wb94mO1KHBUfXgmoiWYMWuoHdGEVMMlL7OOcCPqGD71DzV7PZCjHT47RPThXee8KGnLvAwsFPBZCedhpn4zl7pX8F0E28l7CU5RIWh2uMEcFv"; 
const PHONE_NUMBER_ID = "942796875590469"; 

/**
 * 1. THE HANDSHAKE (GET)
 * Validates your server when you click "Verify and Save" in the Meta Dashboard.
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        return new Response(challenge, {
            status: 200,
            headers: { "Content-Type": "text/plain" },
        });
    }
    return new Response("Forbidden", { status: 403 });
}

/**
 * 2. THE MESSAGE RECEIVER (POST)
 * This runs every time a user sends a message to your WhatsApp number.
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // Extract the message details from the WhatsApp JSON structure
        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        const message = value?.messages?.[0];

        if (message && message.text?.body) {
            const senderPhone = message.from;
            const userQuestion = message.text.body;

            console.log(`📩 Processing WhatsApp query from ${senderPhone}: ${userQuestion}`);

            /**
             * STEP: RETRIEVE CONTEXT & HISTORY
             * For your hobby project, you can start with these mock values
             * and later replace them with real database calls.
             */
            const mockHistory = "User: Hello. Bot: Hi there, I'm your Second Brain.";
            const mockContext = "NoteVault is a personal knowledge management system.";

            // CALL YOUR GEMINI AGENT (imported from gemini.ts)
            const aiResponse = await generateChatResponse(mockHistory, mockContext, userQuestion);

            /**
             * STEP: HANDLE ACTIONS
             * If the AI decides an action is needed (like saving a note), handle it here.
             */
            if (aiResponse.action === "save") {
                console.log(`💾 AI requested to SAVE ${aiResponse.category}: ${aiResponse.content}`);
                // Implement your database save logic here
            }

            // SEND THE REPLY BACK TO WHATSAPP
            await sendWhatsAppMessage(senderPhone, aiResponse.reply);
        }

        // Always respond with 200 OK to Meta
        return new Response(JSON.stringify({ status: 'ok' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("❌ Webhook Error:", error);
        return new Response(JSON.stringify({ error: "Internal Error" }), { status: 500 });
    }
}

/**
 * HELPER: Meta Graph API Fetch
 */
async function sendWhatsAppMessage(to: string, text: string) {
    const url = `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: to,
                type: "text",
                text: { body: text },
            }),
        });
        
        if (!response.ok) {
            const errData = await response.json();
            console.error("❌ WhatsApp API Error:", errData);
        }
    } catch (err) {
        console.error("❌ Network Error sending WhatsApp message:", err);
    }
}