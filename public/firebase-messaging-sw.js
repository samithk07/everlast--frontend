
/* global importScripts, firebase */
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
);

firebase.initializeApp({
   apiKey: "AIzaSyBSvti_FfPkfhooXzMYDaO1l8FS2ZgyLSk",
  authDomain: "everlast-9aa72.firebaseapp.com",
  projectId: "everlast-9aa72",
  storageBucket: "everlast-9aa72.firebasestorage.app",
  messagingSenderId: "166439080660",
  appId: "1:166439080660:web:38c5aecce9b851117fe141",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(
    payload.notification.title,
    {
      body: payload.notification.body,

      icon: "/everlast-logo.png",

      badge: "/badge.png",

      image: "/banner.png",

      vibrate: [200, 100, 200],

      requireInteraction: true,

      data: {
        url: "/orders",
      },
    }
  );

  self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.openWindow("/orders")
  );
});
});