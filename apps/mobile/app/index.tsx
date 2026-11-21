import { useEffect } from 'react';
import { LoadingMark } from '../src/components/ui';
import { replace } from '../src/navigation/go';
import WelcomeScreen from '../src/screens/WelcomeScreen';
import { useAppState } from '../src/state/AppState';

export default function Index() {
  const { hydrated, seenWelcome } = useAppState();

  useEffect(() => {
    if (hydrated && seenWelcome) replace('/(tabs)');
  }, [hydrated, seenWelcome]);

  if (!hydrated || seenWelcome) return <LoadingMark />;
  return <WelcomeScreen />;
}
