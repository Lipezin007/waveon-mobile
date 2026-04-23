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
  Switch,
  StatusBar,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../../contexts/AuthContext';
import { colors } from '../../theme/colors';
import { LanguageContext } from '../../contexts/LanguageContext';

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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
      await login(email, password, rememberMe);
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
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

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
            'rgba(0,0,0,0.30)',
            'rgba(0,0,0,0.62)',
            'rgba(0,0,0,0.90)',
          ]}
          style={styles.overlay}
        />

        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
                  placeholderTextColor={colors.placeholder}
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
                    placeholderTextColor={colors.placeholder}
                    secureTextEntry={secureText}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    value={password}
                    onChangeText={setPassword}
                    onSubmitEditing={handleLogin}
                  />

                  <TouchableOpacity
                    onPress={() => setSecureText(!secureText)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.toggleText}>
                      {secureText
                        ? t('common.show', 'Show')
                        : t('common.hide', 'Hide')}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.rememberRow}>
                  <Text style={styles.rememberText}>Lembrar de mim</Text>
                  <Switch
                    value={rememberMe}
                    onValueChange={setRememberMe}
                    trackColor={{ false: colors.switchTrackOff, true: colors.primary }}
                    thumbColor={colors.text}
                    ios_backgroundColor={colors.switchTrackOff}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.85}
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
                  activeOpacity={0.8}
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
    backgroundColor: colors.background,
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
    paddingVertical: 48,
  },
  content: {
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logo: {
    width: 132,
    height: 132,
    marginBottom: 14,
  },
  title: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 300,
  },
  form: {
    backgroundColor: colors.cardDark,
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    color: colors.label,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 4,
    letterSpacing: 0.2,
  },
  input: {
    height: 56,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingHorizontal: 16,
    color: colors.text,
    marginBottom: 14,
    fontSize: 15,
  },
  passwordWrapper: {
    minHeight: 56,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingHorizontal: 16,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    paddingVertical: 16,
  },
  toggleText: {
    color: colors.toggleText,
    fontWeight: '700',
    fontSize: 13,
  },
  rememberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
    marginTop: 2,
  },
  rememberText: {
    color: colors.rememberText,
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  registerLink: {
    alignItems: 'center',
  },
  footerText: {
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 14,
  },
  footerLink: {
    color: colors.toggleText,
    fontWeight: '800',
  },
});