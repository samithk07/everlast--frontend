import { getToken } from "firebase/messaging";
import { initializeMessaging } from "./firebase-messaging";
import { api } from "../api/api";

export const requestNotificationPermission = async () => {
  try {
    if (!("Notification" in window)) {
      return;
    }

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      return;
    }

    const messaging = await initializeMessaging();

    if (!messaging) {
      return;
    }

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });

    if (!token) {
      return;
    }

    console.log("FCM Token:", token);

    // Save token in database
    await api.put("/user/fcm-token", {
      fcmToken: token,
    });

    console.log("FCM Token saved successfully.");

    return token;
  } catch (error) {
    console.error(error);
  }
};