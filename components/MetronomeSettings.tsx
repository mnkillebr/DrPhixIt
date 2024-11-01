import { StyleSheet, Text, TouchableOpacity, View, } from "react-native";
import { ThemedText } from "./ThemedText";
import { Picker } from '@react-native-picker/picker';
import { useColorScheme } from "@/hooks/useColorScheme";
import Slider from "@react-native-community/slider";
import { Audio } from "expo-av";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type MetronomeSettingsProps = {
  currentSound: string;
  onSoundChange: (source: string) => void;
  volume: number;
  setVolume: (volume: number) => void;
}

const SOUND_NAMES = [
  "Scan",
  "Loud Beep",
  "Electronic",
  "GTA",
]

export default function MetronomeSettings({ currentSound, onSoundChange, volume, setVolume }: MetronomeSettingsProps) {
  const colorScheme = useColorScheme();

  const getBeatSound = (level: string) => {
    switch (level) {
      case "Loud Beep":
        return require('@/assets/sounds/red-beep.mp3'); // Higher pitch sound
      case "Scan":
        return require('@/assets/sounds/short-beep.mp3'); // Mid pitch sound
      case "Electronic":
        return require('@/assets/sounds/electro_beep.mp3'); // Lower pitch sound
      case "GTA":
        return require('@/assets/sounds/beep-select-sound-mp3.mp3'); // Lower pitch sound
      default:
        return require('@/assets/sounds/short-beep.mp3'); // Lower pitch sound
    }
  };

  const playBeat = async (level: string) => {
    const { sound } = await Audio.Sound.createAsync(
      getBeatSound(level),
      { volume: volume, shouldPlay: true }
    );
    await sound.playAsync();
  };

  return (
    <View style={styles.pickerContainer}>
      <ThemedText style={styles.title}>Select Sound</ThemedText>
      <Picker
        selectedValue={currentSound}
        onValueChange={onSoundChange}
        // enabled={!disabled}
        style={styles.picker}
        prompt="Select Sound"
      >
        {SOUND_NAMES.map((soundName) => (
          <Picker.Item 
            key={soundName} 
            label={soundName} 
            value={soundName}
            color={colorScheme === 'dark' ? "hsl(0, 0%, 100%)" : "hsl(0, 0%, 20%)"}
          />
        ))}
      </Picker>
      <View style={styles.soundTest}>
        <TouchableOpacity 
          style={styles.beepButton} 
          onPress={() => playBeat(currentSound)}
        >
          <Text style={{ color: "#1a73e8", fontWeight: "bold" }}>Test Sound</Text>
          <MaterialCommunityIcons
            name="play"
            size={24} 
            color="#1a73e8" 
          />
        </TouchableOpacity>
      </View>
      <View style={styles.volumeContainer}>
        <ThemedText style={styles.volumeTitle}>Volume:</ThemedText>
        <ThemedText>{Math.round(volume * 100)}%</ThemedText>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={1}
        step={0.1}
        value={volume}
        onValueChange={setVolume}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  beepButton: {
    padding: 12,
    backgroundColor: '#e5f0ff',
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center"
  },
  pickerContainer: {},
  picker: {
    // backgroundColor: "#fff"
    marginTop: -20,
    paddingHorizontal: 8
  },
  slider: {
    width: 200,
    height: 40,
    paddingHorizontal: 16,
  },
  soundTest: {
    flexDirection: "row",
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 16
  },
  volumeContainer: {
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 16
  },
  volumeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  }
});
