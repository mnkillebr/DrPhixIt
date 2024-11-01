import { StyleSheet, Switch, View, } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { SettingsContextType } from "./SettingsContext";
import { useColorScheme } from '@/hooks/useColorScheme';

type FeedbackControlProps = {
  settings: Partial<SettingsContextType['settings']>;
  onSettingsChange: (settings: Partial<SettingsContextType['settings']>) => void;
}

export default function FeedbackControls({ settings, onSettingsChange }: FeedbackControlProps) {
  const colorScheme = useColorScheme();
  return (
    <ThemedView style={colorScheme === 'dark' ? styles.feedbackControlsDark : styles.feedbackControls}>
      <ThemedText style={styles.feedbackTitle}>Feedback Settings</ThemedText>
      <View style={styles.feedbackOptions}>
        <View style={styles.feedbackOption}>
          <ThemedText>Vibration</ThemedText>
          <Switch
            value={settings.vibration}
            onValueChange={(value) => onSettingsChange({...settings, vibration: value})}
          />
        </View>
        <View style={styles.feedbackOption}>
          <ThemedText>Audio</ThemedText>
          <Switch
            value={settings.audio}
            onValueChange={(value) => onSettingsChange({...settings, audio: value})}
          />
        </View>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  feedbackControls: {
    width: '100%',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  feedbackControlsDark: {
    backgroundColor: 'hsl(240,3.7%,15.9%)',
    borderColor: 'hsl(240,3.8%,31.4%)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    // color: '#334155',
  },
  feedbackOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  feedbackOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
