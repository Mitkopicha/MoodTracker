'use client';
import { useEffect } from 'react';
import { attachAutoSyncListeners } from '../lib/autoSync';

export default function AutoSyncBootstrap() {
  useEffect(() => { attachAutoSyncListeners(); }, []);
  return null;
}
