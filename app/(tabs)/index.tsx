import React, { useEffect, useState, useRef, useContext } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Vibration, 
  TouchableOpacity,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card, Surface } from 'react-native-paper';
import { Audio } from 'expo-av';

// Import all data files
import data1 from '../../assets/force_data/S1_T1.json';
import data2 from '../../assets/force_data/S1_T2.json';
import data3 from '../../assets/force_data/S1_T3.json';
import data4 from '../../assets/force_data/S1_T4.json';
import data5 from '../../assets/force_data/S2_T1.json';
import data6 from '../../assets/force_data/S2_T2.json';
import data7 from '../../assets/force_data/S2_T3.json';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { SettingsContext, SettingsContextType } from '@/components/SettingsContext';
import { useColorScheme } from '@/hooks/useColorScheme';

const DATA_SOURCES = {
  "Surgeon_1_Trial_1": data1,
  "Surgeon_1_Trial_2": data2,
  "Surgeon_1_Trial_3": data3,
  "Surgeon_1_Trial_4": data4,
  "Surgeon_2_Trial_1": data5,
  "Surgeon_2_Trial_2": data6,
  "Surgeon_2_Trial_3": data7,
}

const FORCE_THRESHOLD = 0.08;
const WARNING_THRESHOLD = 0.05;
const MEDIUM_THRESHOLD = 0.06;
const HIGH_THRESHOLD = 0.07;
const POLLING_INTERVAL = 50; // 0.05 seconds in milliseconds

// Define vibration patterns for different force levels
const VIBRATION_PATTERNS = {
  warning: [0, 100],
  medium: [0, 200, 100, 200],
  high: [0, 300, 100, 300],
  critical: [0, 400, 200, 400, 200, 400]
};

// Define audio frequencies for different force levels
const AUDIO_FREQUENCIES = {
  warning: 200,  // Low frequency
  medium: 400,   // Medium frequency
  high: 600,     // High frequency
  critical: 800  // Highest frequency
};


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

// const generateBeep = async (frequency: number) => {
//   const { sound } = await Audio.Sound.createAsync(
//     null,
//     {
//       shouldPlay: true,
//       isLooping: false,
//       androidImplementation: 'OpenSLES',
//       ios: {
//         audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
//         playsInSilentModeIOS: true,
//       },
//       web: {
//         frequencyInHz: frequency,
//         type: 'sine',
//         durationInSeconds: 0.15,
//       },
//     }
//   );
  
//   await sound.playAsync();
//   setTimeout(async () => {
//     await sound.unloadAsync();
//   }, 200);
// };

const TemperatureBar = ({ force, maxForce, height }: { force: number; maxForce: number; height: number}) => {
  const fillPercentage = (force / maxForce) * 100;
  const barHeight = (height * fillPercentage) / 100;

  const getColor = (force: number) => {
    if (force <= WARNING_THRESHOLD) {
      return `rgb(0, ${Math.floor(150 + (force/WARNING_THRESHOLD) * 105)}, 255)`;
    } else if (force <= MEDIUM_THRESHOLD) {
      return `rgb(${Math.floor((force-WARNING_THRESHOLD)/(MEDIUM_THRESHOLD-WARNING_THRESHOLD) * 255)}, 
              ${Math.floor(200 + (force-WARNING_THRESHOLD)/(MEDIUM_THRESHOLD-WARNING_THRESHOLD) * 55)}, 
              ${Math.floor(255 - (force-WARNING_THRESHOLD)/(MEDIUM_THRESHOLD-WARNING_THRESHOLD) * 255)})`;
    } else if (force <= HIGH_THRESHOLD) {
      return `rgb(255, 
              ${Math.floor(255 - (force-MEDIUM_THRESHOLD)/(HIGH_THRESHOLD-MEDIUM_THRESHOLD) * 155)}, 
              0)`;
    } else {
      return `rgb(255, 
              ${Math.floor(100 - (force-HIGH_THRESHOLD)/(FORCE_THRESHOLD-HIGH_THRESHOLD) * 100)}, 
              0)`;
    }
  };

  return (
    <View style={styles.barContainer}>
      <View style={styles.scaleContainer}>
        {[FORCE_THRESHOLD, HIGH_THRESHOLD, MEDIUM_THRESHOLD, WARNING_THRESHOLD, 0].map((value) => (
          <ThemedText key={value} style={styles.scaleText}>
            {value.toFixed(2)} N
          </ThemedText>
        ))}
      </View>

      <View style={styles.barBackground}>
        <View style={[
          styles.barFill, 
          { 
            height: barHeight,
            backgroundColor: getColor(force),
          }
        ]} />
        
        <View style={[styles.threshold, { bottom: (WARNING_THRESHOLD/maxForce) * height }]} />
        <View style={[styles.threshold, { bottom: (MEDIUM_THRESHOLD/maxForce) * height }]} />
        <View style={[styles.threshold, { bottom: (HIGH_THRESHOLD/maxForce) * height }]} />
        <View style={[styles.threshold, { bottom: (FORCE_THRESHOLD/maxForce) * height }]} />
      </View>
    </View>
  );
};

