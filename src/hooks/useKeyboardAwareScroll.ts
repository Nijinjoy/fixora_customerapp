import type { ComponentRef } from 'react';
import { useCallback, useRef } from 'react';
import type { ScrollView } from 'react-native';
import { useKeyboardHeight } from './useKeyboardHeight';

export function useKeyboardAwareScroll() {
  const keyboardHeight = useKeyboardHeight();
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);

  const onContentSizeChange = useCallback(() => {
    if (keyboardHeight > 0) {
      scrollRef.current?.scrollToEnd({ animated: true });
    }
  }, [keyboardHeight]);

  return {
    keyboardHeight,
    keyboardOpen: keyboardHeight > 0,
    scrollRef,
    onContentSizeChange,
  };
}
