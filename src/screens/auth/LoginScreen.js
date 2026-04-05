import { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../../contexts/AuthContext';
import { t } from '../../i18n';

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);

  const player = useVideoPlayer(
    require('../../../assets/videos/login-bg.mp4'),
    (player) => {
      player.loop = true;
      player.muted = true;
      player.play();
    }
  );

  async function handleLogin() {
    try {
      if (!email || !password) {
        Alert.alert(
          t('common.error', 'Error'),
          t('login.emptyFields', 'Please fill in email and password.')
        );
        return;
      }

      setLoading(true);
      await login(email, password);
    } catch (error) {
      Alert.alert(
        t('login.failed', 'Login failed'),
        error?.response?.data?.message ||
          t('login.invalidCredentials', 'Invalid email or password.')
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <VideoView
          player={player}
          style={styles.video}
          nativeControls={false}
          contentFit="cover"
          fullscreenOptions={{ enabled: false }}
          allowsPictureInPicture={false}
        />

        <LinearGradient
          colors={[
            'rgba(0,0,0,0.45)',
            'rgba(0,0,0,0.68)',
            'rgba(0,0,0,0.84)',
          ]}
          style={styles.overlay}
        />

        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <View style={styles.header}>
                <Image
                  source={require('../../../assets/images/logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />

                <Text style={styles.title}>{t('login.title', 'Train smarter')}</Text>
                <Text style={styles.subtitle}>
                  {t(
                    'login.subtitle',
                    'Log in and keep your workouts, nutrition and progress in sync.'
                  )}
                </Text>
              </View>

              <View style={styles.form}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('login.emailPlaceholder', 'Enter your email')}
                  placeholderTextColor="#8A8A8A"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  value={email}
                  onChangeText={setEmail}
                />

                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder={t('login.passwordPlaceholder', 'Enter your password')}
                    placeholderTextColor="#8A8A8A"
                    secureTextEntry={secureText}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    value={password}
                    onChangeText={setPassword}
                    onSubmitEditing={handleLogin}
                  />

                  <TouchableOpacity onPress={() => setSecureText(!secureText)}>
                    <Text style={styles.toggleText}>
                      {secureText
                        ? t('common.show', 'Show')
                        : t('common.hide', 'Hide')}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>{t('common.login', 'Login')}</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.registerLink}
                  onPress={() => navigation.navigate('Register')}
                >
                  <Text style={styles.footerText}>
                    {t('login.noAccount', 'Don’t have an account?')}{' '}
                    <Text style={styles.footerLink}>{t('login.signUp', 'Sign up')}</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  content: {
    paddingHorizontal: 22,
  },
  header: {
    alignItems: 'center',
    marginBottom: 22,
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    color: '#E0E0E0',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    maxWidth: 290,
  },
  form: {
    backgroundColor: 'rgba(8, 8, 8, 0.76)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 24,
    padding: 18,
    marginBottom: 24,
  },
  label: {
    color: '#E8E8E8',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 6,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 15,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  passwordWrapper: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    color: '#FFFFFF',
    paddingVertical: 14,
  },
  toggleText: {
    color: '#9BB0E8',
    fontWeight: '700',
  },
  button: {
    backgroundColor: '#6E86BC',
    paddingVertical: 17,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 14,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  registerLink: {
    marginTop: 2,
  },
  footerText: {
    color: '#D0D0D0',
    textAlign: 'center',
    fontSize: 14,
  },
  footerLink: {
    color: '#9BB0E8',
    fontWeight: '800',
  },
});