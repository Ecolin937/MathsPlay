export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return false;
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const scheduleDailyNotification = () => {
  if (Notification.permission !== 'granted') return;

  const now = new Date();
  const target = new Date();
  target.setHours(13, 30, 0, 0);

  if (now > target) {
    target.setDate(target.getDate() + 1);
  }

  const timeout = target.getTime() - now.getTime();

  setTimeout(() => {
    new Notification("C'est l'heure des maths ! 🧠", {
      body: "Viens relever tes défis quotidiens et gagne des points !",
      icon: "/favicon.ico"
    });
    // Reschedule for next day
    scheduleDailyNotification();
  }, timeout);
};
