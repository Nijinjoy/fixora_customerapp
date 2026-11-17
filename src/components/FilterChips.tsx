import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import type { ScrollViewInstance } from 'react-native';
import { colors, gradients, shadow } from '../theme/colors';

export type Chip = {
  id: string;
  label: string;
};

type Props = {
  chips: Chip[];
  selectedId: string;
  onSelect: (id: string) => void;
  horizontalInset: number;
};

export function FilterChips({
  chips,
  selectedId,
  onSelect,
  horizontalInset,
}: Props) {
  const scrollRef = useRef<ScrollViewInstance>(null);
  const positions = useRef<Record<string, number>>({});
  const [laidOut, setLaidOut] = useState(false);

  // Bring the selected chip into view, e.g. when opened from a service tile.
  useEffect(() => {
    const x = positions.current[selectedId];
    if (laidOut && x !== undefined) {
      scrollRef.current?.scrollTo({
        x: Math.max(0, x - horizontalInset),
        animated: true,
      });
    }
  }, [selectedId, laidOut, horizontalInset]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        styles.row,
        { paddingHorizontal: horizontalInset },
      ]}
      style={styles.scroll}
    >
      {chips.map((chip, index) => {
        const selected = chip.id === selectedId;
        return (
          <Pressable
            key={chip.id}
            onPress={() => onSelect(chip.id)}
            onLayout={event => {
              positions.current[chip.id] = event.nativeEvent.layout.x;
              if (index === chips.length - 1) {
                setLaidOut(true);
              }
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={[styles.chip, selected ? styles.selected : styles.idle]}
          >
            <Text style={[styles.label, selected && styles.selectedLabel]}>
              {chip.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Keep the full chip height: a ScrollView shrinks by default when the
  // list below it is taller than the screen, which cut off the chips.
  scroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  row: {
    gap: 10,
    paddingVertical: 8,
  },
  chip: {
    height: 42,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  idle: {
    backgroundColor: colors.surface,
    boxShadow: shadow.card,
  },
  selected: {
    experimental_backgroundImage: gradients.primaryButton,
  },
  label: {
    fontSize: 13,
    color: colors.text,
  },
  selectedLabel: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
});