const  triggerFeedback = async (force: number, feedbackSettings: Partial<SettingsContextType['settings']>, threshold: string) => {
  if (Platform.OS === 'web' && feedbackSettings.vibration) return;

  let alertMessage = null;
  let frequency = null;

  // if (force >= FORCE_THRESHOLD) {
  //   alertMessage = 'CRITICAL FORCE DETECTED';
  //   frequency = AUDIO_FREQUENCIES.critical;
  //   if (feedbackSettings.vibration) Vibration.vibrate(VIBRATION_PATTERNS.critical);
  // } else if (force >= HIGH_THRESHOLD) {
  //   alertMessage = 'HIGH FORCE DETECTED';
  //   frequency = AUDIO_FREQUENCIES.high;
  //   if (feedbackSettings.vibration) Vibration.vibrate(VIBRATION_PATTERNS.high);
  // } else if (force >= MEDIUM_THRESHOLD) {
  //   alertMessage = 'MEDIUM FORCE DETECTED';
  //   frequency = AUDIO_FREQUENCIES.medium;
  //   if (feedbackSettings.vibration) Vibration.vibrate(VIBRATION_PATTERNS.medium);
  // } else if (force >= WARNING_THRESHOLD) {
  //   alertMessage = 'WARNING: Force Increasing';
  //   frequency = AUDIO_FREQUENCIES.warning;
  //   if (feedbackSettings.vibration) Vibration.vibrate(VIBRATION_PATTERNS.warning);
  // }
  // console.log(threshold)
  if (threshold === "red") {
    alertMessage = 'CRITICAL FORCE DETECTED';
    frequency = AUDIO_FREQUENCIES.critical;
    if (feedbackSettings.vibration) Vibration.vibrate(VIBRATION_PATTERNS.critical);
  } else if (threshold === "yellow5") {
    alertMessage = 'HIGH FORCE DETECTED';
    frequency = AUDIO_FREQUENCIES.high;
    if (feedbackSettings.vibration) Vibration.vibrate(VIBRATION_PATTERNS.high);
  } else if (threshold === "yellow4") {
    alertMessage = 'MEDIUM FORCE DETECTED';
    frequency = AUDIO_FREQUENCIES.medium;
    if (feedbackSettings.vibration) Vibration.vibrate(VIBRATION_PATTERNS.medium);
  } else if (threshold === "yellow3") {
    alertMessage = 'WARNING: Force Increasing';
    frequency = AUDIO_FREQUENCIES.warning;
    if (feedbackSettings.vibration) Vibration.vibrate(VIBRATION_PATTERNS.warning);
  }
  return alertMessage;
};

