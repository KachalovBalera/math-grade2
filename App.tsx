import React, { useState } from 'react';
import { StyleSheet, View, Platform, StatusBar, SafeAreaView } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { TopicId } from './src/types/math';

// Экраны
import { HomeScreen } from './src/screens/HomeScreen';
import { TopicsScreen } from './src/screens/TopicsScreen';
import { TenTransitionScreen } from './src/screens/TenTransitionScreen';
import { BracketsScreen } from './src/screens/BracketsScreen';
import { QuizScreen } from './src/screens/QuizScreen';
import { DailyTrainingScreen } from './src/screens/DailyTrainingScreen';
import { ErrorReviewScreen } from './src/screens/ErrorReviewScreen';
import { AchievementsScreen } from './src/screens/AchievementsScreen';
import { ParentDashboardScreen } from './src/screens/ParentDashboardScreen';
import { CurriculumSettingsScreen } from './src/screens/CurriculumSettingsScreen';

type ScreenName =
  | 'home'
  | 'topics'
  | 'tenTransition'
  | 'brackets'
  | 'quiz'
  | 'daily'
  | 'errors'
  | 'achievements'
  | 'parentDashboard'
  | 'curriculumSettings';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('home');
  const [screenParams, setScreenParams] = useState<any>({});

  const navigate = (screen: ScreenName, params?: any) => {
    setScreenParams(params || {});
    setCurrentScreen(screen);
  };

  const goHome = () => {
    setCurrentScreen('home');
    setScreenParams({});
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen
            onNavigate={(screen, params) => navigate(screen as ScreenName, params)}
          />
        );
      case 'topics':
        return (
          <TopicsScreen
            onBack={goHome}
            onSelectTopic={(topicId: TopicId) => {
              if (topicId === 'tenTransition') {
                navigate('tenTransition');
              } else if (topicId === 'brackets') {
                navigate('brackets');
              } else {
                navigate('quiz', { topicId });
              }
            }}
          />
        );
      case 'tenTransition':
        return <TenTransitionScreen onBack={goHome} />;
      case 'brackets':
        return <BracketsScreen onBack={goHome} />;
      case 'quiz':
        return (
          <QuizScreen
            topicId={screenParams.topicId || 'numbers'}
            onBack={() => navigate('topics')}
          />
        );
      case 'daily':
        return (
          <DailyTrainingScreen
            onBack={goHome}
            onOpenCurriculum={() => navigate('curriculumSettings')}
          />
        );
      case 'errors':
        return <ErrorReviewScreen onBack={goHome} />;
      case 'achievements':
        return <AchievementsScreen onBack={goHome} />;
      case 'parentDashboard':
        return (
          <ParentDashboardScreen
            onBack={goHome}
            onOpenCurriculum={() => navigate('curriculumSettings')}
          />
        );
      case 'curriculumSettings':
        return <CurriculumSettingsScreen onBack={goHome} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ExpoStatusBar style="dark" />
      <View style={styles.container}>{renderScreen()}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});
