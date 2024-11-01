import { StyleSheet, Switch, View, } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { Picker } from '@react-native-picker/picker';
import { useColorScheme } from "@/hooks/useColorScheme";

type DataSourcePickerProps = {
  currentSource: string;
  onSourceChange: (source: string) => void;
}

const DATA_SOURCES_NAMES = [
  "Surgeon_1_Trial_1",
  "Surgeon_1_Trial_2",
  "Surgeon_1_Trial_3",
  "Surgeon_1_Trial_4",
  "Surgeon_2_Trial_1",
  "Surgeon_2_Trial_2",
  "Surgeon_2_Trial_3",
]

export default function DataSourcePicker({ currentSource, onSourceChange }: DataSourcePickerProps) {
  const colorScheme = useColorScheme();
  return (
    <View style={styles.pickerContainer}>
      <ThemedText style={styles.title}>Select Data Source</ThemedText>
      <Picker
        selectedValue={currentSource}
        onValueChange={onSourceChange}
        // enabled={!disabled}
        style={styles.picker}
        prompt="Select Data Source"
      >
        {DATA_SOURCES_NAMES.map((sourceName) => (
          <Picker.Item 
            key={sourceName} 
            label={sourceName} 
            value={sourceName}
            color={colorScheme === 'dark' ? "hsl(0, 0%, 100%)" : "hsl(0, 0%, 20%)"}
          />
        ))}
      </Picker>
    </View>
  )
}

const styles = StyleSheet.create({
  pickerContainer: {},
  picker: {
    // backgroundColor: "#fff"
    marginTop: -20,
    paddingHorizontal: 8
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 16
  }
});
