import { useState, useEffect } from 'react';
import { settingsService } from '../services/settingsService';

const getScheduleStatus = (settings) => {
  // Kalau admin paksa override
  if (settings.openOverride) {
    return {
      isOpen: settings.isOpen,
      nextOpenText: settings.isOpen ? '' : 'Toko sedang tutup sementara',
      schedule: { open: settings.weekdayOpen, close: settings.weekdayClose },
    };
  }

  const now = new Date();
  const day = now.getDay();
  const currentTime = now.getHours() + now.getMinutes() / 60;
  const isWeekend = day === 0 || day === 6;

  const schedule = isWeekend
    ? { open: settings.weekendOpen, close: settings.weekendClose }
    : { open: settings.weekdayOpen, close: settings.weekdayClose };

  const isOpen = currentTime >= schedule.open && currentTime < schedule.close;

  let nextOpenText = '';
  if (!isOpen) {
    if (currentTime < schedule.open) {
      nextOpenText = `Buka jam ${schedule.open}.00`;
    } else {
      const nextDay = (day + 1) % 7;
      const nextIsWeekend = nextDay === 0 || nextDay === 6;
      const nextOpen = nextIsWeekend ? settings.weekendOpen : settings.weekdayOpen;
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      nextOpenText = `Buka ${days[nextDay]} jam ${nextOpen}.00`;
    }
  }

  return { isOpen, nextOpenText, schedule };
};

const DEFAULT_SETTINGS = {
  openOverride: false,
  isOpen: true,
  weekdayOpen: 8,
  weekdayClose: 20,
  weekendOpen: 8,
  weekendClose: 21,
};

export const useStoreStatus = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [status, setStatus] = useState(() => getScheduleStatus(DEFAULT_SETTINGS));

  // Subscribe ke Firestore settings
  useEffect(() => {
    const unsub = settingsService.subscribe((data) => {
      setSettings(data);
      setStatus(getScheduleStatus(data));
    });
    return unsub;
  }, []);

  // Update setiap menit untuk jadwal otomatis
  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(getScheduleStatus(settings));
    }, 60000);
    return () => clearInterval(interval);
  }, [settings]);

  return status;
};
