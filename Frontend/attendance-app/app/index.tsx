import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function SplashScreen() {
  const router = useRouter();
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(12)).current;
  const scale = useRef(new Animated.Value(0.96)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.03,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fade, slide, scale, pulse]);

  const onGetStarted = () => {
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <View style={styles.glow} />
      <View style={styles.ring} />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fade,
            transform: [{ translateY: slide }, { scale }],
          },
        ]}
      >
        <Text style={styles.kicker}>Welcome To</Text>
        <Text style={styles.title}>IdentifyHub</Text>
        <Text style={styles.subtitle}>~By CTPL</Text>

        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <Pressable style={styles.button} onPress={onGetStarted}>
            <Text style={styles.buttonText}>Get Started</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1410',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
    gap: 10,
  },
  kicker: {
    color: '#CFE7D6',
    fontSize: 14,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  title: {
    color: '#E9FFF1',
    fontSize: 44,
    letterSpacing: 1,
    fontWeight: '700',
  },
  subtitle: {
    color: '#8FD3A7',
    fontSize: 18,
    letterSpacing: 2,
  },
  button: {
    marginTop: 28,
    backgroundColor: '#21B66E',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 999,
    shadowColor: '#21B66E',
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    letterSpacing: 1,
    fontWeight: '600',
  },
  glow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#13391F',
    opacity: 0.6,
    top: '18%',
  },
  ring: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    borderWidth: 1,
    borderColor: '#1E3E2B',
    opacity: 0.6,
  },
});
