import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

type MetronomeProps = {};

const Metronome: React.FC<MetronomeProps> = () => {
  const [tempo, setTempo] = useState<number>(60); // BPM
  const [volume, setVolume] = useState<number>(1.0); // Volume (0.0 - 1.0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const getBeatSound = (level: number) => {
    switch (level) {
      case 2:
        return require('@/assets/sounds/red-beep.mp3'); // Higher pitch sound
      case 1:
        return require('@/assets/sounds/short-beep.mp3'); // Mid pitch sound
      case 0:
        return require('@/assets/sounds/electro_beep.mp3'); // Lower pitch sound
      default:
        return require('@/assets/sounds/electro_beep.mp3'); // Lower pitch sound
    }
  };

  const playBeat = async (level: number) => {
    const { sound } = await Audio.Sound.createAsync(
      getBeatSound(level),
      { volume: volume, shouldPlay: true }
    );
    setSound(sound);
    await sound.playAsync();
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => playBeat(0), (60 / tempo) * 1000); // default level 1
    } else {
      clearInterval(timer);
      if (sound) {
        sound.stopAsync();
        sound.unloadAsync();
      }
    }
    return () => clearInterval(timer);
  }, [isPlaying, tempo, volume]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <ThemedView style={{ }}>
      <ThemedText>Tempo: {tempo} BPM</ThemedText>
      <Slider
        style={styles.slider}
        minimumValue={40}
        maximumValue={400}
        step={1}
        value={tempo}
        onValueChange={setTempo}
      />
      <ThemedText>Volume: {Math.round(volume * 100)}%</ThemedText>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={1}
        step={0.1}
        value={volume}
        onValueChange={setVolume}
      />
      <View style={{ backgroundColor: "white", height: 40}}>
        <Button title={isPlaying ? "Stop" : "Start"} onPress={togglePlay} />
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  slider: {
    width: 200,
    height: 40,
  },
});

export default Metronome;