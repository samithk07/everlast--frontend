import { onMessage } from "firebase/messaging";
import { initializeMessaging } from "./firebase-messaging";
import { toast } from "react-toastify";
export const initializeForegroundNotifications = async () => {
  const messaging = await initializeMessaging();

  if (!messaging) return;

  onMessage(messaging, (payload) => {
    console.log("Foreground Notification:", payload);

    
  toast.info(
    `${payload.notification.title}\n${payload.notification.body}`
  );
  });
};