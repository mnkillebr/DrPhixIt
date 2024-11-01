import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Image, Platform, Switch } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import FeedbackControls from '@/components/FeebackControls';
import { useContext } from 'react';
import { ThemedSafeAreaView } from '@/components/ThemedSafeView';
import { ThemedView } from '@/components/ThemedView';
import DataSourcePicker from '@/components/DataSourcePicker';
import { SettingsContext } from '@/components/SettingsContext';
import Metronome from '@/components/Metronome';
import MetronomeSettings from '@/components/MetronomeSettings';

export default function TabTwoScreen() {
  const { settings, setSettings } = useContext(SettingsContext)

  return (
    <ThemedSafeAreaView className='flex-1'>
      <ThemedView className='mt-2 p-3'>
        <FeedbackControls
          settings={settings}
          onSettingsChange={setSettings}
        />
        <DataSourcePicker
          currentSource={settings.dataSource}
          onSourceChange={(source) => setSettings({...settings, dataSource: source})}
        />
        {/* <Metronome /> */}
        <MetronomeSettings
          currentSound={settings.sound}
          onSoundChange={(sound) => setSettings({...settings, sound})}
          volume={settings.volume}
          setVolume={(volume) => setSettings({...settings, volume})}
        />
      </ThemedView>
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
