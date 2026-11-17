import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Phone, SendHorizontal } from 'lucide-react-native';
import { Avatar } from '../components/Avatar';
import { findProvider } from '../data/home';
import {
  type ChatMessage,
  formatClock,
  markRead,
  sendMessage,
  useThreads,
} from '../data/messages';
import type { RootScreenProps } from '../navigation/types';
import { colors, gradients, shadow } from '../theme/colors';

const GUTTER = 16;

export function ChatScreen({ navigation, route }: RootScreenProps<'Chat'>) {
  const { providerId } = route.params;
  const insets = useSafeAreaInsets();
  const provider = findProvider(providerId);
  const threads = useThreads();
  const messages = threads[providerId]?.messages ?? [];
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    markRead(providerId);
  }, [providerId, messages.length]);

  const goBack = () =>
    navigation.canGoBack()
      ? navigation.goBack()
      : navigation.navigate('Tabs', { screen: 'Messages' });

  const send = () => {
    const text = draft.trim();
    if (!text) {
      return;
    }
    sendMessage(providerId, text);
    setDraft('');
  };

  if (!provider) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.emptyText}>This chat could not be found.</Text>
      </View>
    );
  }

  const firstName = provider.name.split(' ')[0];

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={goBack}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={12}
        >
          <ArrowLeft size={24} color={colors.text} strokeWidth={2} />
        </Pressable>
        <Pressable
          style={styles.person}
          onPress={() => navigation.navigate('Profile', { providerId })}
          accessibilityRole="button"
          accessibilityLabel={`Open ${provider.name}'s profile`}
        >
          <Avatar
            emoji={provider.avatar}
            size={42}
            background={provider.avatarBg}
            verified
          />
          <View style={styles.personText}>
            <Text style={styles.name} numberOfLines={1}>
              {provider.name}
            </Text>
            <Text style={styles.status}>Online · {provider.category}</Text>
          </View>
        </Pressable>
        <Pressable
          style={styles.call}
          accessibilityRole="button"
          accessibilityLabel={`Call ${provider.name}`}
        >
          <Phone size={18} color={colors.primary} strokeWidth={2} />
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={message => message.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        onContentSizeChange={() =>
          listRef.current?.scrollToEnd({ animated: false })
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubbleRow,
              item.fromMe ? styles.mineRow : styles.theirsRow,
            ]}
          >
            <View
              style={[styles.bubble, item.fromMe ? styles.mine : styles.theirs]}
            >
              <Text style={[styles.text, item.fromMe && styles.mineText]}>
                {item.text}
              </Text>
            </View>
            <Text style={styles.time}>{formatClock(item.sentAt)}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <Avatar
              emoji={provider.avatar}
              size={72}
              background={provider.avatarBg}
            />
            <Text style={styles.emptyTitle}>Say hello to {firstName} 👋</Text>
            <Text style={styles.emptyText}>
              Ask about availability, pricing or anything else about your job.
            </Text>
          </View>
        }
      />

      <View
        style={[
          styles.composer,
          { paddingBottom: Math.max(insets.bottom, 12) },
        ]}
      >
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Type a message..."
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          multiline
          accessibilityLabel="Message"
        />
        <Pressable
          onPress={send}
          disabled={!draft.trim()}
          style={[styles.send, !draft.trim() && styles.sendDisabled]}
          accessibilityRole="button"
          accessibilityLabel="Send message"
        >
          <SendHorizontal size={20} color="#FFFFFF" strokeWidth={2} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    experimental_backgroundImage: gradients.screen,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: GUTTER,
    paddingBottom: 12,
    backgroundColor: colors.surface,
    boxShadow: shadow.card,
  },
  back: {
    height: 44,
    justifyContent: 'center',
  },
  person: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  personText: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  status: {
    marginTop: 2,
    fontSize: 12,
    color: colors.success,
  },
  call: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    padding: GUTTER,
    gap: 12,
  },
  bubbleRow: {
    maxWidth: '80%',
  },
  mineRow: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  theirsRow: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  mine: {
    borderBottomRightRadius: 6,
    experimental_backgroundImage: gradients.primaryButton,
  },
  theirs: {
    borderBottomLeftRadius: 6,
    backgroundColor: colors.surface,
    boxShadow: shadow.card,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
  mineText: {
    color: '#FFFFFF',
  },
  time: {
    marginTop: 4,
    marginHorizontal: 4,
    fontSize: 10,
    color: colors.textMuted,
  },
  emptyChat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    marginTop: 6,
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: GUTTER,
    paddingTop: 10,
    backgroundColor: colors.surface,
    boxShadow: '0px -6px 20px rgba(31, 52, 102, 0.06)',
  },
  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingTop: 13,
    paddingBottom: 13,
    borderRadius: 23,
    backgroundColor: colors.background,
    fontSize: 14,
    color: colors.text,
  },
  send: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    experimental_backgroundImage: gradients.primaryButton,
  },
  sendDisabled: {
    opacity: 0.5,
  },
});
