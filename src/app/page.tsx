"use client";

import { ReaderSettingsProvider } from '@/contexts/ReaderSettingsContext';
import MainLayout from '@/components/layouts/MainLayout';
import '@/lib/pdfWorker'; // Configure PDF worker early

export default function Home() {
  return (
    <ReaderSettingsProvider>
      <MainLayout />
    </ReaderSettingsProvider>
  );
}
