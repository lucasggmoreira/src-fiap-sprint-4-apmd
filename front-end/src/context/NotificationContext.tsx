import { createContext, useCallback, useContext, useMemo, useRef, useState, ReactNode } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

export type NotificationType = 'success' | 'error' | 'info';

interface NotificationContextValue {
  notifySuccess: (message: string) => void;
  notifyError: (message: string) => void;
  notifyInfo: (message: string) => void;
  clear: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

const HIDE_DELAY = 4000;

type NotificationProviderProps = {
  children: ReactNode;
};

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [message, setMessage] = useState<string | null>(null);
  const [type, setType] = useState<NotificationType>('info');
  const [visible, setVisible] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    Animated.timing(opacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      setMessage(null);
    });
  }, [opacity]);

  const show = useCallback(
    (text: string, tone: NotificationType) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      setMessage(text);
      setType(tone);
      setVisible(true);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      timerRef.current = setTimeout(() => {
        hide();
      }, HIDE_DELAY);
    },
    [hide, opacity]
  );

  const notifySuccess = useCallback((text: string) => show(text, 'success'), [show]);
  const notifyError = useCallback((text: string) => show(text, 'error'), [show]);
  const notifyInfo = useCallback((text: string) => show(text, 'info'), [show]);

  const clear = useCallback(() => {
    hide();
  }, [hide]);

  const value = useMemo(
    () => ({
      notifySuccess,
      notifyError,
      notifyInfo,
      clear,
    }),
    [notifySuccess, notifyError, notifyInfo, clear]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {visible && message && (
        <Animated.View style={[styles.container, styles[type], { opacity }]}>
          <View style={styles.messageWrapper}>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        </Animated.View>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 999,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  messageWrapper: {
    alignItems: 'center',
  },
  messageText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  success: {
    backgroundColor: '#34C759',
  },
  error: {
    backgroundColor: '#FF3B30',
  },
  info: {
    backgroundColor: '#007AFF',
  },
});
