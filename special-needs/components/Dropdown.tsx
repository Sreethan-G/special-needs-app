import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";

type Option = {
  label: string;
  value: string | number;
};

type DropdownProps = {
  options: Option[];
  placeholder?: string;
  onSelect?: (item: Option) => void;
};

const Dropdown: React.FC<DropdownProps> = ({
  options,
  placeholder = "Select an option",
  onSelect,
}) => {
  const [selected, setSelected] = useState<Option | null>(null);
  const [visible, setVisible] = useState(false);

  const handleSelect = (item: Option) => {
    setSelected(item);
    setVisible(false);
    if (onSelect) onSelect(item);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setVisible(!visible)}
        activeOpacity={0.7}
      >
        <Text style={styles.selectorText}>
          {selected ? selected.label : placeholder}
        </Text>
      </TouchableOpacity>

      {visible && (
        <View style={styles.dropdownContainer}>
          <FlatList
            data={options}
            keyExtractor={(item) => item.value.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.option}
                onPress={() => handleSelect(item)}
                activeOpacity={0.7}
              >
                <Text>{item.label}</Text>
              </TouchableOpacity>
            )}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    width: "100%",
    marginBottom: 10,
    marginTop: 0,
  },
  selector: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  selectorText: {
    fontSize: 16,
  },
  dropdownContainer: {
    marginTop: 5,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderColor: "#ccc",
    borderWidth: 1,
    maxHeight: 200,
  },
  option: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});

export default Dropdown;
