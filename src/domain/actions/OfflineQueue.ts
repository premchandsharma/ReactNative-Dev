import EncryptedStorage from "react-native-encrypted-storage";
import NetInfo from "@react-native-community/netinfo";

const OFFLINE_QUEUE_KEY = "offline_queue";

export interface QueuedRequest {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: any;
}

async function getQueue(): Promise<QueuedRequest[]> {
    const existing = await EncryptedStorage.getItem(OFFLINE_QUEUE_KEY);
    return existing ? JSON.parse(existing) : [];
}

async function saveQueue(queue: QueuedRequest[]) {
    await EncryptedStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

export async function addToQueue(request: QueuedRequest) {
    const queue = await getQueue();
    queue.push(request);
    await saveQueue(queue);
    console.log("📦 Request saved offline:", request.url);
}

export async function flushQueue() {
    const queue = await getQueue();
    if (queue.length === 0) return;

    console.log(`🚀 Flushing ${queue.length} queued requests...`);

    const newQueue: QueuedRequest[] = [];

    for (const req of queue) {
        try {
            const res = await fetch(req.url, {
                method: req.method,
                headers: req.headers,
                body: JSON.stringify(req.body),
            });

            if (!res.ok) {
                console.warn("❌ Failed to resend, keeping in queue:", req.url);
                newQueue.push(req);
            } else {
                console.log("✅ Successfully resent:", req.url);
            }
        } catch (err) {
            console.error("⚠️ Network error, keeping in queue:", req.url, err);
            newQueue.push(req);
        }
    }

    await saveQueue(newQueue);
}

export async function sendOrQueue(request: QueuedRequest): Promise<Response | void> {
    const state = await NetInfo.fetch();

    if (!state.isConnected) {
        await addToQueue(request);
        return;
    }

    // First flush old requests before sending this one
    await flushQueue();

    try {
        const res = await fetch(request.url, {
            method: request.method,
            headers: request.headers,
            body: JSON.stringify(request.body),
        });

        if (!res.ok) {
            console.warn("❌ Request failed, saving offline:", request.url);
            await addToQueue(request);
            return;
        } else {
            console.log("✅ Request sent successfully:", request.url);
            return res;
        }
    } catch (err) {
        console.error("⚠️ Network error, saving offline:", request.url, err);
        await addToQueue(request);
        return;
    }
}
