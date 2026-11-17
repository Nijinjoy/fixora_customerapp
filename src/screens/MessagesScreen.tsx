import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search } from 'lucide-react-native';
import { Avatar } from '../components/Avatar';
import { findProvider } from '../data/home';
import { formatListTime, useThreads } from '../data/messages';
import type { TabScreenProps } from '../navigation/types';
import { colors, gradients, shadow } from '../theme/colors';

const GUTTER = 18;

export function MessagesScreen({ navigation }: TabScreenProps<'Messages'>) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const threads = useThreads();

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase();
    return Object.values(threads)
      .flatMap(thread => {
        const provider = findProvider(thread.providerId);
        const last = thread.messages[thread.messages.length - 1];
        return provider && last
          ? [{ provider, last, unread: thread.unread }]
          : [];
      })
      .filter(
        row =>
          !term ||
          row.provider.name.toLowerCase().includes(term) ||
          row.provider.category.toLowerCase().includes(term),
      )
      .sort((a, b) => b.last.sentAt - a.last.sentAt);
  }, [threads, query]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 12 }]}>
      <Text style={styles.title}>Messages</Text>

      <View style={styles.search}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search messages..."
          placeholderTextColor={colors.textMuted}
          style={styles.searchText}
        />
        <Search size={20} color={colors.text} strokeWidth={1.8} />
      </View>

      <FlatList
        data={rows}
        keyExtractor={row => row.provider.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 110 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() =>
              navigation.navigate('Chat', { providerId: item.provider.id })
            }
            accessibilityRole="button"
            accessibilityLabel={`Chat with ${item.provider.name}`}
          >
            <Avatar
              emoji={item.provider.avatar}
              size={52}
              background={item.provider.avatarBg}
              verified
            />
            <View style={styles.body}>
              <View style={styles.topLine}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.provider.name}
                </Text>
                <Text
                  style={[styles.time, item.unread > 0 && styles.unreadTime]}
                >
                  {formatListTime(item.last.sentAt)}
                </Text>
              </View>
              <Text style={styles.category}>{item.provider.category}</Text>
              <View style={styles.bottomLine}>
                <Text style={styles.preview} numberOfLines={1}>
                  {item.last.fromMe ? `You: ${item.last.text}` : item.last.text}
                </Text>
                {item.unread > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.unread}</Text>
                  </View>
                )}
              </View>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No conversations found.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    experimental_backgroundImage: gradients.screen,
  },
  title: {
    paddingHorizontal: GUTTER,
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  search: {
    marginTop: 16,
    marginHorizontal: GUTTER,
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    boxShadow: shadow.card,
  },
  searchText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    paddingVertical: 0,
  },
  list: {
    paddingHorizontal: GUTTER,
    paddingTop: 18,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: colors.surface,
    boxShadow: shadow.card,
  },
  body: {
    flex: 1,
  },
  topLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  name: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  time: {
    fontSize: 11,
    color: colors.textMuted,
  },
  unreadTime: {
    color: colors.primary,
    fontWeight: '600',
  },
  category: {
    marginTop: 2,
    fontSize: 11,
    color: colors.accent,
  },
  bottomLine: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  preview: {
    flex: 1,
    fontSize: 13,
    color: colors.textMuted,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  empty: {
    marginTop: 40,
    textAlign: 'center',
    fontSize: 14,
    color: colors.textMuted,
  },
});
