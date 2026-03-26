import * as Notifications from "expo-notifications";
import * as Device        from "expo-device";
import { doc, updateDoc } from "firebase/firestore";
import { db }             from "../config/firebase";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  true,
  }),
});

export async function registerForPushNotifications(userId) {
  if (!Device.isDevice) {
    console.warn("[notifications] Push notifications require a physical device.");
    return null;
  }
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    console.warn("[notifications] Permission denied.");
    return null;
  }
  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: "ec867eed-2166-468d-b6bc-7bbf943560a1",
  });
  const pushToken = tokenData.data;
  console.log("[notifications] Expo push token:", pushToken);
  if (userId) {
    try {
      await updateDoc(doc(db, "users", userId), { pushToken });
      console.log("[notifications] Token saved to Firestore.");
    } catch (err) {
      console.error("[notifications] Failed to save token:", err);
    }
  }
  await Notifications.setNotificationChannelAsync("storm-alerts", {
    name:             "Storm Alerts",
    importance:       Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor:       "#E07B2A",
    sound:            "default",
    description:      "Real-time severe weather alerts for your registered address",
  });
  return pushToken;
}

export function setupNotificationListeners(onNavigate) {
  const receivedSub = Notifications.addNotificationReceivedListener(notification => {
    console.log("[notifications] Received:", notification);
  });
  const responseSub = Notifications.addNotificationResponseReceivedListener(response => {
    const screen = response.notification.request.content.data?.screen;
    if (screen && onNavigate) onNavigate(screen);
  });
  return () => {
    receivedSub.remove();
    responseSub.remove();
  };
}
