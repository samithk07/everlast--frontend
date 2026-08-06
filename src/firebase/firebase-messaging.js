import { getMessaging, isSupported } from "firebase/messaging";
import app from "./firebase";

let messaging = null;

export const initializeMessaging = async () => {
  const supported = await isSupported();

  if (!supported) {
    console.warn("Firebase Messaging is not supported.");
    return null;
  }

  messaging = getMessaging(app);

  return messaging;
};