const findClosestDataPoint = (currentTime: number, data: { Time: number, Force: number, label: string }[]) => {
  return data.reduce((closest, point) => {
    const currentDiff = Math.abs(point.Time - currentTime);
    const closestDiff = Math.abs(closest.Time - currentTime);
    return currentDiff < closestDiff ? point : closest;
  }, data[0]);
};

export default function App() {
  const { settings } = useContext(SettingsContext);
  const currentTheme = useColorScheme();
  const [currentForce, setCurrentForce] = useState<number | undefined>(undefined);
  const [lastAlert, setLastAlert] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [tempo, setTempo] = useState<number>(60); // BPM
  const [currentSound, setCurrentSound] = useState<Audio.Sound | null>(null)

  const startTimeRef = useRef<number | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const soundIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentDataRef = useRef(DATA_SOURCES[Object.keys(DATA_SOURCES)[0]]);

  useEffect(() => {
    // Reset and update data source when selection changes
    currentDataRef.current = DATA_SOURCES[settings.dataSource];
    resetPlayback();
  }, [settings.dataSource]);

  const updateForceReading = async () => {
    if (!startTimeRef.current || !isPlaying) return;
    
    const currentTime = (Date.now() - startTimeRef.current) / 1000;
    const data = currentDataRef.current;
    
    // Find closest data point in current dataset
    const closestPoint = findClosestDataPoint(currentTime, data);
    
    if (closestPoint) {
      setCurrentForce(closestPoint.Force);
      if (closestPoint.label === "red") {
        setTempo(400)
      } else if (closestPoint.label === "yellow5") {
        setTempo(300)
      } else if (closestPoint.label === "yellow4") {
        setTempo(200)
      } else if (closestPoint.label === "yellow3") {
        setTempo(150)
      }
      const alert = await triggerFeedback(closestPoint.Force, settings, closestPoint.label);
      if (alert) setLastAlert(alert);
      
      setElapsedTime(currentTime);
      
      // Check if we've reached the end of the current dataset
      if (currentTime > data[data.length - 1].Time) {
        setIsPlaying(false);
      }
    }
  };

  const playBeat = async (level: string) => {
    const { sound } = await Audio.Sound.createAsync(
      getBeatSound(level),
      { volume: settings.volume, shouldPlay: true }
    );
    setCurrentSound(sound);
    await sound.playAsync();
  };

  useEffect(() => {
    if (isPlaying) {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
      }
      if (settings.audio) {
        soundIntervalRef.current = setInterval(() => playBeat(settings.sound), (60 / tempo) * 1000); // default level 1
      }
      pollingIntervalRef.current = setInterval(updateForceReading, POLLING_INTERVAL);
    } else {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (soundIntervalRef.current) {
        clearInterval(soundIntervalRef.current);
      }
      if (currentSound) {
        currentSound.stopAsync();
        currentSound.unloadAsync();
      }
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (soundIntervalRef.current) {
        clearInterval(soundIntervalRef.current);
      }
    };
  }, [isPlaying, settings, tempo]);

  const resetPlayback = () => {
    setIsPlaying(false);
    setCurrentForce(undefined);
    setElapsedTime(0);
    setLastAlert(null);
    startTimeRef.current = null;
    
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    if (soundIntervalRef.current) {
      clearInterval(soundIntervalRef.current);
    }
    if (Platform.OS !== 'web') {
      Vibration.cancel();
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Force Feedback Monitor</ThemedText>
      <ThemedText style={styles.dataSource}>Data Source: {settings.dataSource}</ThemedText>
      <View style={styles.controlsContainer}>
        <View style={styles.controls}>
          <TouchableOpacity 
            style={styles.controlButton} 
            onPress={() => setIsPlaying(!isPlaying)}
          >
            <MaterialCommunityIcons 
              name={isPlaying ? "pause" : "play"} 
              size={24} 
              color="#1a73e8" 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.controlButton} 
            onPress={resetPlayback}
          >
            <MaterialCommunityIcons 
              name="refresh" 
              size={24} 
              color="#1a73e8" 
            />
          </TouchableOpacity>
        </View>
        
        <ThemedView style={styles.timeDisplay}>
          <Text style={styles.timeLabel}>Elapsed Time:</Text>
          <Text style={styles.timeValue}>{elapsedTime.toFixed(2)}s</Text>
        </ThemedView>
      </View>

      <ThemedView style={currentTheme === 'dark' ? styles.visualizationContainerDark : styles.visualizationContainer}>
        {currentForce ? (
          <TemperatureBar
            force={currentForce}
            maxForce={Math.max(FORCE_THRESHOLD + 0.02, currentForce)}
            height={300}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <ThemedText>Press play to start monitoring</ThemedText>
          </View>
        )}
      </ThemedView>

      <View
        style={
          currentTheme === 'dark' ? {
            ...styles.currentForce,
            backgroundColor: 'hsl(240,3.7%,15.9%)',
            borderColor: 'hsl(240,3.8%,31.4%)',
            borderWidth: 1,
          } : styles.currentForce
        }
      >
        <ThemedText style={styles.forceLabel}>Current Force:</ThemedText>
        <Text style={[
          styles.forceValue,
          currentForce ? { 
            color: currentForce >= FORCE_THRESHOLD ? '#dc2626' : 
                   currentForce >= HIGH_THRESHOLD ? '#ea580c' :
                   currentForce >= MEDIUM_THRESHOLD ? '#f59e0b' :
                   currentForce >= WARNING_THRESHOLD ? '#84cc16' : '#22c55e'
          } : currentTheme === 'dark' ? { color: '#fff' } : {},
        ]}>
          {currentForce ? currentForce.toFixed(4) : '0.0000'} N
        </Text>
      </View>

      {lastAlert && (
        <View style={[
          styles.alert,
          { 
            backgroundColor: lastAlert.includes('CRITICAL') ? '#fee2e2' :
                           lastAlert.includes('HIGH') ? '#ffedd5' :
                           lastAlert.includes('MEDIUM') ? '#fef3c7' : '#f0fdf4'
          }
        ]}>
          <Text style={styles.alertText}>{lastAlert}</Text>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#f8fafc',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    // color: '#0f172a',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  controlButton: {
    padding: 12,
    backgroundColor: '#e5f0ff',
    borderRadius: 25,
    marginHorizontal: 10,
  },
  visualizationContainer: {
    width: '100%',
    height: 350,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  visualizationContainerDark: {
    width: '100%',
    height: 350,
    backgroundColor: 'hsl(240,3.7%,15.9%)',
    borderColor: 'hsl(240,3.8%,31.4%)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  barContainer: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
  },
  scaleContainer: {
    height: '100%',
    justifyContent: 'space-between',
    paddingRight: 10,
  },
  scaleText: {
    fontSize: 12,
    // color: '#64748b',
  },
  barBackground: {
    width: 60,
    height: '100%',
    backgroundColor: '#f1f5f9',
    borderRadius: 30,
    overflow: 'hidden',
    position: 'relative',
  },
  barFill: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  threshold: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  currentForce: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '75%',
    marginVertical: 12,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  forceLabel: {
    fontSize: 18,
    marginRight: 10,
    // color: '#334155',
  },
  forceValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  alert: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  alertText: {
    fontSize: 16,
    fontWeight: '500',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsContainer: {
    width: '100%',
    marginBottom: 12,
  },
  timeDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  timeLabel: {
    fontSize: 16,
    color: '#64748b',
    marginRight: 8,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  feedbackControls: {
    width: '100%',
    backgroundColor: 'hsl(180, 10%, 20%)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 1 },
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
  dataSourceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingIcon: {
    marginLeft: 8,
  },
  dataSource: {
    marginBottom: 12
  }
});
