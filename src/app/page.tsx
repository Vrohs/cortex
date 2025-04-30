"use client";

import { ReaderSettingsProvider } from '@/contexts/ReaderSettingsContext';
import MainLayout from '@/components/layouts/MainLayout';

export default function Home() {
  return (
    <ReaderSettingsProvider>
      <MainLayout />
    </ReaderSettingsProvider>
  );
}
